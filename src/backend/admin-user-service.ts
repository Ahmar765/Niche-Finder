import { adminFirestore } from '@/backend/firebase-admin';
import { ADMIN_ROLES } from '@/config/bootstrap-accounts';

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const userDoc = await adminFirestore.collection('users').doc(userId).get();
  if (!userDoc.exists) return false;
  const roles = (userDoc.data()?.roles ?? []) as string[];
  return roles.some((role) => ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
}

export type AdminUserSearchResult = {
  id: string;
  email: string;
  displayName?: string;
  roles?: string[];
};

export async function searchUsersByEmail(email: string): Promise<AdminUserSearchResult[]> {
  const normalized = email.trim();
  if (!normalized) return [];

  const snapshot = await adminFirestore
    .collection('users')
    .where('email', '==', normalized)
    .limit(10)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: String(data.email ?? ''),
      displayName: typeof data.displayName === 'string' ? data.displayName : undefined,
      roles: Array.isArray(data.roles) ? data.roles : undefined,
    };
  });
}
