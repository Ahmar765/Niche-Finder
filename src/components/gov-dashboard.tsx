
'use client';

import { useState, useEffect } from 'react';
import { 
    Briefcase, LineChart, Users, DollarSign, BrainCircuit, TrendingUp, ShieldAlert,
    Bot, Info, ShieldCheck, Zap, Activity, Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPlatformAnalytics, type PlatformAnalyticsData } from '@/backend/analytics';
import { Skeleton } from './ui/skeleton';
import { ProviderCostChart } from './charts/provider-cost-chart';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { cn } from '@/shared/utils';

const StatCard = ({ title, value, icon: Icon, isLoading, format = (v: any) => v }: { title: string, value: any, icon: React.ElementType, isLoading: boolean, format?: (v: any) => string | number }) => (
    <Card className="bg-gradient-to-br from-card to-secondary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4 mt-1" /> : <div className="text-2xl font-bold tracking-tight">{format(value)}</div>}
        </CardContent>
    </Card>
);

const GovernanceIntelligenceWidget = ({ analytics }: { analytics: PlatformAnalyticsData | null }) => (
    <Card className="border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5">
        <CardHeader className="pb-3 border-b border-primary/10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center justify-between text-primary">
                <div className="flex items-center gap-2"><Bot className="h-4 w-4" /> Governance Insights</div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[8px] font-bold text-green-500">
                        <Save className="h-2.5 w-2.5" /> LEDGER SYNCED
                    </div>
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 rounded-lg border border-border/40 bg-background/50">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Info className="h-3 w-3" /> AI Strategic Insight</span>
                    <p className="text-[11px] font-medium leading-relaxed">Profitability margin is trending up as Discovery Core costs stabilize in Tier 2 markets.</p>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg border border-border/40 bg-background/50">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><ShieldAlert className="h-3 w-3 text-primary" /> AI Risk alert</span>
                    <p className="text-[11px] font-medium leading-relaxed">Intelligence unit cost in Cluster C is higher than projected. Routing calibration recommended.</p>
                </div>
            </div>
            
            <div className="p-4 rounded-xl border-2 border-primary bg-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-primary/5">
                <div className="space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase flex items-center gap-1.5"><Zap className="h-4 w-4 animate-pulse" /> AI Next Governance Action</span>
                    <p className="text-sm font-bold leading-tight">Execute operational margin optimization on Discovery Core 04.</p>
                </div>
                <div className="flex items-center gap-4 border-l border-primary/20 pl-4">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Confidence</span>
                        <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">HIGH (92%)</Badge>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Owner</span>
                        <span className="text-[10px] font-bold text-foreground">S-ADMIN</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

type GovDashboardProps = {
  embedded?: boolean;
};

export function GovDashboard({ embedded }: GovDashboardProps) {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const data = await getPlatformAnalytics();
              setAnalytics(data);
          } catch (e: any) {
              setError(e.message);
          } finally {
              setIsLoading(false);
          }
      };
      fetchData();
  }, []);

  const formatUsd = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatGbp = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  return (
    <div className="space-y-8">
      {!embedded && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-2">
                  <ShieldAlert className="h-3 w-3" />
                  RESTRICTED: SUPER ADMIN GOVERNANCE MODE
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Briefcase className="h-7 w-7" />
                  Venture OS Governance
              </h1>
              <p className="text-lg text-muted-foreground">
                  Strategic oversight of platform adoption and intelligence performance.
              </p>
          </div>
          <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500">
                  <Activity className="h-3.5 w-3.5" />
                  INTELLIGENCE NODES: ONLINE
              </div>
          </div>
        </div>
      )}

      {error && <Alert variant="destructive" className="border-red-500/50 bg-red-500/5"><AlertTitle>System Access Interrupted</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatCard title="Global Operators" value={analytics?.totalUsers ?? 0} icon={Users} isLoading={isLoading} format={(v) => v.toLocaleString()} />
           <StatCard title="Platform Revenue" value={analytics?.totalIncome ?? 0} icon={DollarSign} isLoading={isLoading} format={formatGbp} />
           <StatCard title="Intelligence Unit Cost" value={analytics?.totalProviderCost ?? 0} icon={BrainCircuit} isLoading={isLoading} format={formatUsd} />
           <StatCard title="Operational Margin" value={analytics?.profit ?? 0} icon={TrendingUp} isLoading={isLoading} format={formatGbp} />
        </div>

      <GovernanceIntelligenceWidget analytics={analytics} />

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" /> Intelligence Core Consumption
                </CardTitle>
                <CardDescription>Cost distribution across OS reasoning nodes.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[300px] w-full" /> : analytics && <ProviderCostChart data={analytics.costByProvider} />}
            </CardContent>
        </Card>
        
        <Card className="border-border/40 bg-secondary/10 border-dashed">
            <CardHeader>
                <CardTitle className="text-base font-bold">Adoption Velocity Monitor</CardTitle>
                <CardDescription>Predictive analytics for sector migration.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-4">
                <LineChart className="h-12 w-12 opacity-20" />
                <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Cognitive Calibration in Progress...</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
