import type {
  SeoAnalyticsSnapshot,
  SeoArticle,
  SocialAmplificationTask,
} from '@nichefinder/domain-types';

export interface PlatformSeoEvent {
  id: string;
  eventType?: string;
  payload?: Record<string, unknown>;
  tags?: string[];
  createdAt?: { toDate?: () => Date } | string;
}

export interface SeoBacklinkEntry {
  source: string;
  url: string;
  authority: number;
  status: string;
}

export interface SeoStrategicBrief {
  marketSignal?: string;
  criticalAction?: string;
  refreshArticleId?: string;
}

export type SeoCommandCenterView = SeoAnalyticsSnapshot & {
  articles: SeoArticle[];
  amplificationTasks: Array<SocialAmplificationTask & { articleTitle?: string }>;
  draftCount: number;
  publishedCount: number;
  semanticClusterCount: number;
  indexingPercent: number;
  backlinks: SeoBacklinkEntry[];
  strategicBrief: SeoStrategicBrief;
};

function normalizeArticle(doc: SeoArticle & { id?: string }): SeoArticle {
  return {
    ...doc,
    id: doc.id ?? '',
    analytics: {
      views: doc.analytics?.views ?? 0,
      uniqueVisitors: doc.analytics?.uniqueVisitors ?? 0,
      avgReadTime: doc.analytics?.avgReadTime ?? 0,
      scrollDepth: doc.analytics?.scrollDepth ?? 0,
      ctr: doc.analytics?.ctr ?? 0,
      bounceRate: doc.analytics?.bounceRate ?? 0,
    },
    seoMetadata: {
      title: doc.seoMetadata?.title ?? doc.title ?? '',
      description: doc.seoMetadata?.description ?? '',
      keywords: doc.seoMetadata?.keywords ?? [],
      schemaJson: doc.seoMetadata?.schemaJson ?? '{}',
      ogTags: doc.seoMetadata?.ogTags ?? {},
      twitterCard: doc.seoMetadata?.twitterCard,
    },
    backlinks: doc.backlinks ?? [],
    tags: doc.tags ?? [],
  };
}

export function buildSeoCommandCenterView(
  rawArticles: Array<SeoArticle & { id?: string }>,
  rawTasks: Array<SocialAmplificationTask & { articleTitle?: string; id?: string }>,
  events: PlatformSeoEvent[] = [],
): SeoCommandCenterView {
  const articles = rawArticles.map(normalizeArticle);
  const amplificationTasks = rawTasks.map((task) => ({
    ...task,
    id: task.id ?? '',
  }));

  const totalViews = articles.reduce((sum, a) => sum + a.analytics.views, 0);
  const totalUniqueVisitors = articles.reduce(
    (sum, a) => sum + a.analytics.uniqueVisitors,
    0,
  );
  const avgDwellTime =
    articles.length > 0
      ? articles.reduce((sum, a) => sum + a.analytics.avgReadTime, 0) / articles.length
      : 0;

  const keywordScores = new Map<string, { views: number; articles: number }>();
  for (const article of articles) {
    const keywords = article.seoMetadata.keywords.length
      ? article.seoMetadata.keywords
      : article.tags;
    for (const keyword of keywords) {
      const current = keywordScores.get(keyword) ?? { views: 0, articles: 0 };
      keywordScores.set(keyword, {
        views: current.views + article.analytics.views,
        articles: current.articles + 1,
      });
    }
  }

  const topKeywords = [...keywordScores.entries()]
    .sort((a, b) => b[1].views - a[1].views || b[1].articles - a[1].articles)
    .slice(0, 5)
    .map(([keyword, stats], index) => ({
      keyword,
      position: index + 1,
      growth: stats.views > 0 ? Math.min(99, Math.round((stats.views / Math.max(totalViews, 1)) * 100)) : 0,
      volume: Math.max(stats.views * 12, stats.articles * 250),
    }));

  const competitorAttacks = articles
    .filter((a) => a.status === 'refresh_required')
    .slice(0, 5)
    .map((article) => {
      const keyword =
        article.seoMetadata.keywords[0] ?? article.title;
      const gap = Math.round(-(article.analytics.bounceRate || 15));
      return {
        competitor: 'SERP',
        keyword,
        gap,
        risk: (gap < -10 ? 'high' : gap < 0 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      };
    });

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const withSchema = articles.filter((a) => a.seoMetadata.schemaJson && a.seoMetadata.schemaJson !== '{}').length;
  const aiSearchVisibility =
    articles.length > 0 ? Math.round((withSchema / articles.length) * 100) : 0;
  const indexingPercent =
    articles.length > 0 ? Math.round((publishedCount / articles.length) * 100) : 0;

  const semanticClusterCount = keywordScores.size;

  const domainAuthority =
    articles.length > 0
      ? Math.round(
          articles.reduce(
            (sum, a) =>
              sum + (a.backlinks.reduce((bSum, b) => bSum + b.authority, 0) / Math.max(a.backlinks.length, 1) || 0),
            0,
          ) / articles.length,
        )
      : 0;

  const backlinks = articles
    .flatMap((article) =>
      article.backlinks.map((link) => ({
        source: link.source,
        url: link.url,
        authority: link.authority,
        status: link.status,
      })),
    )
    .sort((a, b) => b.authority - a.authority)
    .slice(0, 5);

  const seoEvents = events.filter((event) => event.tags?.includes('seo'));
  const latestContentEvent = seoEvents.find((event) => event.eventType === 'seo.content_generated');
  const refreshArticle = articles.find((a) => a.status === 'refresh_required');

  const strategicBrief: SeoStrategicBrief = {};
  if (latestContentEvent?.payload?.topic) {
    strategicBrief.marketSignal = `New content signal: "${String(latestContentEvent.payload.topic)}" (${String(latestContentEvent.payload.type ?? 'article')}).`;
  } else if (draftCount > 0) {
    strategicBrief.marketSignal = `${draftCount} draft${draftCount === 1 ? '' : 's'} in the production pipeline awaiting publish.`;
  }

  if (refreshArticle) {
    strategicBrief.criticalAction = `SEO decay detected on "${refreshArticle.title}". Content refresh required.`;
    strategicBrief.refreshArticleId = refreshArticle.id;
  } else if (draftCount > 0) {
    strategicBrief.criticalAction = `${draftCount} draft article${draftCount === 1 ? '' : 's'} ready for review and publishing.`;
  }

  return {
    id: 'live',
    timestamp: new Date().toISOString(),
    totalUniqueVisitors,
    totalViews,
    avgDwellTime,
    topKeywords,
    competitorAttacks,
    aiSearchVisibility,
    domainAuthority,
    articles: [...articles].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),
    amplificationTasks: [...amplificationTasks].sort((a, b) =>
      a.status.localeCompare(b.status),
    ),
    draftCount,
    publishedCount,
    semanticClusterCount,
    indexingPercent,
    backlinks,
    strategicBrief,
  };
}
