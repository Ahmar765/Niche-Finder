'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ADMIN_ROLES } from '@/config/bootstrap-accounts';

export function useUserRoles() {
  const { user, isLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemo(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isDocLoading } = useDoc(userRef);

  const roles = (userData?.roles as string[] | undefined) ?? [];

  const isAnyAdmin = roles.some((role) => ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]));
  const isSuperAdmin = roles.includes('super_admin');

  return {
    userData,
    roles,
    isAnyAdmin,
    isSuperAdmin,
    isLoading: isAuthLoading || isDocLoading,
  };
}
