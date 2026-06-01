
'use server';

/**
 * @fileOverview Venture OS Asset Generation Engine.
 * Orchestrates Commercial, Document, Strategy, and Prediction agents.
 * Enforces Standard 8-Point AI Output Format in Markdown Content.
 */

import { z } from 'zod';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { getAgentDirectives } from '@/backend/ai/agent-manifest';
import type { VentureProject } from '@nichefinder/domain-types';

const AssetTypeSchema = z.enum([
  'market_validation',
  'financial_forecast_3yr',
  'business_plan',
  'risk_heatmap',
  'execution_roadmap'
]);

export type AssetType = z.infer<typeof AssetTypeSchema>;

const GenerateAssetInputSchema = z.object({
  project: z.any().describe('The current venture project data.'),
  assetType: AssetTypeSchema,
});

const GenerateAssetOutputSchema = z.object({
  title: z.string(),
  content: z.string().describe('The primary content in Markdown format.'),
  structuredData: z.record(z.any()).optional().describe('Key metrics or data points extracted.'),
  nextSteps: z.array(z.string()),
  riskWarnings: z.array(z.string()),
});

export type GenerateAssetOutput = z.infer<typeof GenerateAssetOutputSchema>;

/**
 * Generates a high-value venture asset using multi-agent orchestration.
 * The report summary section MUST follow the Standard 8-Point Output Format.
 */
export async function generateVentureAsset(input: { project: VentureProject; assetType: AssetType }): Promise<GenerateAssetOutput> {
  const aiClient = new UniversalAIClient();
  const { project, assetType } = input;

  // Dynamically select agents based on asset type
  const agentSelection: Record<AssetType, any[]> = {
    market_validation: ['NICHE_DISCOVERY', 'DATA_INTELLIGENCE', 'STRATEGY'],
    financial_forecast_3yr: ['COMMERCIAL', 'PREDICTION', 'SCORING'],
    business_plan: ['DOCUMENT', 'STRATEGY', 'COMMUNICATION'],
    risk_heatmap: ['PREDICTION', 'COMPLIANCE', 'DATA_INTELLIGENCE'],
    execution_roadmap: ['WORKFLOW', 'AUTOMATION', 'STRATEGY'],
  };

  const agents = getAgentDirectives(agentSelection[assetType] as any);

  const systemPrompt = `
    You are the Venture OS Asset Production Engine.
    You are coordinating the following agents to generate a ${assetType.replace('_', ' ')} for the venture "${project.title}":

    ${agents}

    PROJECT CONTEXT:
    - Title: ${project.title}
    - Market: ${project.country} (${project.sector})
    - Confidence Score: ${project.confidenceScore}/100
    - Status: ${project.status}
    - Assumptions: ${project.workspaceMemory.commercialAssumptions.join(', ')}

    ASSET-SPECIFIC DIRECTIVE:
    - [${assetType.toUpperCase()}]: Produce a deep-reasoning, high-authority document.
    - No generic filler. Use specific data points relative to ${project.country}.
    - Ensure the output is formatted in clean Markdown.
    
    MANDATORY REPORT STRUCTURE:
    Every report MUST begin with an "EXECUTIVE SUMMARY" section that follows the Standard 8-Point Output Format:
    1. Situation
    2. Insight
    3. Risk
    4. Recommendation
    5. Next Action
    6. Owner (usually "Operator")
    7. Deadline
    8. Confidence Level (High/Medium/Low)

    Return a valid JSON object matching the requested schema.
  `;

  try {
    const result = await aiClient.generateText({
      systemPrompt,
      messages: [{ role: 'user', content: `Produce the ${assetType} report following the standard 8-point executive summary rule.` }],
      featureType: assetType === 'business_plan' ? 'long_chat' : 'short_chat',
      tier: 'professional',
      jsonMode: true,
      temperature: 0.3,
    });

    return GenerateAssetOutputSchema.parse(JSON.parse(result.text));
  } catch (error: any) {
    console.error(`[GenerateAssetFlow] Failed for ${assetType}:`, error);
    throw new Error(`Production engine failed: ${error.message}`);
  }
}
