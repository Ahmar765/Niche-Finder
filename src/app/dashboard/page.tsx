'use client';

import { getCookie } from 'cookies-next';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase/provider';
import { useUser } from '@/firebase/auth/use-user';
import { UserDashboard } from '@/components/user-dashboard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const auth = useAuth();
  const { user, isLoading } = useUser();
  const sessionUserId = getCookie('userId');
  const isAuthenticated = Boolean(user || auth.currentUser || sessionUserId);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <p className="max-w-md text-muted-foreground">
          You need an account to access your dashboard.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!user && !auth.currentUser) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserDashboard />
    </div>
  );
}
