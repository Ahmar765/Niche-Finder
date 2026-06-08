
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Coins, Briefcase, History, TrendingUp, Search, Bot, 
    Zap, BrainCircuit, ShieldCheck, Database, LayoutGrid,
    TriangleAlert, ArrowUpRight, CircleCheckBig, Clock, Target, Info, 
    ArrowLeftRight, BadgeDollarSign, ShieldAlert, Rocket, Activity,
    Repeat, RefreshCw, Loader2, User as UserIcon, Save
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { EditProfileDialog } from './edit-profile-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Sheet, SheetContent } from './ui/sheet';
import { NicheDetailView } from './niche-detail-view';
import { ScoreBadge } from './ui/score-badge';
import { getUserLedgerEntries, getUserNicheResults, getUserSearchHistory, recalibrateVentureIntelligence } from '@/backend/actions';
import { initializeNewUser } from '@/backend/initialize-new-user';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { cn } from '@/shared/utils';
import { toast } from 'sonner';

const AutosaveStatusWidget = ({ status, version, lastSaved }: { status?: string, version?: number, lastSaved?: string }) => (
    <div className={cn(
        "flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-300",
        status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
    )}>
        <Save className={cn("h-3.5 w-3.5", status === 'saving' ? "animate-pulse" : "")} />
        <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                {status === 'saving' ? 'OS SYNCING...' : status === 'failed' ? 'SYNC ERROR' : 'OS SYNC ACTIVE'}
            </span>
            {version !== undefined && (
                <span className="text-[8px] opacity-70 font-mono mt-0.5">
                    V{version} • {lastSaved ? formatDistanceToNow(new Date(lastSaved), { addSuffix: true }) : 'Just now'}
                </span>
            )}
        </div>
    </div>
);

const KpiCard = ({ title, value, icon: Icon, isLoading, description, trend }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean, description?: string, trend?: string }) => (
    <Card className="bg-gradient-to-br from-card to-secondary/10 relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4 mt-1" /> : (
                <>
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    <div className="flex items-center justify-between mt-1">
                        {description && <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{description}</p>}
                        {trend && <span className="text-[9px] font-bold text-green-400 flex items-center gap-0.5"><TrendingUp className="h-2 w-2"/> {trend}</span>}
                    </div>
                </>
            )}
        </CardContent>
    </Card>
);

const IntelligenceWidgetPoint = ({ icon: Icon, label, value, colorClass, highlight }: { icon: any, label: string, value: string, colorClass?: string, highlight?: boolean }) => (
    <div className={cn("space-y-1.5 p-3 rounded-lg border transition-all duration-300", highlight ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5" : "bg-secondary/20 border-border/40 hover:border-border/60")}>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Icon className={cn("h-3.5 w-3.5", colorClass)} />
            {label}
        </div>
        <p className={cn("text-xs text-foreground leading-relaxed font-medium", highlight ? "font-bold text-primary text-sm" : "")}>{value}</p>
    </div>
);

export function UserDashboard() {
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();

    const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isRecalibrating, setIsRecalibrating] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(false);
    
    const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [nicheResults, setNicheResults] = useState<any[]>([]);
    const [isDashboardDataLoading, setIsDashboardDataLoading] = useState(true);

    const userRef = useMemo(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef);

    const walletRef = useMemo(() => (user && firestore ? doc(firestore, 'wallets', user.uid) : null), [user, firestore]);
    const { data: walletData, isLoading: isWalletLoading } = useDoc(walletRef);

    const memoryRef = useMemo(() => (user && firestore ? doc(firestore, 'user_memory', user.uid) : null), [user, firestore]);
    const { data: memoryData, isLoading: isMemoryLoading } = useDoc(memoryRef);

    const isProfileInitialized = Boolean(userData && walletData);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    setIsDashboardDataLoading(true);
                    const [ledger, searches, niches] = await Promise.all([
                        getUserLedgerEntries(),
                        getUserSearchHistory(),
                        getUserNicheResults(),
                    ]);
                    setLedgerEntries(ledger);
                    setSearchHistory(searches);
                    setNicheResults(niches);
                } catch (error) {
                    console.error("Dashboard error:", error);
                } finally {
                    setIsDashboardDataLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const unlockedProjects = useMemo(() => nicheResults?.filter((n: any) => n.is_unlocked) || [], [nicheResults]);

    const handleNicheClick = (nicheId: string) => {
        setSelectedNicheId(nicheId);
        setIsSheetOpen(true);
    };

    const handleRecalibrate = async () => {
        setIsRecalibrating(true);
        try {
            const result = await recalibrateVentureIntelligence();
            if (result && 'error' in result) throw new Error(result.error);
            toast.success('OS Sync Complete', { description: 'Intelligence cores recalibrated with latest behavioral signals.' });
        } catch (error: any) {
            toast.error('Recalibration Failed', { description: error.message });
        } finally {
            setIsRecalibrating(false);
        }
    };

    const handleRetrySetup = async () => {
        if (!user) return;

        setIsBootstrapping(true);
        try {
            const result = await initializeNewUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                isVerified: user.emailVerified,
            });

            if ('error' in result) {
                toast.error('Setup failed', { description: result.error });
            } else if (result.status === 'created') {
                toast.success('Account ready', {
                    description: `Your wallet is active with ${result.initialBalance} welcome ACU.`,
                });
            } else if (result.status === 'exists') {
                toast.info('Account already initialized');
            } else if (result.status === 'skipped') {
                const isLocal =
                    typeof window !== 'undefined' &&
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                toast.error('Server credentials missing', {
                    description: isLocal
                        ? 'Set GOOGLE_APPLICATION_CREDENTIALS in .env to your Firebase service account key, restart npm run dev, then retry.'
                        : 'Server provisioning is unavailable. Try again in a moment or sign out and back in.',
                });
            }
        } finally {
            setIsBootstrapping(false);
        }
    };

    const getAlertSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    if (!user) {
        if (isUserLoading) {
            return (
                <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            );
        }
        return null;
    }

    return (
        <>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-2xl w-full p-0">
                {selectedNicheId && <NicheDetailView nicheId={selectedNicheId} />}
                </SheetContent>
            </Sheet>

            <div className="space-y-8 pb-20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                                <BrainCircuit className="h-3 w-3" />
                                VENTURE OS: LEARNING LOOP ACTIVE
                            </div>
                            <AutosaveStatusWidget 
                                status={memoryData?.autosave?.status} 
                                version={memoryData?.autosave?.version} 
                                lastSaved={memoryData?.autosave?.lastSavedAt} 
                            />
                        </div>
                        <h1 className="font-headline text-2xl sm:text-3xl font-bold">Command Center: {userData?.displayName || 'Operator'}</h1>
                    </div>
                    <div className="flex gap-2">
                        <EditProfileDialog currentUserProfile={{ displayName: userData?.displayName ?? null, photoURL: userData?.photoURL ?? null, country: userData?.country, bio: userData?.bio }} />
                        <Button asChild><Link href="/search"><Search className="mr-2 h-4 w-4" /> Start OS Search</Link></Button>
                    </div>
                </div>

                {!isUserDataLoading && !isWalletLoading && !isProfileInitialized && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-amber-200">Account setup incomplete</p>
                                <p className="text-xs text-muted-foreground max-w-2xl">
                                    Sign-in succeeded, but your wallet and venture profile still need to be created on the server.
                                    Click <strong className="text-amber-200/90">Retry setup</strong> to finish provisioning.
                                </p>
                                {typeof window !== 'undefined' &&
                                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
                                    <>
                                        <p className="text-xs text-muted-foreground max-w-2xl">
                                            Local development only: Firebase Admin needs a service account key.
                                        </p>
                                        <ol className="text-xs text-muted-foreground max-w-2xl list-decimal list-inside space-y-1">
                                            <li>Open Firebase Console → project <strong className="text-amber-200/90">niche-finder-56a34</strong> → Settings → Service accounts</li>
                                            <li>Generate new private key and save it in the project root (e.g. <code className="text-amber-200/80">niche-finder-56a34-firebase-adminsdk-....json</code>)</li>
                                            <li>In <code className="text-amber-200/80">.env</code>, set <code className="text-amber-200/80">GOOGLE_APPLICATION_CREDENTIALS=./your-key-file.json</code></li>
                                            <li>Restart <code className="text-amber-200/80">npm run dev</code>, then click Retry setup</li>
                                        </ol>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted-foreground max-w-2xl">
                                        On the live site this runs automatically. If Retry setup still fails, sign out and sign back in, or contact support.
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-500 text-white"
                                    onClick={handleRetrySetup}
                                    disabled={isBootstrapping}
                                >
                                    {isBootstrapping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Retry setup
                                </Button>
                                <Button variant="outline" size="sm" className="border-amber-500/30" asChild>
                                    <Link href="/search">Browse Search (preview)</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title="Wallet Balance" value={`${walletData?.totalAvailableAcu?.toLocaleString() || 0} ACU`} icon={Coins} isLoading={isWalletLoading} description="Available Credits" />
                    <KpiCard title="Venture Assets" value={unlockedProjects.length} icon={Briefcase} isLoading={isDashboardDataLoading} description="Unlocked Repositories" trend="+1 this week" />
                    <KpiCard title="System Activity" value={searchHistory.length} icon={History} isLoading={isDashboardDataLoading} description="Engine Runs" />
                    <KpiCard title="Learning Signals" value={`${memoryData?.behaviour?.editedOutputCount || 0}`} icon={Zap} isLoading={isWalletLoading} description="User Corrections" trend="Syncing" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-primary/10">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                                        <Bot className="h-4 w-4 text-primary" />
                                        OS Predictive Intelligence Report
                                    </CardTitle>
                                    {memoryData && (
                                        <div className="flex items-center gap-2">
                                             <ScoreBadge score={memoryData.intelligence.confidenceLevel === 'high' ? 9 : memoryData.intelligence.confidenceLevel === 'medium' ? 6 : 3} className="text-[10px]" />
                                             <Badge variant="outline" className="text-[9px] font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
                                                CONFIDENCE: {memoryData.intelligence.confidenceLevel.toUpperCase()}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <CardDescription className="text-[10px]">Contextualized reasoning based on behavioral signal ingestion (Rule 13 & 15)</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                {isMemoryLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                        <Loader2 className="h-10 w-10 animate-spin mb-4 opacity-20 text-primary" />
                                        <p className="text-sm font-bold tracking-widest animate-pulse">SYNCING COGNITIVE CORES...</p>
                                    </div>
                                ) : memoryData ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <IntelligenceWidgetPoint icon={Info} label="AI Situation" value={memoryData.intelligence.situation} />
                                            <IntelligenceWidgetPoint icon={Target} label="AI Insight" value={memoryData.intelligence.insight} />
                                            <IntelligenceWidgetPoint icon={ShieldAlert} label="AI Risk Alert" value={memoryData.intelligence.risk} colorClass="text-amber-500" />
                                            <IntelligenceWidgetPoint icon={CircleCheckBig} label="AI Recommendation" value={memoryData.intelligence.recommendation} colorClass="text-green-500" />
                                        </div>

                                        <div className="p-5 rounded-xl bg-primary/10 border-2 border-primary/30 space-y-4 shadow-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                                    <Zap className="h-4 w-4 animate-pulse" />
                                                    AI Next Critical Action
                                                </div>
                                                <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">PRIORITY</Badge>
                                            </div>
                                            <p className="text-base font-bold text-foreground leading-tight">{memoryData.intelligence.nextAction}</p>
                                            <div className="flex items-center gap-6 text-[10px] text-muted-foreground font-bold tracking-widest border-t border-primary/20 pt-3">
                                                <div className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" /> OWNER: {memoryData.intelligence.owner.toUpperCase()}</div>
                                                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> DEADLINE: {memoryData.intelligence.deadline.toUpperCase()}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                                                <Database className="h-3.5 w-3.5 text-primary" /> Decision Intelligence Matrix
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <IntelligenceWidgetPoint icon={Rocket} label="Best Option" value={memoryData.intelligence.bestOption || "Initialize discovery."} highlight />
                                                <IntelligenceWidgetPoint icon={ArrowLeftRight} label="Alternative Path" value={memoryData.intelligence.alternativeOption || "N/A"} />
                                                <IntelligenceWidgetPoint icon={ShieldAlert} label="Risk of Inaction" value={memoryData.intelligence.riskOfInaction || "N/A"} colorClass="text-red-400" />
                                                <IntelligenceWidgetPoint icon={BadgeDollarSign} label="Commercial Impact" value={memoryData.intelligence.commercialImpact || "N/A"} colorClass="text-primary" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                        <Bot className="h-10 w-10 mb-4 opacity-20 text-primary" />
                                        <p className="text-sm font-bold tracking-widest">INTELLIGENCE CORE OFFLINE</p>
                                        <p className="text-xs mt-2 max-w-md">
                                            {isProfileInitialized
                                                ? 'Run a search or use Sync Command Center to generate your first intelligence report.'
                                                : 'Complete server setup to activate your venture intelligence profile and welcome credits.'}
                                        </p>
                                        {isProfileInitialized && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 text-[10px] font-bold uppercase tracking-wider h-8"
                                                onClick={handleRecalibrate}
                                                disabled={isRecalibrating}
                                            >
                                                {isRecalibrating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                                                Sync Command Center
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest"><Repeat className="h-4 w-4 text-purple-400" />Efficiency Hub</h3>
                                <Badge variant="secondary" className="text-[9px] font-bold tracking-widest bg-purple-500/10 text-purple-400 border-purple-500/20">REPETITION SCANNER ACTIVE</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(memoryData?.intelligenceMemory?.automationRecommendations?.length ?? 0) > 0 ? (
                                    (memoryData?.intelligenceMemory?.automationRecommendations ?? []).map((rec: any) => (
                                        <Card key={rec.id} className="border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer group">
                                            <CardContent className="p-4 flex gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 h-fit">
                                                    <Repeat className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="text-[8px] tracking-tighter uppercase bg-purple-500/10 text-purple-400 border-purple-500/20">
                                                            {rec.actionType}
                                                        </Badge>
                                                        <span className="text-[9px] font-bold text-green-400">Save {rec.potentialTimeSaving}</span>
                                                    </div>
                                                    <p className="text-xs font-bold leading-tight group-hover:text-purple-400 transition-colors">{rec.title}</p>
                                                    <p className="text-[10px] text-muted-foreground leading-snug">{rec.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground bg-secondary/5 rounded-xl border border-dashed">
                                        <Bot className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs">Scanning for automation shortcuts...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest"><Activity className="h-4 w-4" />Venture Health Monitor</h3>
                                <Badge variant="secondary" className="text-[9px] font-bold tracking-widest bg-blue-500/10 text-blue-400 border-blue-500/20">PROACTIVE SCAN ACTIVE</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(memoryData?.intelligenceMemory?.proactiveAlerts?.length ?? 0) > 0 ? (
                                    (memoryData?.intelligenceMemory?.proactiveAlerts ?? []).map((alert: any) => (
                                        <Card key={alert.id} className={cn("border border-border/40 transition-all hover:bg-secondary/10 shadow-sm", alert.severity === 'high' ? 'ring-1 ring-red-500/20' : '')}>
                                            <CardContent className="p-4 flex gap-3">
                                                <div className={cn("p-2 rounded-lg shrink-0 h-fit shadow-inner", 
                                                    alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                                                    alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                                                    'bg-blue-500/10 text-blue-500'
                                                )}>
                                                    <TriangleAlert className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className={cn("text-[8px] tracking-tighter uppercase", getAlertSeverityColor(alert.severity))}>
                                                            {alert.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[8px] text-muted-foreground font-medium">{formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true })}</span>
                                                    </div>
                                                    <p className="text-xs font-bold leading-tight">{alert.message}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground bg-secondary/5 rounded-xl border border-dashed">
                                        <ShieldCheck className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs">No viability issues detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest"><LayoutGrid className="h-4 w-4" />Venture Repositories</h3>
                                <Badge variant="secondary" className="text-[10px] font-bold tracking-widest">{unlockedProjects.length} ACTIVE</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {unlockedProjects.length > 0 ? unlockedProjects.map((niche: any) => (
                                    <Card key={niche.id} className="cursor-pointer group hover:border-primary/80 transition-all duration-300 bg-secondary/20 relative overflow-hidden shadow-md" onClick={() => handleNicheClick(niche.id)}>
                                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-4 w-4 text-primary" /></div>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="w-fit text-[8px] tracking-widest bg-primary/5 text-primary border-primary/20 mb-2">OS V1.2 REPOSITORY</Badge>
                                                <AutosaveStatusWidget status={niche.autosave?.status} version={niche.autosave?.version} lastSaved={niche.autosave?.lastSavedAt} />
                                            </div>
                                            <CardTitle className="text-base group-hover:text-primary transition-colors font-bold">{niche.niche.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{niche.niche.summary}</p>
                                            <div className="flex items-center justify-between">
                                                <ScoreBadge score={niche.scores.overallConfidenceScore} />
                                                <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-tighter"><CircleCheckBig className="h-3 w-3" /> SYNCED</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="text-center py-12 text-muted-foreground col-span-full bg-secondary/10 border border-dashed rounded-xl">
                                        <p className="text-sm font-medium">No active repositories detected.</p>
                                        <Button variant="link" className="mt-2 text-primary" asChild><Link href="/search">Execute Discovery Engine</Link></Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <Card className="shadow-2xl border-primary/10">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Venture Ledger
                                </CardTitle>
                                <CardDescription className="text-[10px]">Immutable audit trail of system actions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[550px] pr-4">
                                     <div className="space-y-6">
                                        {ledgerEntries?.map((entry: any) => (
                                            <div key={entry.id} className="relative pl-6 border-l border-muted group">
                                                <div className={cn("absolute left-[-5px] top-1 h-2 w-2 rounded-full", entry.acusCharged > 0 ? "bg-green-500" : "bg-primary")} />
                                                <p className="text-[10px] font-bold uppercase text-foreground group-hover:text-primary transition-colors leading-tight">{entry.note || entry.type}</p>
                                                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{entry.createdAt ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true }) : 'Syncing...'}</p>
                                                {entry.acusCharged !== 0 && (
                                                    <p className={`text-[10px] font-mono mt-1 font-bold ${entry.acusCharged > 0 ? 'text-green-400' : 'text-primary'}`}>
                                                         {entry.acusCharged > 0 ? '+' : ''}{entry.acusCharged} ACU
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20 shadow-inner">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                <RefreshCw className={cn("h-6 w-6 text-primary/40", isRecalibrating && "animate-spin")} />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Recalibrate Intelligence</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">Force an operational sync to ingest the latest behavioral signals.</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-[10px] font-bold uppercase tracking-wider h-8"
                                    onClick={handleRecalibrate}
                                    disabled={isRecalibrating}
                                >
                                    {isRecalibrating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                                    Sync Command Center
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
