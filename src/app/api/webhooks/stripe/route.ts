
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminFirestore } from '@/backend/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ACU_TOP_UP_PACKAGES } from '@/config/acuPackages';
import { trackPlatformEvent } from '@/backend/actions';

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_API_KEY;
    if (!stripeKey) {
        throw new Error('Stripe API Key is not configured.');
    }
    const stripe = new Stripe(stripeKey);
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured.');
    }

    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const eventId = event.id;

      const uid = session.client_reference_id;
      if (!uid) {
        console.error('Missing UID in webhook metadata', { session });
        return NextResponse.json({ error: 'Missing required data in session metadata.' }, { status: 400 });
      }

      const acusToGrant = Number(session.metadata?.acus_to_grant || 0);
      const bonusAcusToGrant = Number(session.metadata?.bonus_acus_to_grant || 0);
      const packageId = session.metadata?.packageId || 'unknown';
      const selectedPackage = ACU_TOP_UP_PACKAGES.find(p => p.id === packageId);

      const amountPaid = (session.amount_total || 0) / 100;
      
      if (acusToGrant <= 0) {
        console.error('Invalid ACU amount in webhook metadata', { session });
        return NextResponse.json({ error: 'Invalid ACU amount in session metadata.' }, { status: 400 });
      }
      
      const walletRef = adminFirestore.collection('wallets').doc(uid);
      const eventDocRef = adminFirestore.collection('stripe_events').doc(eventId);
      const paymentRef = adminFirestore.collection('payments').doc(session.payment_intent as string || session.id);
      
      await adminFirestore.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventDocRef);
        if (eventDoc.exists) {
            console.log(`Webhook event ${eventId} already processed.`);
            return;
        }

        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists) {
          throw new Error(`Wallet for user ${uid} not found for top-up.`);
        }

        const wallet = walletDoc.data()!;
        const balanceBefore = {
            totalAvailableAcu: wallet.totalAvailableAcu || 0,
            paidAcuBalance: wallet.paidAcuBalance || 0,
            bonusAcuBalance: wallet.bonusAcuBalance || 0,
            freeAcuBalance: wallet.freeAcuBalance || 0,
            adminAcuBalance: wallet.adminAcuBalance || 0,
        };
        
        const newPaidBalance = (balanceBefore.paidAcuBalance || 0) + acusToGrant;
        const newBonusBalance = (balanceBefore.bonusAcuBalance || 0) + bonusAcusToGrant;
        const newTotalBalance = (balanceBefore.totalAvailableAcu || 0) + acusToGrant + bonusAcusToGrant;

        const balanceAfter = {
            ...balanceBefore,
            totalAvailableAcu: newTotalBalance,
            paidAcuBalance: newPaidBalance,
            bonusAcuBalance: newBonusBalance,
        };

        transaction.update(walletRef, {
          paidAcuBalance: FieldValue.increment(acusToGrant),
          bonusAcuBalance: FieldValue.increment(bonusAcusToGrant),
          totalAvailableAcu: FieldValue.increment(acusToGrant + bonusAcusToGrant),
          lifetimePurchasedAcu: FieldValue.increment(acusToGrant),
          updatedAt: FieldValue.serverTimestamp(),
        });

        const ledgerRef = adminFirestore.collection('acu_transactions').doc(uuidv4());
        transaction.set(ledgerRef, {
          uid,
          idempotencyKey: `stripe_${eventId}`,
          status: 'COMPLETED',
          type: 'PAYMENT_CREDIT',
          featureType: `top_up_${packageId}`,
          acusCharged: acusToGrant + bonusAcusToGrant,
          balanceBefore,
          balanceAfter,
          note: `${selectedPackage?.baseCurrency || 'GBP'} ${amountPaid.toFixed(2)} top-up via Stripe. Granted ${acusToGrant} paid + ${bonusAcusToGrant} bonus ACU.`,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.set(paymentRef, {
            uid,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            packageId: selectedPackage?.id,
            packageName: selectedPackage?.name,
            priceGBP: selectedPackage?.priceGBP || amountPaid,
            paidAcuAdded: acusToGrant,
            bonusAcuAdded: bonusAcusToGrant,
            totalAcuAdded: acusToGrant + bonusAcusToGrant,
            status: "succeeded",
            createdAt: FieldValue.serverTimestamp(),
            completedAt: FieldValue.serverTimestamp(),
        });

        transaction.set(eventDocRef, {
            uid: uid,
            status: 'processed',
            createdAt: FieldValue.serverTimestamp(),
        });
      });

      // Trigger OS Event
      await trackPlatformEvent(uid, 'payment.completed', {
          packageId,
          amountPaid,
          acusGranted: acusToGrant + bonusAcusToGrant
      });

      console.log(`Successfully granted ${acusToGrant + bonusAcusToGrant} ACU to user ${uid}.`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Stripe webhook failed: ${error.message}`);
    return NextResponse.json({ error: `Webhook handler failed: ${error.message}` }, { status: 400 });
  }
}
