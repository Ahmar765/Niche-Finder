'use server';
/**
 * @fileOverview A precision-first, context-aware Support Co-pilot for the Venture OS.
 * Orchestrates Communication and Data Intelligence agents.
 */
import { z } from 'zod';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { handleBilledOperation } from '@/backend/billing';
import type { NicheFinderAcuActionKey } from '@/config/acuActions';
import { ACU_SYSTEM } from '@/config/acuSystem';
import type { VentureUserMemory } from '@nichefinder/domain-types';
import { getAgentDirectives } from '@/backend/ai/agent-manifest';
import { normalizeSupportChatAiOutput, parseAiJson } from '@/lib/parse-ai-json';

const SupportChatInputSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  userMemory: z.any().optional().describe('The current user venture state and history.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  response: z.string(),
  escalateToHuman: z.boolean(),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

function buildMemoryContext(userMemory?: VentureUserMemory): string {
  if (!userMemory) return 'User is new to the OS.';

  const preferredSectors = userMemory.userMemory?.preferredSectors ?? [];
  const totalSearches = userMemory.behaviour?.totalSearches ?? 0;
  const totalUnlocks = userMemory.behaviour?.totalUnlocks ?? 0;
  const nextBestAction = userMemory.intelligence?.nextBestAction ?? 'Explore niches';

  return `
    USER VENTURE CONTEXT (COMMAND CENTER):
    - Top Sectors: ${preferredSectors.length ? preferredSectors.join(', ') : 'None yet'}
    - Activity: ${totalSearches} searches, ${totalUnlocks} unlocks.
    - Current System Suggestion: ${nextBestAction}
  `;
}

function normalizeChatHistory(history: SupportChatInput['history']) {
  const trimmed = history.filter((entry) => entry.content.trim().length > 0);
  while (trimmed.length > 0 && trimmed[0].role === 'assistant') {
    trimmed.shift();
  }
  return trimmed;
}

export async function getSupportChatResponse(userId: string, input: SupportChatInput, userMemory?: VentureUserMemory) {
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const agents = getAgentDirectives(['communication', 'data_intelligence']);
  const memoryContext = buildMemoryContext(userMemory);
  const history = normalizeChatHistory(input.history);

  const systemPrompt = `
    You are NicheBot, the Core Support Co-pilot for Niche Finder.
    You coordinate the following agents to assist the user:

    ${agents}

    OPERATIONAL DIRECTIVE:
    - [COMMUNICATION]: Maintain a professional, high-authority, decisive tone. Outcome-first.
    - [DATA_INTELLIGENCE]: Ingest the provided USER VENTURE CONTEXT to tailor answers. Do not ask for info already in memory.

    **PLATFORM OVERVIEW:**
    - Conversion: 100 ACUs ≈ £1.00 GBP.
    - Welcome Bonus: ${ACU_SYSTEM.welcomeBonus.amount} free ACUs (read-only).
    - Paid Actions: Required for generation, unlocks, and exports.

    ${memoryContext}

    Return ONLY JSON with this exact shape:
    {"response":"your reply to the user","escalateToHuman":false}
    Set escalateToHuman to true only when human judgment is truly required.
  `;

  const aiMessages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: input.message },
  ];

  const actionKey: NicheFinderAcuActionKey = 'support_chat_message';

  const aiOperation = async () => {
    const aiClient = new UniversalAIClient();
    return await aiClient.generateText({
      systemPrompt,
      messages: aiMessages,
      preferredProvider: 'gemini',
      allowFallback: true,
      jsonMode: true,
      temperature: 0.2,
      maxOutputTokens: 1024,
      featureType: 'short_chat',
      tier: 'control',
    });
  };

  try {
    const { result, billingDetails } = await handleBilledOperation({
      userId,
      actionKey,
      aiOperation,
    });

    const parsed = parseAiJson(result.text);
    const normalized = normalizeSupportChatAiOutput(parsed);
    const validationResult = normalized
      ? SupportChatOutputSchema.safeParse(normalized)
      : { success: false as const, error: null };

    if (!validationResult.success) {
      return {
        response: {
          response: "Hello! I'm NicheBot. I can help with ACU credits, niche discovery, venture workflows, and platform navigation. What would you like to do?",
          escalateToHuman: false,
        },
        billingDetails,
      };
    }

    return { response: validationResult.data, billingDetails };
  } catch (error: any) {
    console.error(`[getSupportChatResponse] Failed: ${error.message}`);

    if (error.message?.includes('INSUFFICIENT_ACUS') || error.message?.includes('Wallet not found')) {
      return {
        response: {
          response: 'Your wallet needs to be initialized or topped up before I can run intelligence tasks. Visit your dashboard to complete setup or add ACU credits.',
          escalateToHuman: false,
        },
        billingDetails: null,
      };
    }

    return {
      response: {
        response: "I'm online, but my intelligence sync hit a temporary issue. Please try your message again in a moment.",
        escalateToHuman: false,
      },
      billingDetails: null,
    };
  }
}
