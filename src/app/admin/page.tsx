'use client';

import { AdminDashboard } from '@/components/admin-dashboard';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  const isAnyAdmin = useMemo(() => {
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

  if (!user || !isAnyAdmin) {
    // This part is now somewhat redundant due to the bypass but good to keep for when bypass is removed.
    return (
         <div className="flex h-screen items-center justify-center">
            <p>Access Denied. You must be an admin to view this page.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard />
    </div>
  );
}
