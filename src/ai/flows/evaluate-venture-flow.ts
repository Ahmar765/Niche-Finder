
'use server';

/**
 * @fileOverview The Venture OS Evaluation Engine.
 * Multi-Agent Cognitive Evaluation Layer with Standard AiOperatingOutput.
 * Implements Learning Loop signals (Rule 13, 15).
 */

import { z } from 'zod';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { parseAiJson } from '@/lib/parse-ai-json';
import type { VentureUserMemory } from '@nichefinder/domain-types';
import { AiOperatingOutputSchema } from '@nichefinder/domain-types';
import { getAgentDirectives } from '@/backend/ai/agent-manifest';

const ProactiveAlertSchema = z.object({
    id: z.string(),
    type: z.enum(['viability', 'readiness', 'saturation', 'cost', 'workflow', 'missing_info', 'compliance', 'opportunity', 'inefficiency']),
    severity: z.enum(['low', 'medium', 'high']),
    message: z.string(),
});

const AutomationRecommendationSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    actionType: z.enum(['trigger', 'template', 'agent', 'workflow']),
    potentialTimeSaving: z.string(),
});

const EvaluateVentureOutputSchema = z.object({
  intelligence: AiOperatingOutputSchema,
  riskAssessment: z.string().describe('Silently identified risks in the current strategy.'),
  growthOpportunities: z.array(z.string()).describe('Identified areas for automation or improvement.'),
  automationRecommendations: z.array(AutomationRecommendationSchema).describe('Specific automation opportunities.'),
  proactiveAlerts: z.array(ProactiveAlertSchema).describe('Predictive detections.'),
  patternRecognition: z.object({
    successPatterns: z.array(z.string()),
    failedPatterns: z.array(z.string()),
    repeatedDecisions: z.array(z.string()).describe('Detected decisions the user has made multiple times across projects.'),
  }),
  learningAdjustments: z.object({
    recommendationLogic: z.string().describe('Instructions to adjust future niche discovery based on past rejections.'),
    calibrationNote: z.string().describe('Internal adjustment note for the scoring engine.'),
  }).optional(),
});

export type EvaluateVentureOutput = z.infer<typeof EvaluateVentureOutputSchema>;

/**
 * Executes a Tier 4 cognitive evaluation of the user's venture trajectory.
 * Ingests behavioral signals from memory and the platform event ledger.
 */
export async function evaluateVentureState(memory: VentureUserMemory): Promise<EvaluateVentureOutput> {
  const aiClient = new UniversalAIClient();
  const agents = getAgentDirectives([
    'workflow',
    'prediction',
    'compliance',
    'automation',
    'personalisation',
    'strategy',
    'data_intelligence',
  ]);

  // context from 'frequentActions' is now the summary of the platform event ledger
  const ledgerContext = memory.behaviour.frequentActions?.join(', ') || 'None available.';

  const systemPrompt = `
    You are the Core Intelligence of the Niche Finder Operating System.
    You coordinate a high-reasoning agent team to evaluate a user's venture journey.

    ${agents}

    OPERATIONAL DIRECTIVE (LEARNING LOOP):
    Analyze REJECTED vs ACCEPTED patterns. 
    Analyze EDITED AI OUTPUTS (Count: ${memory.behaviour.editedOutputCount}). 
    Analyze workflow success signals.
    Analyze the recent Platform Event Ledger: ${ledgerContext}

    OPERATIONAL DIRECTIVE (RULE 5 & 6):
    Every intelligence block MUST strictly follow the AiOperatingOutput schema:
    1. Situation
    2. Insight
    3. Risk
    4. Recommendation
    5. Next Action
    6. Owner
    7. Deadline
    8. Confidence Level (low, medium, high)

    PATTERN RECOGNITION:
    - If the user has rejected multiple "digital" niches, suggest focusing on "boring businesses."
    - Detect "Repeated Decisions" from the ledger context.

    Return a valid JSON object matching the requested schema.
    
    USER CONTEXT (MEMORY LAYER):
    - Risk Tolerance: ${memory.userMemory.riskTolerance}
    - Behaviour: ${memory.behaviour.totalSearches} searches, ${memory.behaviour.totalUnlocks} unlocks.
    - Historical Patterns: Accepted ${memory.behaviour.acceptedNicheIds.length}, Rejected ${memory.behaviour.rejectedNicheIds.length}
    - Common Questions: ${memory.behaviour.commonQuestions.join('; ') || 'None'}
  `;

  try {
    const result = await aiClient.generateText({
      systemPrompt,
      messages: [{ role: 'user', content: 'Execute tier 4 cognitive evaluation with self-correction signals.' }],
      featureType: 'short_chat',
      tier: 'control',
      jsonMode: true,
      temperature: 0.2,
    });

    return EvaluateVentureOutputSchema.parse(parseAiJson(result.text));
  } catch (error) {
    console.error('[EvaluateVentureFlow] Failed:', error);
    // Fallback logic
    return {
      intelligence: {
        situation: 'Operational baseline established.',
        insight: 'Discovery patterns are forming but require more validation signals.',
        risk: 'Limited rejection data reduces discovery precision.',
        recommendation: 'Complete more searches or provide feedback on current results.',
        nextAction: 'Review and refine your preferred sector filters.',
        owner: 'Operator',
        deadline: 'Within 48h',
        confidenceLevel: 'medium',
      },
      riskAssessment: 'Insufficient behavioral data for high-confidence prediction.',
      growthOpportunities: [],
      automationRecommendations: [],
      proactiveAlerts: [
          { id: 'alert_initial', type: 'readiness', severity: 'medium', message: 'Venture velocity is stable. Increase feedback loop density.' }
      ],
      patternRecognition: { successPatterns: [], failedPatterns: [], repeatedDecisions: [] }
    };
  }
}
