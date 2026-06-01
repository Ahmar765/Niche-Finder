
'use server';

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { UniversalAIClient } from '@/backend/ai/universal-ai-provider';
import { handleBilledOperation } from '@/backend/actions';
import type { Recommendation, SearchRequest, VentureUserMemory } from '@nichefinder/domain-types';
import { getAgentDirectives } from '@/backend/ai/agent-manifest';

/**
 * OS CORE: Multi-Agent Reasoning Configuration
 * UPDATED: Implements Breakthrough Niche Discovery Rule (Rule 14).
 */
const generatePrompt = (input: SearchRequest, isInvestorMode: boolean, memory?: VentureUserMemory) => {
    const memoryContext = memory ? `
        USER COGNITIVE PROFILE (MEMORY LAYER):
        - Risk Tolerance: ${memory.userMemory.riskTolerance}
        - Historical preference for: ${memory.userMemory.preferredCountries.join(', ')}
        - Deep interest in sectors: ${memory.userMemory.preferredSectors.join(', ')}
        - Behavior pattern: Total ${memory.behaviour.totalSearches} searches, ${memory.behaviour.totalUnlocks} unlocks.
    ` : "";

    const agents = getAgentDirectives(['niche_discovery', 'strategy', 'scoring', 'commercial', 'prediction']);

    const isBreakthroughMode = input.searchPriority === 'breakthrough';

    const breakthroughDirectives = isBreakthroughMode ? `
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
    ` : "Prioritise balanced, realistic, and fundable opportunities.";

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

        Hard Rule: Return strict JSON only. No prose outside JSON.
    `;

    const userPrompt = `
        Search Criteria:
        - Country: ${input.countryCode}
        - Sectors: ${input.sectorSlugs?.join(", ") || 'Any'}
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
                 ...,
                 "breakthroughPotentialScore": number (0-10, only if breakthrough mode and applicable)
              }, 
              "rawScores": { ... }, 
              "explanation": { 
                 ...,
                 "breakthroughRationale": "string (mandatory if breakthrough mode and applicable)"
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
}

export async function generateNicheIdeasFlow(userId: string, input: SearchRequest, isInvestorMode: boolean, memory?: VentureUserMemory) {
    const { systemPrompt, userPrompt } = generatePrompt(input, isInvestorMode, memory);

    const aiOperation = async () => {
        const aiClient = new UniversalAIClient();
        return await aiClient.generateText({
            systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            jsonMode: true,
            temperature: input.searchPriority === 'breakthrough' ? 0.9 : 0.8,
            maxOutputTokens: 4096,
            featureType: 'decision_intelligence',
            tier: isInvestorMode ? 'enterprise' : 'decision',
        });
    };

    const { result, billingDetails } = await handleBilledOperation({
        userId,
        actionKey: 'niche_search',
        aiOperation,
    });

    const parsed = JSON.parse(result.text);
    const recommendations: Recommendation[] = parsed.results.map((r: any, idx: number) => ({
        recommendationId: uuidv4(),
        rank: idx + 1,
        confidenceScore: r.scorecard.overallConfidenceScore || 85,
        niche: {
            id: uuidv4(),
            countryCode: input.countryCode,
            sectorSlug: r.sector || 'Uncategorized',
            title: r.title,
            summary: r.description,
            targetAudience: [r.targetCustomer || 'Undisclosed'],
            lifecycleStage: 'Idea',
            businessModel: r.businessModel || 'Standard',
            revenueModel: r.revenueLogic || 'Standard',
            entryBarriers: [],
            digitalMode: 'hybrid',
            maxCapitalUsd: input.maxCapitalUsd || 10000,
        },
        scores: r.scorecard,
        rawScores: r.rawScores,
        explanation: {
            situation: r.situation,
            insight: r.insight,
            whyNow: r.solution || r.description,
            whyThisCountry: `Market gap identified in ${input.countryCode}.`,
            mainRisk: r.scorecard.scoringExplanation?.riskWarning || 'Standard execution risk',
            evidenceSummary: [r.scorecard.scoringExplanation?.strongestSignal || 'High demand'],
            breakthroughRationale: r.explanation?.breakthroughRationale || r.breakthroughRationale,
        },
        decisionSupport: r.decisionSupport,
    }));

    return { recommendations, billingDetails };
}
