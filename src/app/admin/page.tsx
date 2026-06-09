'use client';

import { Suspense } from 'react';
import { SuperAdminDashboard } from '@/components/super-admin-dashboard';
import { Loader2 } from 'lucide-react';

function AdminPageContent() {
  return <SuperAdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
