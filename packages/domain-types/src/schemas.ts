
import { z } from 'zod';

export const DigitalPreferenceSchema = z.enum(["digital", "non_digital", "hybrid"]);

export const AutosaveMetadataSchema = z.object({
  status: z.enum(["saved", "saving", "failed"]),
  lastSavedAt: z.string(),
  savedBy: z.string(),
  version: z.number(),
  changeSummary: z.string().optional(),
  auditReferenceId: z.string().optional(),
});

export const AiOperatingOutputSchema = z.object({
  situation: z.string().describe('What is currently happening.'),
  insight: z.string().describe('Strategic insight derived from the situation.'),
  risk: z.string().describe('Identified risks in the current trajectory.'),
  recommendation: z.string().describe('Primary strategic advice.'),
  nextAction: z.string().describe('The most practical immediate step.'),
  owner: z.string().describe('Who is responsible for the action.'),
  deadline: z.string().describe('When the action is required.'),
  confidenceLevel: z.enum(['low', 'medium', 'high']).describe('Certainty of this evaluation.'),
  auditReferenceId: z.string().optional(),
  // Decision Intelligence
  bestOption: z.string().optional(),
  alternativeOption: z.string().optional(),
  riskOfInaction: z.string().optional(),
  commercialImpact: z.string().optional(),
  operationalImpact: z.string().optional(),
  nextBestAction: z.string().optional(),
});

export const AgentTypeSchema = z.enum([
  "strategy",
  "niche_discovery",
  "scoring",
  "workflow",
  "data_intelligence",
  "prediction",
  "document",
  "communication",
  "compliance",
  "commercial",
  "automation",
  "personalisation"
]);

export const AgentTaskSchema = z.object({
  id: z.string(),
  agent: AgentTypeSchema,
  userId: z.string(),
  workspaceId: z.string().optional(),
  input: z.record(z.any()),
  status: z.enum(["queued", "running", "completed", "failed"]),
  output: z.record(z.any()).optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const UserMemorySchema = z.object({
  userId: z.string(),
  preferredCountries: z.array(z.string()),
  preferredSectors: z.array(z.string()),
  riskTolerance: z.enum(["low", "medium", "high"]),
  acceptedRecommendations: z.array(z.string()),
  rejectedRecommendations: z.array(z.string()),
  frequentActions: z.array(z.string()),
  decisionStyle: z.string().optional(),
});

export const WorkspaceMemorySchema = z.object({
  workspaceId: z.string(),
  documents: z.array(z.string()),
  templates: z.array(z.string()),
  businessRules: z.array(z.string()),
  historicalDecisions: z.array(z.object({
    id: z.string(),
    decision: z.string(),
    date: z.string(),
    outcome: z.string().optional(),
  })),
  commercialAssumptions: z.record(z.any()),
});

export const ProcessMemorySchema = z.object({
  processId: z.string(),
  stage: z.string(),
  completed: z.array(z.string()),
  pending: z.array(z.string()),
  blocked: z.array(z.string()),
  nextDecisionRequired: z.string().optional(),
  nextRecommendedAction: z.string().optional(),
  completedActions: z.array(z.string()),
});

export const IntelligenceMemorySchema = z.object({
  patternId: z.string(),
  signalType: z.string(),
  description: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  relatedWorkflows: z.array(z.string()),
  recommendedImprovement: z.string().optional(),
});

export const NicheCandidateSchema = z.object({
  id: z.string(),
  countryCode: z.string(),
  cityId: z.string().optional(),
  sectorSlug: z.string(),
  title: z.string(),
  summary: z.string(),
  targetAudience: z.array(z.string()),
  lifecycleStage: z.string(),
  businessModel: z.string(),
  revenueModel: z.string(),
  entryBarriers: z.array(z.string()),
  digitalMode: DigitalPreferenceSchema,
  maxCapitalUsd: z.number(),
  estimatedStartupCostUsd: z.number().optional(),
  monthlyOpexUsd: z.number().optional(),
  timeToFirstRevenueDays: z.number().optional(),
});

export const ScoreInputsSchema = z.object({
  regulatorySimplicity: z.number(),
  infrastructureReadiness: z.number(),
  skillAvailability: z.number(),
  capitalIntensity: z.number(),
  timeToFirstRevenueScore: z.number(),
  operationalComplexity: z.number(),
  competitorCountScore: z.number(),
  informalSubstitutesScore: z.number(),
  marketFragmentationScore: z.number(),
  priceSensitivityScore: z.number(),
  switchingCostScore: z.number(),
  differentiationPotentialScore: z.number(),
  painIntensityScore: z.number(),
  revenueFrequencyScore: z.number(),
  abilityToPayScore: z.number(),
  scalabilityScore: z.number(),
  description: z.string().optional(),
  cashflowStabilityScore: z.number(),
  replicabilityScore: z.number(),
  // Breakthrough
  noveltyScore: z.number().optional(),
  technologyEnablementScore: z.number().optional(),
  timingAdvantageScore: z.number().optional(),
  unmetDemandScore: z.number().optional(),
  defensibilityScore: z.number().optional(),
});

export const VentureScorecardSchema = z.object({
  readinessScore: z.number(),
  competitivenessScore: z.number(),
  successProbabilityScore: z.number(),
  breakthroughPotentialScore: z.number().optional(),
  profitPotentialScore: z.number(),
  executionDifficultyScore: z.number(),
  fundingAttractivenessScore: z.number(),
  marketUrgencyScore: z.number(),
  digitalScalabilityScore: z.number(),
  capitalEfficiencyScore: z.number(),
  founderSuitabilityScore: z.number(),
  overallConfidenceScore: z.number(),
  scoringExplanation: z.object({
    strongestSignal: z.string(),
    weakestSignal: z.string(),
    riskWarning: z.string(),
    investorInterpretation: z.string(),
  }),
});


export const RecommendationExplanationSchema = z.object({
  whyNow: z.string(),
  whyThisCountry: z.string(),
  mainRisk: z.string(),
  evidenceSummary: z.array(z.string()),
  breakthroughRationale: z.string().optional(),
  situation: z.string().optional(),
  insight: z.string().optional(),
});

export const GroundedSourceSchema = z.object({
  sourceType: z.enum(["google_search", "vertex_search", "private_doc", "upload"]),
  title: z.string().optional(),
  uri: z.string().optional(),
  snippet: z.string().optional(),
  provider: z.literal("vertex"),
});

export const RecommendationSchema = z.object({
  recommendationId: z.string(),
  rank: z.number(),
  confidenceScore: z.number().optional(),
  niche: NicheCandidateSchema,
  scores: VentureScorecardSchema,
  rawScores: ScoreInputsSchema.optional(),
  explanation: RecommendationExplanationSchema,
  groundedSources: z.array(GroundedSourceSchema).optional(),
});
