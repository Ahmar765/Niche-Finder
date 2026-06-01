
export * from './schemas';

// --- Core Types ---
export type TrafficLight = "green" | "amber" | "red";
export type DecisionLabel = "STRONG_GO" | "CONDITIONAL_GO" | "NO_GO";
export type DigitalPreference = "digital" | "non_digital" | "hybrid";
export type BusinessTypeOption = | "digital" | "non_digital" | "boring_business" | "hybrid" | "any";
export type DiscoveryMode = "no_idea" | "around_me" | "skills_based" | "budget_based" | "problem_based" | "trend_based" | "boring_business";
export type BusinessGoal = "micro_cashflow" | "investor_startup";
export type SearchPriority = "standard" | "high_profit" | "low_competition" | "breakthrough" | "balanced";

/**
 * OS CORE: Platform AI Output Contract (Rule 5 & 6)
 */
export interface AiOperatingOutput {
  situation: string;
  insight: string;
  risk: string;
  recommendation: string;
  nextAction: string;
  owner: string;
  deadline: string;
  confidenceLevel: "low" | "medium" | "high";
  auditReferenceId?: string;
  bestOption?: string;
  alternativeOption?: string;
  riskOfInaction?: string;
  commercialImpact?: string;
  operationalImpact?: string;
  suggestedSearchPriority?: SearchPriority;
  nextBestAction?: string;
}

/**
 * SEO OS: Core Domain Entities
 */
export type SeoAgentType = 
  | "serp_domination" 
  | "content_creation" 
  | "content_refresh" 
  | "social_virality" 
  | "backlink_acquisition" 
  | "ai_search_optimisation";

export type SeoArticleStatus = "draft" | "published" | "scheduled" | "refresh_required" | "archived";
export type SeoContentType = "pillar" | "supporting" | "geo" | "comparison" | "faq" | "landing" | "case_study";

export interface SeoArticle {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown
  contentType: SeoContentType;
  status: SeoArticleStatus;
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
    schemaJson: string; // JSON-LD
    ogTags: Record<string, string>;
    twitterCard?: string;
  };
  analytics: {
    views: number;
    uniqueVisitors: number;
    avgReadTime: number;
    scrollDepth: number;
    ctr: number;
    bounceRate: number;
  };
  backlinks: Array<{ url: string; authority: number; source: string; status: 'active' | 'lost' }>;
  revisions: Array<{ id: string; timestamp: string; authorId: string; changeSummary: string }>;
  publishedAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  authorId: string;
  tags: string[];
}

export interface KeywordCluster {
  id: string;
  mainKeyword: string;
  synonyms: string[];
  searchVolume: number;
  difficulty: number; // 0-100
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  status: 'targeted' | 'ranking' | 'opportunity';
  lastChecked: string;
}

export interface SeoAnalyticsSnapshot {
  id: string;
  timestamp: string;
  totalUniqueVisitors: number;
  totalViews: number;
  avgDwellTime: number;
  topKeywords: Array<{ keyword: string; position: number; growth: number; volume: number }>;
  competitorAttacks: Array<{ competitor: string; keyword: string; gap: number; risk: 'low' | 'medium' | 'high' }>;
  aiSearchVisibility: number; // 0-100 score
  domainAuthority: number;
}

export interface SocialAmplificationTask {
  id: string;
  articleId: string;
  platform: 'tiktok' | 'linkedin' | 'x' | 'facebook' | 'youtube_shorts' | 'reddit';
  script: string;
  status: 'pending' | 'scheduled' | 'posted';
  postUrl?: string;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

/**
 * OS CORE: Agent Registry
 */
export type AgentType =
  | "strategy"
  | "niche_discovery"
  | "scoring"
  | "workflow"
  | "data_intelligence"
  | "prediction"
  | "document"
  | "communication"
  | "compliance"
  | "commercial"
  | "automation"
  | "personalisation"
  | SeoAgentType;

export interface AgentTask {
  id: string;
  agent: AgentType;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  input: Record<string, unknown>;
  status: "queued" | "running" | "completed" | "failed";
  output?: Record<string, unknown>;
  confidence?: "low" | "medium" | "high";
  createdAt: string;
  completedAt?: string;
}

// --- Platform Event Triggers ---
export type PlatformEventType =
  | "search.created"
  | "search.completed"
  | "niche.selected"
  | "niche.rejected"
  | "plan.generated"
  | "asset.generated"
  | "document.uploaded"
  | "payment.completed"
  | "recommendation.accepted"
  | "recommendation.rejected"
  | "workflow.completed"
  | "workflow.blocked"
  | "workflow.failed"
  | "output.edited"
  | "user.abandoned_process"
  | "automation.suggested"
  | "risk.detected"
  | "memory.synchronized"
  | "profile.updated"
  | "support.question_asked"
  | "seo.content_generated"
  | "seo.content_published"
  | "seo.rank_updated"
  | "seo.refresh_triggered"
  | "seo.social_amplification_created";

export interface PlatformEvent {
  id: string;
  userId: string;
  projectId?: string;
  sessionId?: string;
  eventType: PlatformEventType;
  tags: string[];
  payload: Record<string, unknown>;
  createdAt: string;
  linkage?: {
    decisionId?: string;
    previousEventId?: string;
    outcomeStatus?: "pending" | "success" | "failure" | "ignored";
  };
}

// --- Structured AI Memory Models ---

export interface UserMemory {
  userId: string;
  preferredCountries: string[];
  preferredSectors: string[];
  riskTolerance: "low" | "medium" | "high";
  acceptedRecommendations: string[];
  rejectedRecommendations: string[];
  frequentActions: string[];
  decisionStyle?: string;
}

export interface WorkspaceMemory {
  workspaceId: string;
  documents: string[];
  templates: string[];
  businessRules: string[];
  historicalDecisions: Array<{ id: string; decision: string; date: string; outcome?: string }>;
  commercialAssumptions: Record<string, any>;
}

export interface ProcessMemory {
  processId: string;
  stage: string;
  completed: string[];
  pending: string[];
  blocked: string[];
  nextDecisionRequired?: string;
  nextRecommendedAction?: string;
  completedActions: string[];
}

export interface IntelligenceMemory {
  patternId: string;
  signalType: string;
  description: string;
  confidence: "low" | "medium" | "high";
  relatedWorkflows: string[];
  recommendedImprovement?: string;
}

// --- Global Aggregate State ---

export interface VentureUserMemory {
  userId: string;
  userMemory: UserMemory;
  behaviour: {
    totalSearches: number;
    totalUnlocks: number;
    totalGeneratedAssets: number;
    lastActive: string;
    acceptedNicheIds: string[];
    rejectedNicheIds: string[];
    frequentActions: string[];
    editedOutputCount: number;
    workflowSuccessRate: number;
    commonQuestions: string[];
  };
  intelligenceMemory: {
    patterns: IntelligenceMemory[];
    proactiveAlerts: Array<{ id: string; type: string; severity: string; message: string; detectedAt: string }>;
    automationRecommendations: Array<{ id: string; title: string; description: string; actionType: string; potentialTimeSaving: string }>;
    repeatedRisks: string[];
    learnedRules: string[];
  };
  intelligence: AiOperatingOutput;
  updatedAt: string;
  autosave?: AutosaveMetadata;
}

// --- Project Model ---

export interface VentureProject {
  id: string;
  userId: string;
  nicheId: string;
  title: string;
  country: string;
  sector: string;
  status: string;
  confidenceScore: number;
  totalAcuSpent: number;
  workspaceMemory: WorkspaceMemory;
  processMemory: ProcessMemory;
  assets: Record<string, string>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  autosave?: AutosaveMetadata;
}

// --- Search & Discovery ---
export interface SearchRequest {
  countryCode: string;
  cityId?: string;
  sectorSlugs?: string[];
  businessType?: BusinessTypeOption;
  digitalPreference?: DigitalPreference;
  lifecycleStage?: string;
  targetCustomer?: string;
  businessModel?: string;
  incomeModel?: string;
  maxCapitalUsd?: number;
  note260?: string;
  discoveryMode?: DiscoveryMode;
  businessGoal?: BusinessGoal;
  searchPriority?: SearchPriority;
  experienceLevel?: "beginner" | "intermediate" | "experienced" | "expert";
  fundingGoal?: "self_funded" | "grant" | "loan" | "angel_investment" | "vc_investment" | "not_sure";
  timeline?: "start_immediately" | "within_30_days" | "within_90_days" | "within_6_months" | "research_only";
  preferredModel?: "recurring_revenue" | "high_margin" | "low_startup_cost" | "local_demand" | "scalable" | "cashflow_stable" | "any";
}

export interface Recommendation {
  recommendationId: string;
  rank: number;
  confidenceScore?: number;
  niche: NicheCandidate;
  scores: VentureScorecard;
  rawScores?: ScoreInputs;
  explanation: RecommendationExplanation;
  groundedSources?: GroundedSource[];
  is_unlocked?: boolean;
  unlocked_at?: any;
  acu_spent_unlock?: number;
  decisionSupport?: {
    bestOption: string;
    alternativeOption: string;
    riskOfInaction: string;
    commercialImpact: string;
    operationalImpact: string;
  };
  autosave?: AutosaveMetadata;
}

// --- Niche & Scoring ---
export interface NicheCandidate {
  id: string;
  countryCode: string;
  cityId?: string;
  sectorSlug: string;
  title: string;
  summary: string;
  targetAudience: string[];
  lifecycleStage: string;
  businessModel: string;
  revenueModel: string;
  entryBarriers: string[];
  digitalMode: DigitalPreference;
  maxCapitalUsd: number;
  estimatedStartupCostUsd?: number;
  monthlyOpexUsd?: number;
  timeToFirstRevenueDays?: number;
  tags?: string[];
}

export interface ScoreInputs {
  regulatorySimplicity: number;       
  infrastructureReadiness: number;    
  skillAvailability: number;          
  capitalIntensity: number;           
  timeToFirstRevenueScore: number;    
  operationalComplexity: number;      
  competitorCountScore: number;       
  informalSubstitutesScore: number;   
  marketFragmentationScore: number;   
  priceSensitivityScore: number;      
  switchingCostScore: number;         
  differentiationPotentialScore: number; 
  painIntensityScore: number;         
  revenueFrequencyScore: number;      
  abilityToPayScore: number;          
  scalabilityScore: number;           
  cashflowStabilityScore: number;     
  replicabilityScore: number;         
  noveltyScore?: number;              
  technologyEnablementScore?: number; 
  timingAdvantageScore?: number;      
  unmetDemandScore?: number;          
  defensibilityScore?: number;        
}

export interface VentureScorecard {
  readinessScore: number;
  competitivenessScore: number;
  successProbabilityScore: number;
  breakthroughPotentialScore?: number; 
  profitPotentialScore: number;
  executionDifficultyScore: number;
  fundingAttractivenessScore: number;
  marketUrgencyScore: number;
  digitalScalabilityScore: number;
  capitalEfficiencyScore: number;
  founderSuitabilityScore: number;
  overallConfidenceScore: number;
  scoringExplanation: {
    strongestSignal: string;
    weakestSignal: string;
    riskWarning: string;
    investorInterpretation: string;
  };
}

export interface RecommendationExplanation {
  whyNow: string;
  whyThisCountry: string;
  mainRisk: string;
  evidenceSummary: string[];
  breakthroughRationale?: string;
  situation?: string;
  insight?: string;
}

export interface GroundedSource {
  sourceType: "google_search" | "vertex_search" | "private_doc" | "upload";
  title?: string;
  uri?: string;
  snippet?: string;
  provider: "vertex";
}

export interface AutosaveMetadata {
  status: "saved" | "saving" | "failed";
  lastSavedAt: string;
  savedBy: string;
  version: number;
  changeSummary?: string;
  auditReferenceId?: string;
}
