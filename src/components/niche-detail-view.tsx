
"use client";

import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useLocale } from '@/i18n';
import { unlockNiche, generateProjectAsset, rejectNiche } from '@/backend/actions';
import { getAcuCost } from '@/config/acuActions';
import type { AssetType } from '@/ai/flows/generate-venture-asset-flow';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ScoreBadge } from './ui/score-badge';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Lock, Unlock, Loader2, Rocket, 
  Info, TrendingUp, Sparkles, TriangleAlert, 
  FileText, Zap, ChevronRight, CircleCheckBig, 
  Database, LayoutGrid, Hammer, ArrowLeftRight, BadgeDollarSign, 
  Target, ShieldCheck, Search, Clock, Bot, XCircle, User, Save,
  Activity
} from 'lucide-react';
import type { Recommendation, VentureProject } from '@nichefinder/domain-types';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/shared/utils';
import { getCurrencySettings } from '@/config/currencyConfig';

const NICHE_UNLOCK_COST = getAcuCost('unlock_full_opportunity');

const AutosaveStatusWidget = ({ status, version, lastSaved }: { status?: string, version?: number, lastSaved?: string }) => (
    <div className={cn(
        "flex items-center gap-2 px-2 py-0.5 rounded border transition-all duration-300",
        status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
    )}>
        <Save className={cn("h-3 w-3", status === 'saving' ? "animate-pulse" : "")} />
        <span className="text-[8px] font-bold uppercase tracking-widest">
            {status === 'saving' ? 'SYNCING...' : status === 'failed' ? 'SYNC ERR' : `SYNC ACTIVE V${version || 0}`}
        </span>
    </div>
);

type NicheDetailViewProps = {
  nicheId: string;
};

const DecisionIntelligenceItem = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass?: string }) => (
    <div className="space-y-1.5 p-3 rounded-lg border border-border/40 bg-background shadow-sm">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            <Icon className={cn("h-3 w-3", colorClass)} />
            {label}
        </div>
        <p className="text-xs text-foreground font-semibold leading-relaxed">{value}</p>
    </div>
);

const ExecutiveBriefItem = ({ icon: Icon, label, value, colorClass, borderClass }: { icon: any, label: string, value: string, colorClass?: string, borderClass?: string }) => (
    <div className={cn("space-y-1.5 p-3 rounded-lg border bg-secondary/10 transition-colors", borderClass || "border-border/40")}>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Icon className={cn("h-3.5 w-3.5", colorClass)} />
            {label}
        </div>
        <p className="text-xs text-foreground font-medium leading-relaxed">{value}</p>
    </div>
);

export function NicheDetailView({ nicheId }: NicheDetailViewProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [generatingAsset, setGeneratingAsset] = useState<AssetType | null>(null);
  const { toast } = useToast();
  const { t, formatCurrency } = useLocale();
  
  const { user } = useUser();
  const firestore = useFirestore();

  const nicheDocRef = useMemo(() => (firestore && nicheId ? doc(firestore, 'niche_results', nicheId) : null), [firestore, nicheId]);
  const nicheDoc = useDoc(nicheDocRef);
  const details = nicheDoc.data as Recommendation | null;
  const isNicheLoading = nicheDoc.isLoading;

  const projectDocRef = useMemo(() => (firestore && nicheId ? doc(firestore, 'venture_projects', nicheId) : null), [firestore, nicheId]);
  const projectDoc = useDoc(projectDocRef);
  const project = projectDoc.data as VentureProject | null;

  const isUnlocked = details?.is_unlocked || false;

  const currencySettings = useMemo(() => {
    return getCurrencySettings(details?.niche.countryCode);
  }, [details]);

  const handleUnlock = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: "Authentication Required", description: "You must be logged in to unlock niches." });
        return;
    }
    setIsUnlocking(true);
    try {
        const result = await unlockNiche(nicheId);
        if ('error' in result) throw new Error(result.error);
        toast({ title: t('toasts.unlockSuccess'), description: `Venture repository initialized.` });
    } catch (error: any) {
        toast({ variant: 'destructive', title: t('toasts.unlockFailed'), description: error.message });
    } finally {
        setIsUnlocking(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
        const result = await rejectNiche(nicheId, "Manual rejection for learning.");
        if ('error' in result) throw new Error(result.error);
        toast({ title: "Niche Rejected", description: "System intelligence calibrated." });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Rejection Failed", description: error.message });
    } finally {
        setIsRejecting(false);
    }
  };

  const handleBuildAsset = async (type: AssetType) => {
    setGeneratingAsset(type);
    try {
        const result = await generateProjectAsset(nicheId, type);
        if ('error' in result) throw new Error(result.error);
        
        sonnerToast.success('Asset Generated!', {
            description: `${result.asset?.title} has been added to your project repository.`,
        });
    } catch (error: any) {
        sonnerToast.error('Production Error', { description: error.message });
    } finally {
        setGeneratingAsset(null);
    }
  };
  
  if (isNicheLoading) return <div className="p-6 space-y-6"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-full mt-2" /><div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div></div>;
  if (!details) return <div className="p-6 text-center"><p>Could not load niche details.</p></div>;

  const buildActions: { id: AssetType; label: string; icon: any; cost: number; desc: string }[] = [
    { id: 'market_validation', label: 'Market Validation', icon: Search, cost: 250, desc: 'Deep dive into local demand, competition, and timing.' },
    { id: 'financial_forecast_3yr', label: '3-Year Forecast', icon: TrendingUp, cost: 250, desc: 'Detailed P&L, cashflow, and break-even analysis.' },
    { id: 'business_plan', label: 'Business Plan', icon: FileText, cost: 500, desc: 'Professional, investor-ready execution strategy.' },
    { id: 'risk_heatmap', label: 'Risk Heatmap', icon: ShieldCheck, cost: 250, desc: 'Identify regulatory, operational, and market exposures.' },
  ];

  return (
    <ScrollArea className="h-full bg-background/50">
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        {isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{isUnlocked ? 'Venture Repository Active' : 'Restricted Concept'}</span>
                    </div>
                    {isUnlocked && (
                         <AutosaveStatusWidget 
                            status={project?.autosave?.status} 
                            version={project?.autosave?.version} 
                            lastSaved={project?.autosave?.lastSavedAt} 
                        />
                    )}
                </div>
                <div className="flex justify-between items-start gap-4">
                  <h2 className="font-headline text-2xl font-bold tracking-tight">{details.niche.title}</h2>
                  {details.scores.breakthroughPotentialScore !== undefined && details.scores.breakthroughPotentialScore !== null && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1.5 font-bold text-[10px]">
                      <Sparkles className="h-3 w-3" /> BREAKTHROUGH (BPS: {details.scores.breakthroughPotentialScore}/10)
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{details.niche.summary}</p>
            </div>
            
            {isUnlocked ? (
                <Tabs defaultValue="analysis" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-secondary/30">
                        <TabsTrigger value="analysis" className="text-xs gap-1.5 uppercase font-bold tracking-wider"><LayoutGrid className="h-3 w-3" />Analysis</TabsTrigger>
                        <TabsTrigger value="build" className="text-xs gap-1.5 uppercase font-bold tracking-wider"><Hammer className="h-3 w-3" />Build Hub</TabsTrigger>
                        <TabsTrigger value="memory" className="text-xs gap-1.5 uppercase font-bold tracking-wider"><Database className="h-3 w-3" />Memory</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="space-y-6 pt-4">
                        <Card className="border-primary/20 bg-primary/5 shadow-lg overflow-hidden">
                            <CardHeader className="pb-2 border-b border-primary/10">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary">
                                    <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> AI Operational Brief</div>
                                    <ScoreBadge score={details.scores.overallConfidenceScore} className="text-[9px]" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {details.explanation.breakthroughRationale && (
                                    <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 mb-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">
                                            <Sparkles className="h-3 w-3" /> Breakthrough Rationale
                                        </div>
                                        <p className="text-xs text-foreground italic leading-relaxed">{details.explanation.breakthroughRationale}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ExecutiveBriefItem icon={Info} label="AI Situation" value={details.explanation.situation || "Venture initialized."} />
                                    <ExecutiveBriefItem icon={Target} label="AI Insight" value={details.explanation.insight || "Strategic opportunity detected."} />
                                    <ExecutiveBriefItem icon={TriangleAlert} label="AI Risk Alert" value={details.explanation.mainRisk} colorClass="text-amber-500" borderClass="border-amber-500/20 bg-amber-500/5 shadow-inner" />
                                    <ExecutiveBriefItem icon={CircleCheckBig} label="AI Recommendation" value={formatEnumString(project?.status || 'unlocked')} colorClass="text-green-500" />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ExecutiveBriefItem icon={BadgeDollarSign} label="Target Investment" value={formatCurrency(details.niche.maxCapitalUsd, 'USD', currencySettings.code, currencySettings.parityMode === 'FACE_VALUE')} />
                                    <ExecutiveBriefItem icon={Activity} label="AI Confidence" value="HIGH CERTAINTY" colorClass="text-primary" />
                                </div>

                                {details.decisionSupport && (
                                    <div className="space-y-3 pt-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                                            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Decision Intelligence Matrix
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <DecisionIntelligenceItem icon={Rocket} label="Optimal Route" value={details.decisionSupport.bestOption} />
                                            <DecisionIntelligenceItem icon={ArrowLeftRight} label="Pivot Alternative" value={details.decisionSupport.alternativeOption} />
                                            <DecisionIntelligenceItem icon={TriangleAlert} label="Risk of Inaction" value={details.decisionSupport.riskOfInaction} colorClass="text-red-400" />
                                            <DecisionIntelligenceItem icon={BadgeDollarSign} label="Commercial Value" value={details.decisionSupport.commercialImpact} colorClass="text-primary" />
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 space-y-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary animate-pulse" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">AI Next Action</span>
                                        </div>
                                        <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">REQUIRED</Badge>
                                    </div>
                                    <p className="text-sm font-bold leading-tight">{project?.processMemory.nextRecommendedAction || "Finalize commercial assumptions."}</p>
                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold tracking-widest border-t border-primary/10 pt-2">
                                        <div className="flex items-center gap-1.5"><User className="h-3 w-3" /> OWNER: OPERATOR</div>
                                        <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> DEADLINE: IMMEDIATE</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="build" className="space-y-6 pt-4">
                        <div className="grid gap-4">
                            {buildActions.map((action) => {
                                const isCompleted = project?.processMemory.completedActions.includes(action.id);
                                return (
                                    <Card key={action.id} className={cn("relative transition-all shadow-sm", isCompleted ? "bg-primary/5 border-primary/20" : "hover:border-border/80")}>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-lg bg-secondary shadow-inner", isCompleted ? "bg-primary/20 text-primary" : "")}>
                                                        <action.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <CardTitle className="text-sm font-bold">{action.label}</CardTitle>
                                                        <CardDescription className="text-[10px] font-medium leading-tight">{action.desc}</CardDescription>
                                                    </div>
                                                </div>
                                                {isCompleted ? (
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] gap-1 font-bold px-2 py-0.5"><CircleCheckBig className="h-2.5 w-2.5" /> REPOSITORY SYNCED</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-[10px] font-bold">{action.cost} ACU</Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <Button 
                                                className="w-full h-8 text-[11px] font-bold uppercase tracking-wider" 
                                                variant={isCompleted ? "outline" : "default"}
                                                disabled={!!generatingAsset}
                                                onClick={() => handleBuildAsset(action.id)}
                                            >
                                                {generatingAsset === action.id ? <Loader2 className="h-3 animate-spin mr-2" /> : <Hammer className="h-3 w-3 mr-2" />}
                                                {isCompleted ? 'Regenerate Version 2.0' : `Execute ${action.label} Engine`}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="memory" className="pt-4">
                        <Card className="bg-secondary/10 border-dashed shadow-inner">
                            <CardHeader>
                                <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-muted-foreground"><Database className="h-4 w-4" />Process Memory State</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Predicted Trajectory</p>
                                    <div className="flex items-center gap-3 p-4 rounded bg-primary/10 border border-primary/20 text-primary shadow-sm">
                                        <ChevronRight className="h-5 w-5" />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold uppercase opacity-60">Predicted Next Best Step</p>
                                            <span className="text-xs font-bold leading-tight">{project?.processMemory.nextRecommendedAction || "Initialize build engine."}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="space-y-6">
                    <Card className="bg-secondary/30 border-dashed text-center py-16 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex flex-col items-center gap-6">
                                <div className="p-6 rounded-full bg-primary/10 text-primary shadow-inner border border-primary/20"><Lock className="h-10 w-10" /></div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{t('nicheDetail.unlockTitle')}</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">{t('nicheDetail.unlockDescription')}</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <Button onClick={handleUnlock} disabled={isUnlocking || !user} size="lg" className="w-full sm:w-auto h-12 px-8 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                                {isUnlocking ? <Loader2 className="animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                                {t('nicheDetail.unlockButton', { cost: NICHE_UNLOCK_COST })}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-destructive/5 border-destructive/20 text-center p-4">
                         <Button onClick={handleReject} variant="ghost" disabled={isRejecting} className="text-[10px] text-destructive hover:bg-destructive/10 font-bold uppercase tracking-widest">
                            {isRejecting ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <XCircle className="h-3 w-3 mr-2" />}
                            Reject recommendation & recalibrate discovery logic
                         </Button>
                    </Card>
                </div>
            )}
        </div>
    </ScrollArea>
  );
}

const formatEnumString = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
