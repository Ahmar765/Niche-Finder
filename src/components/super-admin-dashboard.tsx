'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutGrid, ShieldCheck, Newspaper, TrendingUp, Briefcase,
  MessageSquare, Users, Activity, Save, Loader2, Bot, Zap,
  DollarSign, BrainCircuit, Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from '@/components/admin-dashboard';
import { SeoCommandCenter } from '@/components/seo-command-center';
import { GovDashboard } from '@/components/gov-dashboard';
import { useUser } from '@/firebase/auth/use-user';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useSeoLiveData } from '@/hooks/use-seo-live-data';
import { getPlatformAnalytics, type PlatformAnalyticsData } from '@/backend/analytics';
import { repairBootstrapAccount } from '@/backend/bootstrap-roles';
import { cn } from '@/shared/utils';
import { toast } from 'sonner';

export type SuperAdminSection = 'overview' | 'platform' | 'seo' | 'governance';

const NAV_ITEMS: { id: SuperAdminSection; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'overview', label: 'Command Overview', icon: LayoutGrid, description: 'Platform-wide KPIs and system status' },
  { id: 'platform', label: 'Platform Ops', icon: ShieldCheck, description: 'Support, blog, users, and ACU ledger' },
  { id: 'seo', label: 'SEO War Room', icon: TrendingUp, description: 'Content generation and organic visibility' },
  { id: 'governance', label: 'OS Governance', icon: Briefcase, description: 'Revenue, costs, and strategic oversight' },
];

const OverviewKpi = ({
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
  trend?: string;
}) => (
  <Card className="bg-gradient-to-br from-card to-secondary/10">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-3/4 mt-1" />
      ) : (
        <>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {trend && <p className="text-[9px] font-bold text-green-400 mt-1 uppercase tracking-wider">{trend}</p>}
        </>
      )}
    </CardContent>
  </Card>
);

function CommandOverview() {
  const { data: seoData, isLoading: seoLoading } = useSeoLiveData(true);
  const [govData, setGovData] = useState<PlatformAnalyticsData | null>(null);
  const [govLoading, setGovLoading] = useState(true);

  useEffect(() => {
    getPlatformAnalytics()
      .then(setGovData)
      .catch(() => setGovData(null))
      .finally(() => setGovLoading(false));
  }, []);

  const formatGbp = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewKpi title="Global Operators" value={(govData?.totalUsers ?? 0).toLocaleString()} icon={Users} isLoading={govLoading} trend="Registered users" />
        <OverviewKpi title="Platform Revenue" value={formatGbp(govData?.totalIncome ?? 0)} icon={DollarSign} isLoading={govLoading} trend="Lifetime GBP" />
        <OverviewKpi title="SEO Articles" value={seoData?.articles?.length ?? 0} icon={Newspaper} isLoading={seoLoading} trend={`${seoData?.publishedCount ?? 0} published`} />
        <OverviewKpi title="Indexing Rate" value={`${seoData?.indexingPercent ?? 0}%`} icon={Globe} isLoading={seoLoading} trend="SEO pipeline" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewKpi title="Intelligence Cost" value={`$${(govData?.totalProviderCost ?? 0).toFixed(2)}`} icon={BrainCircuit} isLoading={govLoading} />
        <OverviewKpi title="Operational Margin" value={formatGbp(govData?.profit ?? 0)} icon={TrendingUp} isLoading={govLoading} />
        <OverviewKpi title="SEO Impressions" value={(seoData?.totalViews ?? 0).toLocaleString()} icon={Activity} isLoading={seoLoading} />
        <OverviewKpi title="Semantic Clusters" value={seoData?.semanticClusterCount ?? 0} icon={Bot} isLoading={seoLoading} />
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
        <CardHeader className="pb-3 border-b border-primary/10">
          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center justify-between text-primary">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 animate-pulse" /> Super Admin Command Brief</div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">ALL SYSTEMS ONLINE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Platform Ops</span>
            <p className="text-[11px] font-medium">Manage support cases, blog posts, user ACU, and ledger from Platform Ops.</p>
          </div>
          <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> SEO War Room</span>
            <p className="text-[11px] font-medium">Generate SEO articles, publish content, and run social amplification campaigns.</p>
          </div>
          <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> OS Governance</span>
            <p className="text-[11px] font-medium">Monitor revenue, AI provider costs, and platform-wide adoption metrics.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SuperAdminDashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const { isAnyAdmin, isSuperAdmin, isLoading: isRolesLoading } = useUserRoles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [repairPassword, setRepairPassword] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);

  const section = (searchParams.get('section') as SuperAdminSection) || 'overview';
  const validSection = NAV_ITEMS.some((item) => item.id === section) ? section : 'overview';

  const setSection = (next: SuperAdminSection) => {
    router.replace(`/admin?section=${next}`, { scroll: false });
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/signin');
    }
  }, [user, isUserLoading, router]);

  const activeNav = useMemo(
    () => NAV_ITEMS.find((item) => item.id === validSection) ?? NAV_ITEMS[0],
    [validSection],
  );

  if (isUserLoading || isRolesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAnyAdmin) {
    const handleRepair = async () => {
      if (!repairPassword) return;
      setIsRepairing(true);
      const result = await repairBootstrapAccount(repairPassword);
      setIsRepairing(false);

      if (!result.ok) {
        toast.error('Activation failed', { description: result.error });
        return;
      }

      toast.success('Super Admin access activated', { description: 'Reloading your session…' });
      window.location.reload();
    };

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground max-w-md">
          Access denied. Sign in with the Super Admin account (<strong>admin@nichefinder.com</strong>), or activate access below.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Input
            type="password"
            placeholder="Super Admin password"
            value={repairPassword}
            onChange={(e) => setRepairPassword(e.target.value)}
          />
          <Button onClick={handleRepair} disabled={isRepairing || !repairPassword}>
            {isRepairing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate Super Admin access'}
          </Button>
        </div>
        <Button variant="outline" asChild>
          <Link href="/signin">Go to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              Super Admin OS
            </div>
            <h1 className="font-headline text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-xs text-muted-foreground">Unified platform, SEO, and governance control.</p>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  validSection === id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <Save className="h-3 w-3" />
              System Sync Active
            </div>
            <p className="text-[10px] text-muted-foreground">
              Role: {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <activeNav.icon className="h-5 w-5 text-primary" />
                {activeNav.label}
              </h2>
              <p className="text-sm text-muted-foreground">{activeNav.description}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
              <Activity className="h-3 w-3" />
              HEALTH: OPTIMAL
            </div>
          </div>

          {validSection === 'overview' && <CommandOverview />}
          {validSection === 'platform' && <AdminDashboard embedded defaultTab="support" />}
          {validSection === 'seo' && <SeoCommandCenter embedded />}
          {validSection === 'governance' && (
            isSuperAdmin ? (
              <GovDashboard embedded />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Governance requires Super Admin role. Use the repair flow or sign in with admin@nichefinder.com.
                </CardContent>
              </Card>
            )
          )}
        </main>
      </div>
    </div>
  );
}
