'use client';

import { AdminDashboard } from '@/components/admin-dashboard';
import { useUser } from '@/firebase/auth/use-user';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { isAnyAdmin, isLoading: isRolesLoading } = useUserRoles();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/signin');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isRolesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAnyAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Access Denied. Sign up with the Admin demo account to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard />
    </div>
  );
}
