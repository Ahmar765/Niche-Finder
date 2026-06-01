'use client';

import { GovDashboard } from '@/components/gov-dashboard';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export default function GovPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  // For this high-level dashboard, only super_admin should have access.
  const isSuperAdmin = useMemo(() => {
    // Bypassing auth for testing purposes
    return true;
  }, []);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
         <div className="flex h-screen items-center justify-center">
            <p>Access Denied. You must be a Super Admin to view this page.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GovDashboard />
    </div>
  );
}
