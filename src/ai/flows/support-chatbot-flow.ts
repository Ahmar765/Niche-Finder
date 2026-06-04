'use server';
/**
 * @fileOverview A precision-first, context-aware Support Co-pilot for the Venture OS.
 * Orchestrates Communication and Data Intelligence agents.
 */
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { handleBilledOperation } from '@/backend/actions';
import type { NicheFinderAcuActionKey } from '@/config/acuActions';
import { ACU_SYSTEM } from '@/config/acuSystem';
import type { VentureUserMemory } from '@nichefinder/domain-types';
import { AI_AGENTS, getAgentDirectives } from '@/backend/ai/agent-manifest';

// --- SCHEMA DEFINITIONS ---
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
  response: z.string().describe('A short, direct, decisive, outcome-first response.'),
  escalateToHuman: z.boolean().describe('Set to true ONLY if query requires human judgment.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;


// --- MAIN FLOW FUNCTION ---
export async function getSupportChatResponse(userId: string, input: SupportChatInput, userMemory?: VentureUserMemory) {
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const agents = getAgentDirectives(['communication', 'data_intelligence']);

  const memoryContext = userMemory ? `
    USER VENTURE CONTEXT (COMMAND CENTER):
    - Top Sectors: ${userMemory.userMemory.preferredSectors.join(', ')}
    - Activity: ${userMemory.behaviour.totalSearches} searches, ${userMemory.behaviour.totalUnlocks} unlocks.
    - Current System Suggestion: ${userMemory.intelligence.nextBestAction}
  ` : "User is new to the OS.";

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
  `;

  const aiMessages = [
    ...input.history.map(m => ({ role: m.role, content: m.content })),
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
      maxOutputTokens: 512,
      featureType: 'short_chat',
      tier: 'control'
    });
  };

  try {
    const { result, billingDetails } = await handleBilledOperation({
      userId,
      actionKey,
      aiOperation,
    });

    const aiJson = JSON.parse(result.text);
    const validationResult = SupportChatOutputSchema.safeParse(aiJson);

    if (!validationResult.success) {
      return { 
          response: { response: "I'm having trouble processing that venture logic. I'll escalate to our human strategy team.", escalateToHuman: true }, 
          billingDetails 
      };
    }

    return { response: validationResult.data, billingDetails };

  } catch (error: any) {
    console.error(`[getSupportChatResponse] Failed: ${error.message}`);
    return { 
        response: { response: "An unexpected OS error occurred. Escalating to technical support.", escalateToHuman: true },
        billingDetails: null
    };
  }
}
