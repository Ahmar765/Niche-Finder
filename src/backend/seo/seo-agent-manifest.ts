
/**
 * @fileoverview SEO OS: The 6-Agent Domination Manifest
 * Definitive directives for Groupe Nseya AI Organic Growth Infrastructure.
 */
import type { SeoAgentType } from '@nichefinder/domain-types';

export interface SeoAgentConfig {
  id: string;
  name: string;
  mission: string;
  directive: string;
}

export const SEO_AGENTS: Record<SeoAgentType, SeoAgentConfig> = {
  serp_domination: {
    id: "agent_serp_dom",
    name: "SERP Domination Agent",
    mission: "Continuously monitor search engines and detect opportunities for Page 1 visibility.",
    directive: "Track keyword positions, detect ranking drops, analyze 'People Also Ask' clusters, and identify zero-click opportunities. Recommend metadata improvements and semantic expansions based on competitor growth signals.",
  },
  content_creation: {
    id: "agent_content_creator",
    name: "Content Creation Agent",
    mission: "Generate human-like, high-ranking content that establishes topical authority.",
    directive: "Produce pillar articles (3000-8000 words), long-tail blogs, and evergreen GEO-targeted content. Focus on semantic richness, NLP optimization, E-E-A-T principles, and anti-AI-detection tone. Optimize for GEO (Generative Engine Optimization).",
  },
  content_refresh: {
    id: "agent_refresh",
    name: "Content Refresh Agent",
    mission: "Prevent SEO decay by keeping content accurate and relevant.",
    directive: "Detect declining traffic, update outdated statistics, refresh keywords, and rewrite titles/sections to improve CTR and dwell time. Add new sections to existing pillars to maintain ranking freshness.",
  },
  social_virality: {
    id: "agent_social_viral",
    name: "Social Virality Agent",
    mission: "Explode organic reach by transforming blogs into viral social formats.",
    directive: "Convert articles into TikTok/YouTube Short scripts, X threads, Reddit posts, and LinkedIn executive articles. Optimize hooks, hashtags, and timing for maximum engagement loops.",
  },
  backlink_acquisition: {
    id: "agent_backlink",
    name: "Backlink Acquisition Agent",
    mission: "Increase domain authority through automated link building and PR.",
    directive: "Identify broken link, guest posting, and PR opportunities. Sculpt internal authority flows between pillar and supporting content to strengthen core SEO clusters.",
  },
  ai_search_optimisation: {
    id: "agent_ai_search",
    name: "AI Search Optimisation Agent",
    mission: "Dominate AI-generated search results (ChatGPT, Gemini, Perplexity).",
    directive: "Implement answer-first formatting, entity-rich architecture, and schema-rich markup. Ensure content is structured to be highly referenceable by LLM retrievers and voice assistants.",
  }
};

export function getSeoAgentDirectives(keys: SeoAgentType[]): string {
  return keys.map(key => {
    const agent = SEO_AGENTS[key];
    return `[${agent.name}]: ${agent.directive}`;
  }).join("\n");
}
