'use server';

import { FieldValue, type UpdateData } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { adminFirestore } from './firebase-admin';
import { NICHE_FINDER_ACU_ACTIONS, type NicheFinderAcuActionKey } from '@/config/acuActions';

function getSpendableAcu(wallet: Record<string, unknown>, allowsFreeAcu: boolean): number {
  const paid = Number(wallet.paidAcuBalance ?? 0);
  const bonus = Number(wallet.bonusAcuBalance ?? 0);
  const admin = Number(wallet.adminAcuBalance ?? 0);
  const free = Number(wallet.freeAcuBalance ?? 0);

  if (allowsFreeAcu) {
    return Number(wallet.totalAvailableAcu ?? paid + bonus + admin + free);
  }

  return paid + bonus + admin;
}

function buildAcuDeductionUpdate(
  wallet: Record<string, unknown>,
  cost: number,
  allowsFreeAcu: boolean,
): UpdateData<Record<string, unknown>> {
  let remaining = cost;
  const balances = {
    paidAcuBalance: Number(wallet.paidAcuBalance ?? 0),
    bonusAcuBalance: Number(wallet.bonusAcuBalance ?? 0),
    adminAcuBalance: Number(wallet.adminAcuBalance ?? 0),
    freeAcuBalance: Number(wallet.freeAcuBalance ?? 0),
  };

  const buckets: Array<keyof typeof balances> = allowsFreeAcu
    ? ['paidAcuBalance', 'bonusAcuBalance', 'adminAcuBalance', 'freeAcuBalance']
    : ['paidAcuBalance', 'bonusAcuBalance', 'adminAcuBalance'];

  for (const bucket of buckets) {
    if (remaining <= 0) break;
    const take = Math.min(balances[bucket], remaining);
    balances[bucket] -= take;
    remaining -= take;
  }

  if (remaining > 0) {
    throw new Error(allowsFreeAcu ? 'INSUFFICIENT_ACUS' : 'INSUFFICIENT_PAID_ACUS');
  }

  return {
    ...balances,
    totalAvailableAcu: Number(wallet.totalAvailableAcu ?? 0) - cost,
    lifetimeAcuSpent: FieldValue.increment(cost),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function refundAcuCharge(userId: string, cost: number, allowsFreeAcu: boolean) {
  const walletRef = adminFirestore.collection('wallets').doc(userId);

  await adminFirestore.runTransaction(async (t) => {
    const walletDoc = await t.get(walletRef);
    if (!walletDoc.exists) return;

    const wallet = walletDoc.data()!;
    const updates: UpdateData<Record<string, unknown>> = {
      totalAvailableAcu: Number(wallet.totalAvailableAcu ?? 0) + cost,
      lifetimeAcuSpent: FieldValue.increment(-cost),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (allowsFreeAcu) {
      updates.freeAcuBalance = Number(wallet.freeAcuBalance ?? 0) + cost;
    } else {
      updates.paidAcuBalance = Number(wallet.paidAcuBalance ?? 0) + cost;
    }

    t.update(walletRef, updates);
  });
}

export async function handleBilledOperation<T>({
  userId,
  actionKey,
  aiOperation,
}: {
  userId: string;
  actionKey: NicheFinderAcuActionKey;
  aiOperation: (cost: number) => Promise<T>;
}) {
  const walletRef = adminFirestore.collection('wallets').doc(userId);
  const actionConfig = NICHE_FINDER_ACU_ACTIONS[actionKey];
  if (!actionConfig) throw new Error('INVALID_ACTION');
  const cost = actionConfig.cost;

  let charged = false;

  try {
    const { balanceAfter } = await adminFirestore.runTransaction(async (t) => {
      const walletDoc = await t.get(walletRef);
      if (!walletDoc.exists) throw new Error('Wallet not found.');
      const wallet = walletDoc.data()!;
      const spendable = getSpendableAcu(wallet, actionConfig.allowsFreeAcu);

      if (spendable < cost) {
        throw new Error(
          actionConfig.allowsFreeAcu ? 'INSUFFICIENT_ACUS' : 'INSUFFICIENT_PAID_ACUS',
        );
      }

      const walletUpdate = buildAcuDeductionUpdate(wallet, cost, actionConfig.allowsFreeAcu);
      t.update(walletRef, walletUpdate);

      return { balanceAfter: { totalAvailableAcu: walletUpdate.totalAvailableAcu as number } };
    });

    charged = true;
    const result = await aiOperation(cost);

    await adminFirestore.collection('acu_transactions').doc(uuidv4()).set({
      uid: userId,
      type: 'OPERATIONAL_TASK',
      featureType: actionKey,
      acusCharged: -cost,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { result, billingDetails: { finalCost: cost, balanceAfter } };
  } catch (error) {
    if (charged) {
      await refundAcuCharge(userId, cost, actionConfig.allowsFreeAcu);
    }
    throw error;
  }
}
