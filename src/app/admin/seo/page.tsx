
'use client';

import { useState, useEffect } from 'react';
import { 
    LayoutGrid, Newspaper, TrendingUp, Zap, Bot, 
    Search, Globe, ShieldCheck, Share2,
    Activity, MousePointer2, Clock, BarChart3,
    Sparkles, Loader2, Plus, ArrowUpRight,
    MessageSquare, AlertTriangle, ShieldAlert,
    Target, Database, Link as LinkIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { getSeoCommandCenterData } from '@/backend/seo/analytics-engine';
import { generateAutonomousArticle, amplifyContent, publishArticle } from '@/backend/seo/publishing-engine';
import { useUser } from '@/firebase/auth/use-user';
import { toast } from 'sonner';
import { cn } from '@/shared/utils';

const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string, value: string | number, icon: any, trend?: string, color?: string }) => (
    <Card className="bg-gradient-to-br from-card to-secondary/10 overflow-hidden border-border/40 relative">
        <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full", color || "bg-primary")} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
            <Icon className={cn("h-4 w-4", color ? `text-${color}` : "text-primary")} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {trend && <p className="text-[9px] font-bold text-green-400 mt-1 flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5"/> {trend}</p>}
        </CardContent>
    </Card>
);

export default function SeoCommandCenter() {
    const { user } = useUser();
    const [analytics, setAnalytics] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [topic, setTopic] = useState('');
    const [activeTab, setActiveTab] = useState('visibility');

    useEffect(() => {
        getSeoCommandCenterData().then(setAnalytics);
    }, []);

    const handleGenerate = async (type: any = 'pillar') => {
        if (!topic || !user) return;
        setIsGenerating(true);
        try {
            const result = await generateAutonomousArticle(user.uid, topic, type);
            toast.success(`${type.toUpperCase()} Generated`, {
                description: `Article "${result.article.title}" saved to Content War Room.`
            });
            setTopic('');
        } catch (e: any) {
            toast.error('Generation Failed', { description: e.message });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" />
                        Autonomous SEO OS Active
                    </div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Executive SEO Command Center</h1>
                    <p className="text-muted-foreground text-sm">Autonomous Ranking & Organic Visibility Infrastructure.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500">
                        <Globe className="h-3.5 w-3.5" />
                        GLOBAL INDEXING: SYNCED
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Impressions" value={analytics?.totalViews?.toLocaleString() || '...'} icon={BarChart3} trend="+45% GROWTH" />
                <StatCard title="Organic Operators" value={analytics?.totalUniqueVisitors?.toLocaleString() || '...'} icon={MousePointer2} trend="+12% VS LAST MONTH" />
                <StatCard title="GEO Search Visibility" value={`${analytics?.aiSearchVisibility || 0}%`} icon={Bot} trend="OPTIMAL" color="accent" />
                <StatCard title="Active Semantic Clusters" value="84" icon={Database} trend="+12 NEW" color="purple-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5 border-2">
                        <CardHeader className="pb-3 border-b border-primary/10">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center justify-between text-primary">
                                <div className="flex items-center gap-2"><Zap className="h-4 w-4 animate-pulse" /> Autonomous Content Generator</div>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-bold tracking-widest">AGENT 2: CONTENT CREATION</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-xs text-muted-foreground font-medium">Input a market signal or trending topic to assign a production task to the Content Agent.</p>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter topic (e.g. 'Fintech adoption in Nigeria 2026')" 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="bg-background border-border/40 focus:ring-primary/20 h-12 text-sm"
                                />
                                <Button onClick={() => handleGenerate('pillar')} disabled={isGenerating || !topic} className="h-12 px-6">
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">Execute Production</span>
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                {['Comparison', 'GEO Page', 'FAQ Cluster', 'Case Study'].map(t => (
                                    <Button key={t} variant="outline" size="sm" className="text-[9px] h-8 font-bold uppercase tracking-widest opacity-70 hover:opacity-100" onClick={() => handleGenerate(t.toLowerCase().replace(' ', '_'))}>{t}</Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-secondary/20 h-12 items-stretch p-1">
                            <TabsTrigger value="visibility" className="gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background"><TrendingUp className="h-3.5 w-3.5" /> Visibility War Map</TabsTrigger>
                            <TabsTrigger value="warroom" className="gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background"><Newspaper className="h-3.5 w-3.5" /> Content War Room</TabsTrigger>
                            <TabsTrigger value="social" className="gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-background"><Share2 className="h-3.5 w-3.5" /> Social Amplification</TabsTrigger>
                        </TabsList>

                        <TabsContent value="visibility" className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-secondary/10 border-dashed border-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-muted-foreground"><Target className="h-4 w-4" /> Top Ranking Keywords</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        {analytics?.topKeywords.map((k: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/40 shadow-sm">
                                                <div className="flex gap-3 items-center">
                                                    <Badge variant="outline" className="text-[10px] font-mono h-6 w-6 flex items-center justify-center rounded-md border-primary/20">#{k.position}</Badge>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-bold leading-tight">{k.keyword}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{k.volume.toLocaleString()} Vol</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">+{k.growth}% <Activity className="h-2.5 w-2.5" /></span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="bg-secondary/10 border-dashed border-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-muted-foreground"><AlertTriangle className="h-4 w-4 text-primary" /> Competitor Attack Monitor</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        {analytics?.competitorAttacks.map((c: any, i: number) => (
                                            <div key={i} className="space-y-2 p-3 rounded-lg bg-background border border-border/40 shadow-sm group">
                                                <div className="flex justify-between text-[9px] font-bold">
                                                    <span className="uppercase opacity-60 flex items-center gap-1.5"><Globe className="h-3 w-3" /> vs {c.competitor}</span>
                                                    <span className={cn(c.gap > 0 ? "text-green-400" : "text-red-400")}>{c.gap > 0 ? '+' : ''}{c.gap} Position</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="text-xs font-bold truncate">{c.keyword}</p>
                                                    <Badge className={cn("text-[8px] font-bold", c.risk === 'high' ? 'bg-red-500' : 'bg-amber-500')}>{c.risk.toUpperCase()} RISK</Badge>
                                                </div>
                                                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className={cn("h-full transition-all duration-1000", c.gap > 0 ? "bg-green-400" : "bg-primary")} style={{ width: `${Math.min(100, Math.max(10, 60 + (c.gap * 10)))}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="warroom" className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground"><Activity className="h-4 w-4" /> Autonomous Production Pipeline</h3>
                                    <Badge variant="secondary" className="text-[9px] font-bold tracking-widest bg-primary/10 text-primary border-primary/20">8 DRAFTS IN QUEUE</Badge>
                                </div>
                                <div className="grid gap-4">
                                    {[
                                        { title: "Top 5 Boring Businesses in South Africa 2026", type: "Pillar", status: "Published", views: "12k", trend: "+12%" },
                                        { title: "How to Build a Venture OS (Complete Guide)", type: "Pillar", status: "Draft", views: "0", trend: "Pending" },
                                        { title: "SME Grant Opportunities in Kenya Q3", type: "GEO", status: "Published", views: "8.5k", trend: "+4%" },
                                    ].map((art, i) => (
                                        <Card key={i} className="bg-secondary/10 border-border/40 hover:bg-secondary/20 transition-all cursor-pointer group">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex gap-4 items-center">
                                                    <div className="p-3 rounded-lg bg-background border border-border/40 text-primary shadow-inner">
                                                        <Newspaper className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{art.title}</p>
                                                        <div className="flex gap-3 items-center">
                                                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/20 text-primary h-5">{art.type}</Badge>
                                                            <span className="text-[10px] text-muted-foreground font-mono font-bold">{art.views} Views • {art.trend}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 text-[9px] font-bold uppercase tracking-widest">Edit Draft</Button>
                                                    <Badge className={cn("text-[9px] font-bold uppercase tracking-widest h-8 px-4 flex items-center", art.status === 'Published' ? "bg-green-500/10 text-green-500 border-green-500/20 border" : "bg-amber-500/10 text-amber-500 border-amber-500/20 border")}>{art.status}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="social" className="pt-6">
                            <div className="grid gap-6">
                                <Card className="bg-secondary/10 border-2 border-dashed">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Share2 className="h-4 w-4 text-accent" /> Pending Amplification Queue</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                         {[
                                            { title: "Kenya Grant Guide", platform: "LinkedIn", type: "Executive Article", status: "Generated" },
                                            { title: "Kenya Grant Guide", platform: "TikTok", type: "Short-form Script", status: "Pending Approval" },
                                            { title: "Boring Businesses SA", platform: "X", type: "Thread (8 Posts)", status: "Scheduled" },
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/40 shadow-sm group">
                                                <div className="flex gap-4 items-center">
                                                    <div className="p-2.5 rounded-full bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold">{task.title}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[8px] tracking-tighter uppercase border-primary/20 text-primary">{task.platform}</Badge>
                                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{task.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold opacity-60 uppercase">{task.status}</span>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary"><ArrowUpRight className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-8">
                    <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 border-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <CardHeader className="pb-3 border-b border-primary/10">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                                <Bot className="h-4 w-4" /> OS Strategic Brief
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-2 hover:border-primary/40 transition-colors">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Globe className="h-3 w-3" /> Market Signal</span>
                                <p className="text-[11px] font-medium leading-relaxed italic">Search volume for "AI Venture Infrastructure" is spiking in GCC markets (+420% last 7d).</p>
                                <Button size="sm" variant="link" className="text-[9px] h-auto p-0 font-bold uppercase tracking-widest text-primary flex items-center gap-1">Assign Content Agent <ArrowUpRight className="h-2.5 w-2.5" /></Button>
                            </div>
                            <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 space-y-2 shadow-lg">
                                <span className="text-[9px] font-bold text-primary uppercase flex items-center gap-1.5"><Zap className="h-3 w-3 animate-pulse" /> Critical Action</span>
                                <p className="text-xs font-bold leading-tight">SEO Decay Detected: "How to Find Your Niche" dropped 15% traffic. Content refresh required.</p>
                                <Button size="sm" className="w-full h-8 text-[9px] font-bold uppercase tracking-widest mt-2 shadow-xl">Execute Refresh Engine</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-secondary/10 border-border/40 shadow-inner">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><LinkIcon className="h-3 w-3" /> Backlink Intelligence</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-between p-3 rounded bg-background border border-border/40">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold">Forbes.com (Unlinked)</p>
                                    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Authority: 92 • Mentions: 3</p>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-bold uppercase tracking-widest">Execute Agent 5</Button>
                            </div>
                             <div className="flex items-center justify-between p-3 rounded bg-background border border-border/40 opacity-60">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold">TechCrunch (Lost)</p>
                                    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Broken Link Detected</p>
                                </div>
                                <Badge variant="secondary" className="text-[8px]">RECOVERED</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40 bg-secondary/5 border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Globe className="h-3 w-3" /> Global Indexing State</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="opacity-60">GOOGLE SEARCH CONSOLE</span>
                                    <span className="text-green-400">INDEXED (98%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[98%]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
