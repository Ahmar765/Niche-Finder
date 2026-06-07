'use client';

import { GovDashboard } from '@/components/gov-dashboard';
import { useUser } from '@/firebase/auth/use-user';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function GovPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { isSuperAdmin, isLoading: isRolesLoading } = useUserRoles();
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

  if (!user || !isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Access Denied. Sign up with the Gov demo account to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GovDashboard />
    </div>
  );
}
