'use server';

import { adminFirestore, isAdminConfigured } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { resolveBootstrapAccount, resolveBootstrapRoles } from '@/config/bootstrap-accounts';
import { applyBootstrapRoles } from '@/backend/bootstrap-roles';
import { ACU_SYSTEM } from '@/config/acuSystem';
import { syncUserMemory } from './actions';

const NEW_USER_PROMO_BONUS = ACU_SYSTEM.welcomeBonus.amount;

export type NewUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isVerified: boolean;
  password?: string;
};

export type InitializeNewUserResult =
  | { status: 'created'; initialBalance: number }
  | { status: 'exists' }
  | { status: 'skipped' }
  | { error: string };

export async function initializeNewUser(user: NewUser): Promise<InitializeNewUserResult> {
  if (!isAdminConfigured()) {
    console.warn('[initializeNewUser] Skipped — Firebase Admin credentials unavailable.');
    return { status: 'skipped' };
  }

  try {
    const userRef = adminFirestore.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await applyBootstrapRoles(user.uid, user.email, user.password);
      return { status: 'exists' };
    }

    const bootstrapAccount = resolveBootstrapAccount(user.email, user.password);
    const roles = bootstrapAccount?.roles ?? resolveBootstrapRoles(user.email, user.password) ?? ['user'];
    const isTestAccount = Boolean(bootstrapAccount);
    const promoBonus = isTestAccount ? 0 : NEW_USER_PROMO_BONUS;
    const testAcuGrant = bootstrapAccount?.acuGrant ?? 0;
    const initialBalance = isTestAccount ? testAcuGrant : promoBonus;
    const batch = adminFirestore.batch();

    batch.set(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.isVerified,
      roles,
      isTestAccount,
      createdAt: FieldValue.serverTimestamp(),
    });

    const walletRef = adminFirestore.collection('wallets').doc(user.uid);
    batch.set(walletRef, {
      freeAcuBalance: isTestAccount ? 0 : promoBonus,
      paidAcuBalance: 0,
      bonusAcuBalance: 0,
      adminAcuBalance: isTestAccount ? testAcuGrant : 0,
      totalAvailableAcu: initialBalance,
      lifetimePurchasedAcu: 0,
      lifetimeFreeAcuGranted: isTestAccount ? 0 : promoBonus,
      lifetimeAcuSpent: 0,
      baseCurrency: 'GBP',
      displayCurrency: 'GBP',
      welcomeBonusGranted: !isTestAccount,
      testAccountGranted: isTestAccount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(adminFirestore.collection('acu_transactions').doc(uuidv4()), {
      uid: user.uid,
      status: 'COMPLETED',
      type: isTestAccount ? 'TEST_ACCOUNT_CREDIT' : 'PROMO_CREDIT',
      featureType: isTestAccount ? 'bootstrap_test_account' : 'new_user_bonus',
      acusCharged: initialBalance,
      balanceBefore: { totalAvailableAcu: 0 },
      balanceAfter: { totalAvailableAcu: initialBalance },
      note: isTestAccount ? `Test account credit for ${bootstrapAccount?.label}` : 'Welcome bonus',
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    await syncUserMemory(user.uid, { action: 'onboarding_start', eventType: 'profile.updated' });

    return { status: 'created', initialBalance };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown provisioning error';
    return { error: message };
  }
}
