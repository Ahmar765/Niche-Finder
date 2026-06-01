
'use server';

import { adminFirestore } from '@/backend/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { SeoArticle, SocialAmplificationTask, SeoContentType } from '@nichefinder/domain-types';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { getSeoAgentDirectives } from './seo-agent-manifest';

/**
 * SEO OS: Autonomous Publishing & Amplification Engine
 * Handles the generation, scheduling, and multi-platform syndication of content.
 */

export async function generateAutonomousArticle(userId: string, topic: string, type: SeoContentType) {
    const aiClient = new UniversalAIClient();
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

        OUTPUT FORMAT: Strict JSON.
    `;

    try {
        const result = await aiClient.generateText({
            systemPrompt,
            messages: [{ role: 'user', content: `Generate the ${type} article strategy and content for the market signal: ${topic}` }],
            featureType: 'long_chat',
            tier: 'professional',
            jsonMode: true
        });

        const parsed = JSON.parse(result.text);
        const articleId = uuidv4();

        const article: SeoArticle = {
            id: articleId,
            title: parsed.title || parsed.seoTitle,
            slug: (parsed.slug || parsed.title).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            content: parsed.content,
            contentType: type,
            status: 'draft',
            seoMetadata: {
                title: parsed.seoTitle || parsed.title,
                description: parsed.metaDescription,
                keywords: parsed.keywords || parsed.semanticKeywords || [],
                schemaJson: typeof parsed.schema === 'string' ? parsed.schema : JSON.stringify(parsed.schema || {}),
                ogTags: {
                    "og:title": parsed.title,
                    "og:description": parsed.metaDescription,
                    "og:type": "article"
                }
            },
            analytics: { views: 0, uniqueVisitors: 0, avgReadTime: 0, scrollDepth: 0, ctr: 0, bounceRate: 0 },
            backlinks: [],
            revisions: [{ id: uuidv4(), timestamp: new Date().toISOString(), authorId: userId, changeSummary: "Initial autonomous generation." }],
            updatedAt: new Date().toISOString(),
            authorId: userId,
            tags: [type, 'autonomous_gen', ...((parsed.keywords || []).slice(0, 3))]
        };

        await adminFirestore.collection('seo_articles').doc(articleId).set(article);

        // Track event in OS ledger
        await adminFirestore.collection('platform_events').add({
            id: uuidv4(),
            userId,
            eventType: 'seo.content_generated',
            payload: { articleId, topic, type },
            createdAt: FieldValue.serverTimestamp(),
            tags: ['seo', 'publishing', type]
        });

        return { articleId, article };
    } catch (error: any) {
        console.error('[SEO OS] Generation Failure:', error.message);
        throw new Error(`SEO Engine stalled: ${error.message}`);
    }
}

/**
 * Transforms an article into multi-platform social formats.
 */
export async function amplifyContent(userId: string, articleId: string) {
    const articleDoc = await adminFirestore.collection('seo_articles').doc(articleId).get();
    if (!articleDoc.exists) throw new Error("Article not found.");
    const article = articleDoc.data() as SeoArticle;

    const aiClient = new UniversalAIClient();
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
    `;

    const result = await aiClient.generateText({
        systemPrompt,
        messages: [{ role: 'user', content: 'Generate social amplification scripts.' }],
        featureType: 'short_chat',
        tier: 'professional',
        jsonMode: true
    });

    const parsed = JSON.parse(result.text);
    const platforms: SocialAmplificationTask['platform'][] = ['tiktok', 'linkedin', 'x'];

    const batch = adminFirestore.batch();
    const tasks: SocialAmplificationTask[] = [];

    platforms.forEach(p => {
        const taskId = uuidv4();
        const script = p === 'x' ? parsed.x_thread : parsed[p];
        const task: SocialAmplificationTask = {
            id: taskId,
            articleId,
            platform: p as any,
            script: typeof script === 'string' ? script : JSON.stringify(script),
            status: 'pending',
            articleTitle: article.title // Local property for UI convenience
        } as any;
        
        const ref = adminFirestore.collection('seo_amplification_tasks').doc(taskId);
        batch.set(ref, task);
        tasks.push(task);
    });

    await batch.commit();
    return tasks;
}

export async function publishArticle(articleId: string) {
    await adminFirestore.collection('seo_articles').doc(articleId).update({
        status: 'published',
        publishedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });

    return { success: true };
}
