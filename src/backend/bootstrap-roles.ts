'use server';

import { cookies } from 'next/headers';
import { adminFirestore, adminAuth, isAdminConfigured } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveBootstrapAccount } from '@/config/bootstrap-accounts';
import { getProvisioningErrorMessage } from '@/firebase/auth/error-messages';
import { v4 as uuidv4 } from 'uuid';

function uniqueRoles(roles: string[]): string[] {
  return Array.from(new Set(roles));
}

function walletTotals(wallet: Record<string, unknown>) {
  const paid = Number(wallet.paidAcuBalance ?? 0);
  const bonus = Number(wallet.bonusAcuBalance ?? 0);
  const admin = Number(wallet.adminAcuBalance ?? 0);
  const free = Number(wallet.freeAcuBalance ?? 0);
  return { paid, bonus, admin, free, total: paid + bonus + admin + free };
}

async function grantBootstrapAcu(uid: string, acuGrant: number, note: string) {
  const walletRef = adminFirestore.collection('wallets').doc(uid);
  const walletDoc = await walletRef.get();

  if (!walletDoc.exists) {
    await walletRef.set({
      freeAcuBalance: 0,
      paidAcuBalance: 0,
      bonusAcuBalance: 0,
      adminAcuBalance: acuGrant,
      totalAvailableAcu: acuGrant,
      lifetimePurchasedAcu: 0,
      lifetimeFreeAcuGranted: 0,
      lifetimeAcuSpent: 0,
      baseCurrency: 'GBP',
      displayCurrency: 'GBP',
      welcomeBonusGranted: false,
      testAccountGranted: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminFirestore.collection('acu_transactions').doc(uuidv4()).set({
      uid,
      status: 'COMPLETED',
      type: 'TEST_ACCOUNT_CREDIT',
      featureType: 'bootstrap_test_account',
      acusCharged: acuGrant,
      balanceBefore: { totalAvailableAcu: 0 },
      balanceAfter: { totalAvailableAcu: acuGrant },
      note,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { granted: acuGrant };
  }

  const wallet = walletDoc.data() ?? {};
  const totals = walletTotals(wallet);
  const targetAdmin = Math.max(totals.admin, acuGrant);

  if (targetAdmin === totals.admin) {
    return { granted: 0 };
  }

  const delta = targetAdmin - totals.admin;
  const nextTotal = totals.paid + totals.bonus + targetAdmin + totals.free;

  await walletRef.update({
    adminAcuBalance: targetAdmin,
    totalAvailableAcu: nextTotal,
    testAccountGranted: true,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await adminFirestore.collection('acu_transactions').doc(uuidv4()).set({
    uid,
    status: 'COMPLETED',
    type: 'TEST_ACCOUNT_CREDIT',
    featureType: 'bootstrap_test_account_topup',
    acusCharged: delta,
    balanceBefore: { totalAvailableAcu: totals.total },
    balanceAfter: { totalAvailableAcu: nextTotal },
    note,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { granted: delta };
}

export async function applyBootstrapRoles(
  uid: string,
  email: string | null,
  password?: string
): Promise<{ applied: boolean; roles: string[]; acuGranted: number }> {
  const account = resolveBootstrapAccount(email, password);
  if (!account) {
    return { applied: false, roles: ['user'], acuGranted: 0 };
  }

  if (!isAdminConfigured()) {
    console.warn('[applyBootstrapRoles] Skipped — Firebase Admin is not configured.');
    return { applied: false, roles: account.roles, acuGranted: 0 };
  }

  const userRef = adminFirestore.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      email: email ?? account.email,
      displayName: account.label,
      photoURL: null,
      emailVerified: true,
      roles: account.roles,
      isTestAccount: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const { granted } = await grantBootstrapAcu(
      uid,
      account.acuGrant,
      `Test account credit for ${account.label}`
    );

    return { applied: true, roles: account.roles, acuGranted: granted };
  }

  const currentRoles = (userDoc.data()?.roles as string[] | undefined) ?? ['user'];
  const mergedRoles = uniqueRoles([...currentRoles, ...account.roles]);

  await userRef.update({
    roles: mergedRoles,
    isTestAccount: true,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const { granted } = await grantBootstrapAcu(
    uid,
    account.acuGrant,
    `Test account credit for ${account.label}`
  );

  return { applied: true, roles: mergedRoles, acuGranted: granted };
}

/** Re-apply test account roles for the signed-in user (recovery after a failed first signup). */
export async function repairBootstrapAccount(password: string) {
  const cookieStore = await cookies();
  const uid = cookieStore.get('userId')?.value;
  if (!uid) {
    return { ok: false as const, error: 'Not signed in.' };
  }

  try {
    const userRecord = await adminAuth.getUser(uid);
    const result = await applyBootstrapRoles(uid, userRecord.email ?? null, password);

    if (!result.applied) {
      return {
        ok: false as const,
        error: 'Invalid test account password or Firebase Admin is not configured.',
      };
    }

    return { ok: true as const, roles: result.roles, acuGranted: result.acuGranted };
  } catch (error) {
    return {
      ok: false as const,
      error: getProvisioningErrorMessage(error),
    };
  }
}
