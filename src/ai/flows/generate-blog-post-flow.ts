'use server';

/**
 * @fileOverview A flow for generating a blog post with SEO metadata using a universal AI provider.
 * This flow is now connected to the ACU billing system.
 */
import { z } from 'zod';
import { handleBilledOperation } from '@/backend/actions';
import type { NicheFinderAcuActionKey } from '@/config/acuActions';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { normalizeBlogPostAiOutput, parseAiJson } from '@/lib/parse-ai-json';

// --- SCHEMA DEFINITIONS ---

const BlogPostInputSchema = z.string().describe('The topic for the blog post.');
export type BlogPostInput = z.infer<typeof BlogPostInputSchema>;

const BlogPostOutputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  seoKeywords: z.array(z.string()).min(1),
});
export type BlogPostOutput = z.infer<typeof BlogPostOutputSchema>;

const BLOG_POST_JSON_SCHEMA = `{
  "title": "string",
  "slug": "url-friendly-slug",
  "content": "full markdown article",
  "seoTitle": "SEO title under 60 chars",
  "seoDescription": "meta description 150-160 chars",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

export async function generateBlogPost(userId: string, topic: BlogPostInput) {
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const systemPrompt = `
    You are an expert content creator and SEO specialist for a startup called "Niche Finder".
    Write a high-quality, engaging blog post on the given topic.
    Use Markdown for formatting (headings, lists, bold text, etc.).

    Return ONLY a single JSON object with EXACTLY these keys:
    ${BLOG_POST_JSON_SCHEMA}

    Rules:
    - Do not wrap the JSON in markdown fences.
    - seoKeywords must be a JSON array of strings, not a comma-separated string.
    - slug must be lowercase with hyphens only.
    - content must be the full article in Markdown.
  `;
  const userPrompt = `The topic for the blog post is: "${topic}"`;

  const actionKey: NicheFinderAcuActionKey = 'sales_script_pack';

  const aiOperation = async () => {
    const aiClient = new UniversalAIClient();
    return await aiClient.generateText({
      systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      allowFallback: true,
      jsonMode: true,
      temperature: 0.7,
      maxOutputTokens: 4096,
      featureType: 'long_chat',
      tier: 'professional',
    });
  };

  try {
    const { result, billingDetails } = await handleBilledOperation({
      userId,
      actionKey,
      aiOperation,
    });

    const parsed = parseAiJson(result.text);
    const normalized = normalizeBlogPostAiOutput(parsed);

    if (!normalized) {
      console.error('AI output could not be normalized:', parsed);
      throw new Error('AI returned data in an invalid format. Try again with a shorter or clearer topic.');
    }

    const validationResult = BlogPostOutputSchema.safeParse(normalized);

    if (!validationResult.success) {
      console.error('AI output failed Zod validation:', validationResult.error.flatten());
      throw new Error('AI returned data in an invalid format. Try again with a shorter or clearer topic.');
    }

    return { blogPost: validationResult.data, billingDetails };
  } catch (error: any) {
    console.error(`[generateBlogPost] Failed: ${error.message}`);
    throw error;
  }
}
