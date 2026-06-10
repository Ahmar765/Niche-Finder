import { v4 as uuidv4 } from 'uuid';
import type { SeoArticle, SocialAmplificationTask, SeoContentType } from '@nichefinder/domain-types';
import { fetchJsonText } from '@/backend/ai/fetch-json-text';
import { adminFirestore } from '@/backend/firebase-admin';
import { trackPlatformEvent } from '@/backend/platform-events';
import { normalizeSeoArticleAiOutput, parseAiJson } from '@/lib/parse-ai-json';
import { getSeoAgentDirectives } from './seo-agent-manifest';

function toScriptText(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) return value.map((entry) => String(entry)).join('\n\n');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return fallback;
}

function extractAmplifyScripts(parsed: Record<string, unknown>, article: SeoArticle) {
  return {
    tiktok: toScriptText(
      parsed.tiktok ?? parsed.TikTok,
      `Quick hook: ${article.title}. Share the top insight from our latest pillar article.`,
    ),
    linkedin: toScriptText(
      parsed.linkedin ?? parsed.LinkedIn,
      `${article.title}\n\n${article.content.slice(0, 600)}`,
    ),
    x: toScriptText(
      parsed.x_thread ?? parsed.x ?? parsed.twitter ?? parsed.X ?? parsed.thread,
      `1/ New pillar: ${article.title}\n2/ Why this matters now\n3/ Read the full breakdown in our Content War Room`,
    ),
  };
}

export async function executeGenerateSeoArticle(
  userId: string,
  topic: string,
  type: SeoContentType,
) {
  const agents = getSeoAgentDirectives(['content_creation', 'ai_search_optimisation', 'serp_domination']);

  const systemPrompt = `
        You are the Content Creation Agent of the SEO Operating System.
        Your mission is to generate high-ranking, semantic-rich content that establishes topical authority.

        AGENT CAPABILITIES:
        ${agents}

        MISSION: Produce a ${type.replace('_', ' ')} article on "${topic}".
        
        REQUIREMENTS:
        - Human-like, high-authority, professional tone.
        - SEO Title: Catchy, keyword-optimized, under 60 chars.
        - Meta Description: Compelling, 150-160 chars.
        - Content: Markdown format with clear headings (H1-H4), bullet points, and deep reasoning logic.
        - Schema: Generate JSON-LD Article/FAQ schema as a string.
        - Semantic Keywords: List 10-15 related LSI keywords used in the text.
        - Social Hook: 1 high-engagement intro for LinkedIn.

        Hard Rules:
        - Return ONLY a JSON object. No markdown fences or prose outside JSON.
        - Every property name must use double quotes.
        - Keys: title, slug, content, seoTitle, metaDescription, keywords (array), schema (JSON-LD string or object).
    `;

  const userPrompt = `Generate the ${type} article strategy and content for the market signal: ${topic}`;

  let aiText = '';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await fetchJsonText({
      systemPrompt,
      userPrompt:
        attempt === 0
          ? userPrompt
          : `${userPrompt}\n\nYour previous response was invalid JSON. Reply again with ONLY a valid JSON object. Double-quote all keys.`,
      temperature: attempt === 0 ? 0.6 : 0.2,
      maxOutputTokens: 4096,
    });

    try {
      parseAiJson(result.text);
      aiText = result.text;
      break;
    } catch (parseError) {
      if (attempt === 1) throw parseError;
      console.warn('[executeGenerateSeoArticle] Invalid JSON from AI, retrying once:', parseError);
    }
  }

  const parsed = normalizeSeoArticleAiOutput(parseAiJson(aiText));
  if (!parsed) {
    throw new Error('AI returned data in an invalid format.');
  }

  const articleId = uuidv4();

  const article: SeoArticle = {
    id: articleId,
    title: parsed.title,
    slug: parsed.slug,
    content: parsed.content,
    contentType: type,
    status: 'draft',
    seoMetadata: {
      title: parsed.seoTitle,
      description: parsed.metaDescription,
      keywords: parsed.keywords,
      schemaJson: parsed.schema,
      ogTags: {
        'og:title': parsed.title,
        'og:description': parsed.metaDescription,
        'og:type': 'article',
      },
    },
    analytics: { views: 0, uniqueVisitors: 0, avgReadTime: 0, scrollDepth: 0, ctr: 0, bounceRate: 0 },
    backlinks: [],
    revisions: [
      {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        authorId: userId,
        changeSummary: 'Initial autonomous generation.',
      },
    ],
    updatedAt: new Date().toISOString(),
    authorId: userId,
    tags: [type, 'autonomous_gen', ...parsed.keywords.slice(0, 3)],
  };

  await adminFirestore.collection('seo_articles').doc(articleId).set(article);

  await trackPlatformEvent(userId, 'seo.content_generated', { articleId, topic, type });

  return { articleId, article };
}

export async function executeAmplifySeoContent(userId: string, articleId: string) {
  const articleDoc = await adminFirestore.collection('seo_articles').doc(articleId).get();
  if (!articleDoc.exists) throw new Error('Article not found.');
  const article = articleDoc.data() as SeoArticle;

  const agents = getSeoAgentDirectives(['social_virality']);

  const systemPrompt = `
        You are the Social Virality Agent of the SEO Operating System.
        
        ${agents}

        MISSION: Transform the provided article into viral social media scripts.
        ARTICLE TITLE: ${article.title}
        CONTENT SUMMARY: ${article.content.substring(0, 2000)}

        GENERATE SCRIPTS FOR:
        1. TikTok: Hook-first, 45-second script.
        2. LinkedIn: Executive insight style, structured for readability.
        3. X (Twitter): A 5-8 post thread with high engagement hooks.

        Return strict JSON with keys: tiktok, linkedin, x_thread.
        Every property name must use double quotes. No markdown fences.
    `;

  const result = await fetchJsonText({
    systemPrompt,
    userPrompt: 'Generate social amplification scripts.',
    temperature: 0.7,
    maxOutputTokens: 2048,
  });

  const parsed = parseAiJson<Record<string, unknown>>(result.text);
  const scripts = extractAmplifyScripts(parsed, article);
  const platforms = ['tiktok', 'linkedin', 'x'] as const;

  const batch = adminFirestore.batch();
  const tasks: SocialAmplificationTask[] = [];

  platforms.forEach((platform) => {
    const taskId = uuidv4();
    const script = scripts[platform];
    const task = {
      id: taskId,
      articleId,
      platform,
      script,
      status: 'pending' as const,
      articleTitle: article.title,
    };

    batch.set(adminFirestore.collection('seo_amplification_tasks').doc(taskId), task);
    tasks.push(task);
  });

  await batch.commit();

  await trackPlatformEvent(userId, 'seo.social_amplification_created', { articleId });

  return tasks;
}

export async function executePublishSeoArticle(userId: string, articleId: string) {
  const articleRef = adminFirestore.collection('seo_articles').doc(articleId);
  const articleDoc = await articleRef.get();
  if (!articleDoc.exists) {
    throw new Error('Article not found.');
  }

  const now = new Date().toISOString();
  await articleRef.update({
    status: 'published',
    publishedAt: now,
    updatedAt: now,
  });

  await trackPlatformEvent(userId, 'seo.content_published', { articleId });

  return { success: true, articleId, status: 'published' as const };
}
