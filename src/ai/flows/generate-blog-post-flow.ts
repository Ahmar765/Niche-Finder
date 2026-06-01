'use server';

/**
 * @fileOverview A flow for generating a blog post with SEO metadata using a universal AI provider.
 * This flow is now connected to the ACU billing system.
 */
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { handleBilledOperation } from '@/backend/actions';
import type { NicheFinderAcuActionKey } from '@/config/acuActions';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';

// --- SCHEMA DEFINITIONS ---

// Input schema for the blog post generation flow
const BlogPostInputSchema = z.string().describe('The topic for the blog post.');
export type BlogPostInput = z.infer<typeof BlogPostInputSchema>;

// Output schema for the generated blog post
const BlogPostOutputSchema = z.object({
  title: z.string().describe('A catchy and engaging title for the blog post.'),
  slug: z.string().describe('A URL-friendly slug for the blog post (e.g., "how-to-find-your-niche").'),
  content: z.string().describe('The full content of the blog post, formatted in Markdown.'),
  seoTitle: z.string().describe('An SEO-optimized title for search engine results pages (SERPs), typically 50-60 characters.'),
  seoDescription: z.string().describe('A compelling meta description for SERPs, typically 150-160 characters.'),
  seoKeywords: z.array(z.string()).describe('A list of 3-5 relevant keywords for the blog post.'),
});
export type BlogPostOutput = z.infer<typeof BlogPostOutputSchema>;

// --- MAIN FLOW FUNCTION ---

/**
 * A server-callable function to generate a blog post from a topic.
 * This function orchestrates the billing and AI generation process.
 * @param userId The ID of the user requesting the blog post.
 * @param topic The topic of the blog post.
 * @returns A promise that resolves to the generated blog post data and billing details.
 * @throws An error if the user is not authenticated, has insufficient funds, or if the AI operation fails.
 */
export async function generateBlogPost(userId: string, topic: BlogPostInput) {
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const systemPrompt = `
    You are an expert content creator and SEO specialist for a startup called "Niche Finder".
    Your task is to write a high-quality, engaging blog post on a given topic.
    The blog post should be well-structured, informative, and written in a professional yet approachable tone.
    Use Markdown for formatting (headings, lists, bold text, etc.).
    You MUST generate a valid JSON object matching the schema.
  `;
  const userPrompt = `The topic for the blog post is: "${topic}"`;

  const actionKey: NicheFinderAcuActionKey = 'sales_script_pack'; // Using a similar "content generation" action key

  // Define the AI operation as a callback function.
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
      tier: 'professional'
    });
  };

  try {
    // Use the ACU Gateway to handle the billed operation.
    const { result, billingDetails } = await handleBilledOperation({
      userId,
      actionKey,
      aiOperation,
    });

    // Parse and validate the AI's JSON output.
    const blogPostJson = JSON.parse(result.text);
    const validationResult = BlogPostOutputSchema.safeParse(blogPostJson);

    if (!validationResult.success) {
      console.error("AI output failed Zod validation:", validationResult.error.flatten());
      throw new Error('AI returned data in an invalid format.');
    }

    return { blogPost: validationResult.data, billingDetails };

  } catch (error: any) {
    console.error(`[generateBlogPost] Failed: ${error.message}`);
    // Re-throw the error to be caught by the calling UI.
    throw error;
  }
}
