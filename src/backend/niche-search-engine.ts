import { v4 as uuidv4 } from 'uuid';
import { handleBilledOperation } from '@/backend/billing';
import { fetchJsonText } from '@/backend/ai/fetch-json-text';
import type { Recommendation, SearchRequest, VentureUserMemory } from '@nichefinder/domain-types';
import { getAgentDirectives } from '@/backend/ai/agent-manifest';
import { normalizeNicheSearchAiOutput, parseAiJson } from '@/lib/parse-ai-json';

const generatePrompt = (input: SearchRequest, isInvestorMode: boolean, memory?: VentureUserMemory) => {
  const memoryContext = memory
    ? `
        USER COGNITIVE PROFILE (MEMORY LAYER):
        - Risk Tolerance: ${memory.userMemory.riskTolerance}
        - Historical preference for: ${memory.userMemory.preferredCountries.join(', ')}
        - Deep interest in sectors: ${memory.userMemory.preferredSectors.join(', ')}
        - Behavior pattern: Total ${memory.behaviour.totalSearches} searches, ${memory.behaviour.totalUnlocks} unlocks.
    `
    : '';

  const agents = getAgentDirectives(['niche_discovery', 'strategy', 'scoring', 'commercial', 'prediction']);
  const isBreakthroughMode = input.searchPriority === 'breakthrough';

  const breakthroughDirectives = isBreakthroughMode
    ? `
        OPERATIONAL DIRECTIVE (BREAKTHROUGH DISCOVERY):
        You are in BREAKTHROUGH MODE. Prioritise niches that are:
        - Highly profitable but not yet mainstream.
        - Strongly scalable with ≤ 10k startup cost equivalent.
        - Enabled by NEW behaviour, technology, or market timing.
        - "Rarely executed" or "Underbuilt" in the target market.

        BREAKTHROUGH POTENTIAL SCORE (BPS):
        For every niche, calculate a BPS (0-10) based on:
        1. Novelty (Is it fresh for this market?)
        2. Unmet Demand (High pain, low service)
        3. Tech Enablement (Does it use AI/Automation to lower costs?)
        4. Timing Advantage (Why now?)
        5. Defensibility (Can it be easily copied?)

        TERMINOLOGY RULE:
        NEVER claim something has "never been created before" or is a "world first".
        USE: "underbuilt", "rarely executed", "not yet mainstream", "emerging opportunity", "low visible adoption".

        FALLBACK RULE:
        If no credible breakthrough opportunities meeting the ≤ 10k cost rule can be found for this market,
        FALL BACK to generating high-quality, balanced standard opportunities.
        In fallback cases, set breakthroughPotentialScore to null.
    `
    : 'Prioritise balanced, realistic, and fundable opportunities.';

  const systemPrompt = `
        You are the Niche Finder Operating System (NF-OS). You are operating as a Multi-Agent Reasoning Engine.

        ACTIVE AGENTS FOR THIS OPERATION:
        ${agents}

        MISSION:
        Generate 3-5 hyper-specific, fundable business opportunities.

        ${memoryContext}

        DISCOVERY MODE: ${input.searchPriority}
        SEARCH CONSTRAINTS: Country ${input.countryCode}, Budget Max ${input.maxCapitalUsd} USD equivalent.

        ${breakthroughDirectives}

        DECISION INTELLIGENCE DIRECTIVE:
        For every niche, you MUST provide decision support data:
        - Why this is the best option for the user context.
        - One alternative niche or pivot path.
        - Risk of doing nothing (opportunity cost).
        - Commercial impact (estimated ROI/scale).
        - Operational impact (effort level).

        Hard Rules:
        - Return strict JSON only. No prose, markdown, or code fences.
        - Every property name must use double quotes.
        - No trailing commas. Use null instead of undefined.
        - Keep string values concise; escape internal double quotes.
    `;

  const userPrompt = `
        Search Criteria:
        - Country: ${input.countryCode}
        - Sectors: ${input.sectorSlugs?.join(', ') || 'Any'}
        - Context: ${input.note260 || 'None'}
        - Discovery Priority: ${input.searchPriority}

        Return JSON format:
        {
          "results": [
            {
              "title": "string",
              "description": "string",
              "situation": "string",
              "insight": "string",
              "scorecard": {
                 "overallConfidenceScore": 85,
                 "scoringExplanation": {
                   "riskWarning": "string",
                   "strongestSignal": "string"
                 },
                 "breakthroughPotentialScore": 0
              },
              "rawScores": {
                "demand": 0,
                "competition": 0,
                "timing": 0
              },
              "explanation": {
                 "breakthroughRationale": "string or null"
              },
              "decisionSupport": {
                "bestOption": "string",
                "alternativeOption": "string",
                "riskOfInaction": "string",
                "commercialImpact": "string",
                "operationalImpact": "string"
              }
            }
          ]
        }
    `;

  return { systemPrompt, userPrompt };
};

export async function runNicheSearch(
  userId: string,
  input: SearchRequest,
  isInvestorMode: boolean,
  memory?: VentureUserMemory,
) {
  const { systemPrompt, userPrompt } = generatePrompt(input, isInvestorMode, memory);

  const aiOperation = async () => {
    const temperature = input.searchPriority === 'breakthrough' ? 0.7 : 0.5;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await fetchJsonText({
        systemPrompt,
        userPrompt:
          attempt === 0
            ? userPrompt
            : `${userPrompt}\n\nYour previous response was invalid JSON. Reply again with ONLY a valid JSON object matching the schema. Double-quote all keys. No trailing commas.`,
        temperature: attempt === 0 ? temperature : 0.2,
        maxOutputTokens: 4096,
      });

      try {
        parseAiJson<Record<string, unknown>>(result.text);
        return { text: result.text, provider: result.provider, model: result.model };
      } catch (parseError) {
        if (attempt === 1) throw parseError;
        console.warn('[runNicheSearch] Invalid JSON from AI, retrying once:', parseError);
      }
    }

    throw new Error('AI response was not valid JSON.');
  };

  const { result, billingDetails } = await handleBilledOperation({
    userId,
    actionKey: 'niche_search',
    aiOperation,
  });

  const parsed = parseAiJson<Record<string, unknown>>(result.text);
  const items = normalizeNicheSearchAiOutput(parsed);

  if (items.length === 0) {
    throw new Error('AI returned no niche ideas in a valid format. Please try again.');
  }

  const recommendations: Recommendation[] = items.map((r, idx) => ({
    recommendationId: uuidv4(),
    rank: idx + 1,
    confidenceScore:
      typeof r.scorecard.overallConfidenceScore === 'number' ? r.scorecard.overallConfidenceScore : 85,
    niche: {
      id: uuidv4(),
      countryCode: input.countryCode,
      sectorSlug: r.sector,
      title: r.title,
      summary: r.description,
      targetAudience: [r.targetCustomer],
      lifecycleStage: 'Idea',
      businessModel: r.businessModel,
      revenueModel: r.revenueLogic,
      entryBarriers: [],
      digitalMode: 'hybrid',
      maxCapitalUsd: input.maxCapitalUsd || 10000,
    },
    scores: r.scorecard as unknown as Recommendation['scores'],
    rawScores: r.rawScores as unknown as Recommendation['rawScores'],
    explanation: {
      situation: r.situation,
      insight: r.insight,
      whyNow: r.solution,
      whyThisCountry: `Market gap identified in ${input.countryCode}.`,
      mainRisk:
        (r.scorecard.scoringExplanation as { riskWarning?: string } | undefined)?.riskWarning ??
        'Standard execution risk',
      evidenceSummary: [
        (r.scorecard.scoringExplanation as { strongestSignal?: string } | undefined)?.strongestSignal ??
          'High demand',
      ],
      breakthroughRationale: r.breakthroughRationale,
    },
    decisionSupport: r.decisionSupport as unknown as Recommendation['decisionSupport'],
  }));

  return { recommendations, billingDetails };
}

/** @deprecated Use runNicheSearch from this module instead. */
export async function generateNicheIdeasFlow(
  userId: string,
  input: SearchRequest,
  isInvestorMode: boolean,
  memory?: VentureUserMemory,
) {
  return runNicheSearch(userId, input, isInvestorMode, memory);
}
