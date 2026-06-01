import { getPitchTemplate } from './pitch-templates';

export interface SelectedNichePitchInput {
  projectName: string;
  nicheTitle: string;
  country: string;
  sector: string;
  tagline?: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  marketSize?: string;
  marketDrivers: string[];
  readinessScore: number;
  competitivenessScore: number;
  successScore: number;
  confidenceScore: number;
  businessModel: string;
  revenueStreams: string[];
  pricingModel: string;
  competitors: string[];
  competitiveAdvantages: string[];
  goToMarketChannels: string[];
  milestones: string[];
  fundingRequired?: number;
  useOfFunds?: Array<{
    item: string;
    amount: number;
  }>;
  financials: {
    revenueYear1: number;
    revenueYear2: number;
    revenueYear3: number;
    profitYear1: number;
    profitYear2: number;
    profitYear3: number;
    cashflowYear1?: number;
    cashflowYear2?: number;
    cashflowYear3?: number;
  };
  contactDetails?: string;
}

export function buildInvestorPitchPrompt(args: {
  templateId: string;
  niche: SelectedNichePitchInput;
}) {
  const template = getPitchTemplate(args.templateId);

  return `
You are an elite investor pitch deck strategist and senior presentation designer, operating under a strict Visual Identity Engine. Your task is to generate the JSON content for a pitch deck based on the user's selected niche and a predefined visual template.

---
VISUAL IDENTITY ENGINE: MASTER DIRECTIVE (NON-NEGOTIABLE)

For every slide, you will generate a visual direction that adheres to the following system architecture. Every image is a strategic asset representing the Niche Finder operating system. The 'visualDescription' you create MUST follow these rules precisely.

STYLE:
- Enterprise-grade, high authority.
- Aesthetic: Bloomberg Terminal × Palantir × Apple keynote.
- Environment: Dark intelligence aesthetic, matte black / deep charcoal.

LIGHTING:
- Sharp directional lighting with high contrast shadows.
- Subtle glow accents using the template's theme colors, especially the accent color (${template.theme.accent}).

COMPOSITION:
- Centered or asymmetrical power framing.
- Depth layers: foreground control, midground system, background scale.
- Clean, structured, zero clutter.

SUBJECT:
- Subject should be context-aware (e.g., 'Executive operator' for control, 'Individual analyzing predictive models' for finance).
- Must feel intentional, not staged. Express control, focus, and decision-making.

ENVIRONMENT:
- The environment is an intelligent, futuristic, operational control room for the Niche Finder OS.
- Hyper-clean, no generic offices.

VISUAL SIGNALS:
- For the 'visualDescription' of each slide, you MUST describe a scene that incorporates data flow, system orchestration, control layers, and subtle holographic UI overlays (non-readable, for aesthetic purposes).
- The visual should align with the slide's intent (e.g., 'Risk' slides use red highlights, 'Growth' slides show expansive depth).

TONE:
- Power, Control, Precision, Intelligence, Financial Consequence.

NEGATIVE CONSTRAINTS (MANDATORY):
- NO stock photo style.
- NO smiling corporate teams.
- NO bright backgrounds.
- NO generic office setups.
- NO overused tech tropes or clichés.
- NO randomness.

Your primary task for each slide is to populate the 'visualDescription' field with a detailed scene that follows these rules, bringing the Niche Finder brand to life.
---

Template & Niche Data:

Selected template:
- Template name: ${template.name}
- Template style: ${template.description}
- Investor level: ${template.investorLevel}
- Slide count: ${template.slideCount}
- Visual intensity: ${template.intensity}
- Theme colours:
  - Primary: ${template.theme.primary}
  - Secondary: ${template.theme.secondary}
  - Accent: ${template.theme.accent}
  - Background: ${template.theme.background}
  - Text: ${template.theme.text}

Selected niche:
- Project name: ${args.niche.projectName}
- Niche: ${args.niche.nicheTitle}
- Country: ${args.niche.country}
- Sector: ${args.niche.sector}
- Problem: ${args.niche.problem}
- Solution: ${args.niche.solution}
- Target customer: ${args.niche.targetCustomer}
- Business model: ${args.niche.businessModel}
- Revenue streams: ${args.niche.revenueStreams.join(", ")}
- Pricing model: ${args.niche.pricingModel}
- Market drivers: ${args.niche.marketDrivers.join(", ")}
- Go-to-market channels: ${args.niche.goToMarketChannels.join(", ")}
- Competitors: ${args.niche.competitors.join(", ")}
- Competitive advantages: ${args.niche.competitiveAdvantages.join(", ")}
- Readiness score: ${args.niche.readinessScore}/10
- Competitiveness score: ${args.niche.competitivenessScore}/10
- Success score: ${args.niche.successScore}/10
- Confidence score: ${args.niche.confidenceScore}/100

Financials:
- Revenue Year 1: ${args.niche.financials.revenueYear1}
- Revenue Year 2: ${args.niche.financials.revenueYear2}
- Revenue Year 3: ${args.niche.financials.revenueYear3}
- Profit Year 1: ${args.niche.financials.profitYear1}
- Profit Year 2: ${args.niche.financials.profitYear2}
- Profit Year 3: ${args.niche.financials.profitYear3}

Funding:
- Funding required: ${args.niche.fundingRequired || "Not provided"}
- Use of funds: ${JSON.stringify(args.niche.useOfFunds || [])}


Return strict JSON only in this exact format:

{
  "templateId": "${template.id}",
  "templateName": "${template.name}",
  "theme": {
    "primary": "${template.theme.primary}",
    "secondary": "${template.theme.secondary}",
    "accent": "${template.theme.accent}",
    "background": "${template.theme.background}",
    "text": "${template.theme.text}"
  },
  "slides": [
    {
      "slideNumber": 1,
      "title": "string",
      "headline": "string",
      "subtitle": "string",
      "bullets": ["string"],
      "visualType": "chart | dashboard | matrix | roadmap | cards | map | hero | financial | closing",
      "visualDescription": "string (MUST follow the Visual Identity Engine rules)",
      "chartData": {},
      "speakerNotes": "string"
    }
  ]
}
`;
}
