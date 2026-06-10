'use client';

import { useState } from 'react';
import {
  Newspaper, TrendingUp, Zap, Bot,
  Globe, ShieldCheck, Share2,
  Activity, MousePointer2, BarChart3,
  Loader2, Plus, ArrowUpRight,
  MessageSquare, AlertTriangle,
  Target, Database, Link as LinkIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase/auth/use-user';
import { useSeoLiveData } from '@/hooks/use-seo-live-data';
import type { SeoArticle, SeoContentType } from '@nichefinder/domain-types';
import { toast } from 'sonner';
import { cn } from '@/shared/utils';
import { SeoArticleDetailSheet } from '@/components/seo-article-detail-sheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

async function postSeoApi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      response.status === 404
        ? 'SEO service is unavailable. Please refresh and try again.'
        : 'SEO request failed — the server returned an unexpected response.',
    );
  }

  const result = JSON.parse(rawBody) as T & { error?: string };
  if (!response.ok || result.error) {
    throw new Error(result.error ?? 'Request failed');
  }

  return result;
}

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  x: 'X',
  facebook: 'Facebook',
  youtube_shorts: 'YouTube Shorts',
  reddit: 'Reddit',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  pillar: 'Pillar',
  supporting: 'Supporting',
  geo: 'GEO',
  comparison: 'Comparison',
  faq: 'FAQ',
  landing: 'Landing',
  case_study: 'Case Study',
};

const formatViews = (views: number) =>
  views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}) => (
  <Card className="bg-gradient-to-br from-card to-secondary/10 overflow-hidden border-border/40 relative">
    <div className={cn('absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full', color || 'bg-primary')} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {trend && (
        <p className="text-[9px] font-bold text-green-400 mt-1 flex items-center gap-1">
          <TrendingUp className="h-2.5 w-2.5" /> {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

type SeoCommandCenterProps = {
  embedded?: boolean;
};

export function SeoCommandCenter({ embedded }: SeoCommandCenterProps) {
  const { user } = useUser();
  const { data: analytics, isLoading: isAnalyticsLoading, error: analyticsError, refresh } = useSeoLiveData(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<SeoContentType>('pillar');
  const [activeTab, setActiveTab] = useState('visibility');
  const [articleAction, setArticleAction] = useState<{ id: string; type: 'amplify' | 'publish' } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SeoArticle | null>(null);
  const [isArticleSheetOpen, setIsArticleSheetOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<{ title: string; platform: string; script: string } | null>(null);
  const [isScriptSheetOpen, setIsScriptSheetOpen] = useState(false);

  const openArticle = (article: SeoArticle) => {
    setSelectedArticle(article);
    setIsArticleSheetOpen(true);
  };

  const handleGenerate = async (type: SeoContentType = selectedContentType) => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      toast.error('Topic required', {
        description: 'Enter a market signal or topic in the field above before generating.',
      });
      return;
    }
    if (!user) {
      toast.error('Sign in required', {
        description: 'You must be signed in to generate SEO content.',
      });
      return;
    }

    setSelectedContentType(type);
    setIsGenerating(true);
    try {
      const result = await postSeoApi<{ article: SeoArticle }>('/api/seo/generate-article', {
        topic: trimmedTopic,
        type,
      });
      const label = CONTENT_TYPE_LABELS[type] ?? type;
      toast.success(`${label} generated`, {
        description: `Article "${result.article.title}" saved to Content War Room.`,
      });
      setTopic('');
      await refresh();
      setActiveTab('warroom');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Generation failed';
      toast.error('Generation Failed', { description: message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectContentType = (type: SeoContentType) => {
    setSelectedContentType(type);
    if (topic.trim()) {
      void handleGenerate(type);
      return;
    }
    toast.message(`${CONTENT_TYPE_LABELS[type] ?? type} selected`, {
      description: 'Enter a topic above, then click Execute or this format again.',
    });
  };

  const handleAmplify = async (articleId: string) => {
    if (!user) return;
    setArticleAction({ id: articleId, type: 'amplify' });
    try {
      await postSeoApi('/api/seo/amplify', { articleId });
      toast.success('Social scripts queued', {
        description: 'Open Social Amplification to review the scripts.',
      });
      await refresh();
      setActiveTab('social');
    } catch (e: unknown) {
      toast.error('Amplification failed', { description: e instanceof Error ? e.message : 'Failed' });
    } finally {
      setArticleAction(null);
    }
  };

  const handlePublish = async (articleId: string) => {
    if (!user) return;
    setArticleAction({ id: articleId, type: 'publish' });
    try {
      await postSeoApi('/api/seo/publish', { articleId });
      toast.success('Article published', { description: 'Status updated to live.' });
      await refresh();
    } catch (e: unknown) {
      toast.error('Publish failed', { description: e instanceof Error ? e.message : 'Failed' });
    } finally {
      setArticleAction(null);
    }
  };

  return (
    <div className={cn('space-y-8', !embedded && 'container mx-auto px-4 py-8')}>
      {!embedded && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              Autonomous SEO OS Active
            </div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Executive SEO Command Center</h1>
            <p className="text-muted-foreground text-sm">Autonomous Ranking & Organic Visibility Infrastructure.</p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-bold',
            isAnalyticsLoading
              ? 'bg-secondary/20 border-border/40 text-muted-foreground'
              : 'bg-green-500/10 border-green-500/20 text-green-500',
          )}>
            <Globe className="h-3.5 w-3.5" />
            {isAnalyticsLoading ? 'SYNCING LIVE DATA…' : `GLOBAL INDEXING: ${analytics?.indexingPercent ?? 0}%`}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsError && (
          <div className="md:col-span-2 lg:col-span-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {analyticsError}
          </div>
        )}
        <StatCard
          title="Total Impressions"
          value={isAnalyticsLoading ? '…' : (analytics?.totalViews ?? 0).toLocaleString()}
          icon={BarChart3}
          trend={analytics?.publishedCount ? `${analytics.publishedCount} PUBLISHED` : 'LIVE'}
        />
        <StatCard
          title="Organic Operators"
          value={isAnalyticsLoading ? '…' : (analytics?.totalUniqueVisitors ?? 0).toLocaleString()}
          icon={MousePointer2}
          trend={analytics?.articles?.length ? `${analytics.articles.length} ARTICLES` : 'AWAITING CONTENT'}
        />
        <StatCard
          title="GEO Search Visibility"
          value={isAnalyticsLoading ? '…' : `${analytics?.aiSearchVisibility ?? 0}%`}
          icon={Bot}
          trend={analytics?.aiSearchVisibility ? 'SCHEMA COVERAGE' : 'NO DATA'}
        />
        <StatCard
          title="Active Semantic Clusters"
          value={isAnalyticsLoading ? '…' : (analytics?.semanticClusterCount ?? 0)}
          icon={Database}
          trend={analytics?.draftCount ? `${analytics.draftCount} DRAFTS` : 'LIVE'}
        />
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isGenerating) {
                      void handleGenerate(selectedContentType);
                    }
                  }}
                  className="bg-background border-border/40 focus:ring-primary/20 h-12 text-sm"
                />
                <Button
                  type="button"
                  onClick={() => handleGenerate(selectedContentType)}
                  disabled={isGenerating || !topic.trim()}
                  className="h-12 px-6"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">
                    Execute {CONTENT_TYPE_LABELS[selectedContentType] ?? 'Production'}
                  </span>
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {([
                  { label: 'Comparison', type: 'comparison' as const },
                  { label: 'GEO Page', type: 'geo' as const },
                  { label: 'FAQ Cluster', type: 'faq' as const },
                  { label: 'Case Study', type: 'case_study' as const },
                ]).map(({ label, type }) => {
                  const isSelected = selectedContentType === type;
                  const isRunning = isGenerating && isSelected;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      disabled={isGenerating}
                      className={cn(
                        'text-[9px] h-8 font-bold uppercase tracking-widest',
                        isSelected ? 'ring-2 ring-primary/60' : 'opacity-80 hover:opacity-100',
                      )}
                      onClick={() => handleSelectContentType(type)}
                    >
                      {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Select a format, enter a topic, then click the format again or press Execute to generate.
              </p>
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
                    {isAnalyticsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : analytics?.topKeywords?.length ? (
                      analytics.topKeywords.map((k, i) => (
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
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">Generate content to populate keyword rankings.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-secondary/10 border-dashed border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-muted-foreground"><AlertTriangle className="h-4 w-4 text-primary" /> Competitor Attack Monitor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {isAnalyticsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : analytics?.competitorAttacks?.length ? (
                      analytics.competitorAttacks.map((c, i) => (
                        <div key={i} className="space-y-2 p-3 rounded-lg bg-background border border-border/40 shadow-sm group">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="uppercase opacity-60 flex items-center gap-1.5"><Globe className="h-3 w-3" /> vs {c.competitor}</span>
                            <span className={cn(c.gap > 0 ? 'text-green-400' : 'text-red-400')}>{c.gap > 0 ? '+' : ''}{c.gap} Position</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs font-bold truncate">{c.keyword}</p>
                            <Badge className={cn('text-[8px] font-bold', c.risk === 'high' ? 'bg-red-500' : 'bg-amber-500')}>{c.risk.toUpperCase()} RISK</Badge>
                          </div>
                          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <div className={cn('h-full transition-all duration-1000', c.gap > 0 ? 'bg-green-400' : 'bg-primary')} style={{ width: `${Math.min(100, Math.max(10, 60 + (c.gap * 10)))}%` }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">No decay alerts. Articles marked refresh_required will appear here.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="warroom" className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground"><Activity className="h-4 w-4" /> Autonomous Production Pipeline</h3>
                  <Badge variant="secondary" className="text-[9px] font-bold tracking-widest bg-primary/10 text-primary border-primary/20">
                    {isAnalyticsLoading ? '…' : `${analytics?.draftCount ?? 0} DRAFTS IN QUEUE`}
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {isAnalyticsLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : analytics?.articles?.length ? (
                    analytics.articles.map((art: SeoArticle) => (
                      <Card
                        key={art.id}
                        className="bg-secondary/10 border-border/40 hover:bg-secondary/20 transition-all cursor-pointer group"
                        onClick={() => openArticle(art)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex gap-4 items-center min-w-0 flex-1">
                            <div className="p-3 rounded-lg bg-background border border-border/40 text-primary shadow-inner">
                              <Newspaper className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{art.title}</p>
                              <div className="flex gap-3 items-center">
                                <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/20 text-primary h-5">
                                  {CONTENT_TYPE_LABELS[art.contentType] ?? art.contentType}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono font-bold">
                                  {formatViews(art.analytics?.views ?? 0)} Views • {art.status === 'published' ? 'Live' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                            {art.status === 'draft' && user && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] font-bold uppercase tracking-widest"
                                disabled={Boolean(articleAction)}
                                onClick={() => handleAmplify(art.id)}
                              >
                                {articleAction?.id === art.id && articleAction.type === 'amplify' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Amplify'
                                )}
                              </Button>
                            )}
                            {art.status === 'draft' && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 text-[9px] font-bold uppercase tracking-widest"
                                disabled={Boolean(articleAction)}
                                onClick={() => handlePublish(art.id)}
                              >
                                {articleAction?.id === art.id && articleAction.type === 'publish' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Publish'
                                )}
                              </Button>
                            )}
                            <Badge className={cn(
                              'text-[9px] font-bold uppercase tracking-widest h-8 px-4 flex items-center pointer-events-none',
                              art.status === 'published'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20 border'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 border',
                            )}>
                              {art.status === 'published' ? 'Live' : 'Draft'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-12">No articles yet. Use the content generator above to create your first draft.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="pt-6">
              <Card className="bg-secondary/10 border-2 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"><Share2 className="h-4 w-4 text-accent" /> Pending Amplification Queue</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {isAnalyticsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : analytics?.amplificationTasks?.length ? (
                    analytics.amplificationTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/40 shadow-sm group cursor-pointer hover:border-primary/30"
                        onClick={() => {
                          setSelectedScript({
                            title: task.articleTitle ?? 'Article',
                            platform: PLATFORM_LABELS[task.platform] ?? task.platform,
                            script: task.script ?? '',
                          });
                          setIsScriptSheetOpen(true);
                        }}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="p-2.5 rounded-full bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold">{task.articleTitle ?? 'Article'}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-[8px] tracking-tighter uppercase border-primary/20 text-primary">
                                {PLATFORM_LABELS[task.platform] ?? task.platform}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Social Script</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold opacity-60 uppercase">{task.status}</span>
                          {task.postUrl && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild>
                              <a href={task.postUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight className="h-4 w-4" /></a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">No amplification tasks. Click Amplify on a draft article to queue social scripts.</p>
                  )}
                </CardContent>
              </Card>
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
              {analytics?.strategicBrief?.marketSignal ? (
                <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-2 hover:border-primary/40 transition-colors">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Globe className="h-3 w-3" /> Market Signal</span>
                  <p className="text-[11px] font-medium leading-relaxed italic">{analytics.strategicBrief.marketSignal}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Market signals appear when content is generated.</p>
              )}
              {analytics?.strategicBrief?.criticalAction ? (
                <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 space-y-2 shadow-lg">
                  <span className="text-[9px] font-bold text-primary uppercase flex items-center gap-1.5"><Zap className="h-3 w-3 animate-pulse" /> Critical Action</span>
                  <p className="text-xs font-bold leading-tight">{analytics.strategicBrief.criticalAction}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-secondary/10 border-border/40 shadow-inner">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><LinkIcon className="h-3 w-3" /> Backlink Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {analytics?.backlinks?.length ? (
                analytics.backlinks.map((link, i) => (
                  <div key={i} className={cn(
                    'flex items-center justify-between p-3 rounded bg-background border border-border/40',
                    link.status === 'lost' && 'opacity-60',
                  )}>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold">{link.source}</p>
                      <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Authority: {link.authority} • {link.status}
                      </p>
                    </div>
                    {link.status === 'active' ? (
                      <Button size="sm" variant="outline" className="h-7 text-[8px] font-bold uppercase tracking-widest" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-[8px]">{link.status.toUpperCase()}</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No backlinks tracked on articles yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SeoArticleDetailSheet
        article={selectedArticle}
        open={isArticleSheetOpen}
        onOpenChange={setIsArticleSheetOpen}
        contentTypeLabel={
          selectedArticle
            ? CONTENT_TYPE_LABELS[selectedArticle.contentType] ?? selectedArticle.contentType
            : undefined
        }
        onAmplify={handleAmplify}
        onPublish={handlePublish}
        isAmplifying={Boolean(
          articleAction &&
            selectedArticle &&
            articleAction.id === selectedArticle.id &&
            articleAction.type === 'amplify',
        )}
        isPublishing={Boolean(
          articleAction &&
            selectedArticle &&
            articleAction.id === selectedArticle.id &&
            articleAction.type === 'publish',
        )}
      />

      <Sheet open={isScriptSheetOpen} onOpenChange={setIsScriptSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          {selectedScript && (
            <>
              <SheetHeader className="text-left space-y-2 pb-4">
                <SheetTitle className="text-lg">{selectedScript.title}</SheetTitle>
                <Badge variant="outline" className="w-fit text-[9px] uppercase tracking-widest">
                  {selectedScript.platform} script
                </Badge>
              </SheetHeader>
              <ScrollArea className="h-[70vh] rounded-lg border bg-secondary/20 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{selectedScript.script}</pre>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
