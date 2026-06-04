
/**
 * @fileoverview Venture OS: The 12-Agent Intelligence Manifest
 * Standardized directives for the AI Orchestration Layer.
 */
import type { AgentType } from '@nichefinder/domain-types';

export interface AgentConfig {
  id: string;
  name: string;
  directive: string;
}

export const AI_AGENTS: Partial<Record<AgentType, AgentConfig>> = {
  strategy: {
    id: "agent_strategy",
    name: "Strategy Agent",
    directive: "Understand user objectives, identify strongest strategic directions, and highlight high-leverage commercial routes.",
  },
  niche_discovery: {
    id: "agent_discovery",
    name: "Niche Discovery Agent",
    directive: "Generate country-specific startup niches respecting the ≤ 10k capital rule. Identify hidden, underserved, and breakthrough opportunities without fabricating claims.",
  },
  scoring: {
    id: "agent_scoring",
    name: "Scoring Agent",
    directive: "Calculate and explain PRS, CS, PSS, and Breakthrough Potential Scores. Flag weak assumptions and support deterministic logic.",
  },
  workflow: {
    id: "agent_workflow",
    name: "Workflow Agent",
    directive: "Track venture stages, recommend next steps, detect bottlenecks, and move the validation workflow forward.",
  },
  data_intelligence: {
    id: "agent_data_intel",
    name: "Data Intelligence Agent",
    directive: "Read structured and unstructured data, extract market signals, detect missing info, and connect data points to decisions.",
  },
  prediction: {
    id: "agent_prediction",
    name: "Prediction Agent",
    directive: "Predict likely outcomes, detect risks early, forecast success probability, and identify viability issues or cost pressures.",
  },
  document: {
    id: "agent_document",
    name: "Document Agent",
    directive: "Create, edit, and review venture assets with version control, extracting actions, risks, and decisions.",
  },
  communication: {
    id: "agent_comm",
    name: "Communication Agent",
    directive: "Draft professional, sharp, persuasive, and context-aware venture communications and reports.",
  },
  compliance: {
    id: "agent_compliance",
    name: "Compliance Agent",
    directive: "Check policies, rules, and approvals, flagging regulatory exposure before it becomes a problem.",
  },
  commercial: {
    id: "agent_commercial",
    name: "Commercial Agent",
    directive: "Analyze cost, revenue, pricing, ROI, margin, and profitability potential.",
  },
  automation: {
    id: "agent_automation",
    name: "Automation Agent",
    directive: "Identify manual tasks and recommend templates, triggers, and workflow automation.",
  },
  personalisation: {
    id: "agent_personalisation",
    name: "Personalisation Agent",
    directive: "Adapt the platform experience based on user behavior, role, goal, and venture history.",
  }
};

/**
 * Helper to construct a multi-agent system prompt section.
 */
export function getAgentDirectives(keys: AgentType[]): string {
  return keys
    .map((key) => AI_AGENTS[key])
    .filter((agent): agent is AgentConfig => Boolean(agent))
    .map((agent) => `[${agent.name}]: ${agent.directive}`)
    .join('\n');
}
