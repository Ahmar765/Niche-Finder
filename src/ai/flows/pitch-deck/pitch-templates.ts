// ============================================================
// NICHE FINDER — INVESTOR POWERPOINT TEMPLATE SYSTEM
// ============================================================

export type PitchTemplateCategory =
  | "startup"
  | "corporate"
  | "financial"
  | "africa"
  | "tech"
  | "impact"
  | "premium"
  | "creative";

export type PitchTemplateIntensity =
  | "clean"
  | "colourful"
  | "bold"
  | "graphic_heavy"
  | "executive";

export interface PitchTemplate {
  id: string;
  name: string;
  category: PitchTemplateCategory;
  intensity: PitchTemplateIntensity;
  description: string;
  targetUser: string;
  investorLevel: "standard" | "premium" | "elite";
  slideCount: number;
  acuCost: number;
  exportFormat: "pptx";
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  visualStyle: string[];
  graphicsIncluded: string[];
  slideStructure: PitchSlideTemplate[];
}

export interface PitchSlideTemplate {
  slideNumber: number;
  title: string;
  purpose: string;
  layout:
    | "cover"
    | "hero_statement"
    | "problem_solution"
    | "market_map"
    | "score_dashboard"
    | "financial_chart"
    | "timeline"
    | "competitive_matrix"
    | "business_model"
    | "go_to_market"
    | "investment_ask"
    | "closing";
  requiredData: string[];
  graphics: string[];
}

// ============================================================
// POWERPOINT BUSINESS TEMPLATE LIBRARY
// ============================================================

export const PITCH_TEMPLATES: PitchTemplate[] = [
  {
    id: "venture_bold_colour",
    name: "Venture Bold Colour",
    category: "startup",
    intensity: "graphic_heavy",
    description:
      "A colourful, high-energy investor pitch template for ambitious startup founders.",
    targetUser: "Founders pitching early-stage investors",
    investorLevel: "premium",
    slideCount: 14,
    acuCost: 550,
    exportFormat: "pptx",
    theme: {
      primary: "#071426",
      secondary: "#1F73E8",
      accent: "#F0C767",
      background: "#F7F8FA",
      text: "#08111F",
    },
    visualStyle: [
      "large colourful section headers",
      "bold opportunity score cards",
      "financial charts",
      "market graphics",
      "founder-friendly pitch storytelling",
    ],
    graphicsIncluded: [
      "opportunity score dashboard",
      "3-year revenue chart",
      "cashflow curve",
      "market size blocks",
      "competitive matrix",
      "funding use-of-funds graphic",
    ],
    slideStructure: defaultInvestorSlideStructure(),
  },

  {
    id: "investor_dashboard_dark",
    name: "Investor Dashboard Dark",
    category: "financial",
    intensity: "executive",
    description:
      "A dark premium investor deck with dashboard-style charts, graphs, and executive visuals.",
    targetUser: "Serious founders, consultants, finance-led ventures",
    investorLevel: "elite",
    slideCount: 16,
    acuCost: 700,
    exportFormat: "pptx",
    theme: {
      primary: "#030711",
      secondary: "#0A1728",
      accent: "#22D3EE",
      background: "#06111F",
      text: "#FFFFFF",
    },
    visualStyle: [
      "Bloomberg-style dashboard aesthetic",
      "dark executive theme",
      "financially serious",
      "premium data-heavy charts",
      "low text, high visual authority",
    ],
    graphicsIncluded: [
      "investor KPI dashboard",
      "radar opportunity score",
      "cashflow waterfall",
      "3-year P&L chart",
      "risk heatmap",
      "funding allocation chart",
    ],
    slideStructure: financialInvestorSlideStructure(),
  },

  {
    id: "africa_growth_market",
    name: "Africa Growth Market",
    category: "africa",
    intensity: "colourful",
    description:
      "A vibrant market-entry deck for African and emerging-market business opportunities.",
    targetUser: "Founders building ventures in Africa or emerging markets",
    investorLevel: "premium",
    slideCount: 15,
    acuCost: 600,
    exportFormat: "pptx",
    theme: {
      primary: "#06281F",
      secondary: "#F97316",
      accent: "#FACC15",
      background: "#FFF8ED",
      text: "#102018",
    },
    visualStyle: [
      "warm premium colours",
      "market map visuals",
      "community and growth graphics",
      "strong emerging-market opportunity narrative",
      "bold investor storytelling",
    ],
    graphicsIncluded: [
      "country opportunity map",
      "market gap illustration",
      "customer segment blocks",
      "mobile adoption visual",
      "growth timeline",
      "impact and revenue balance chart",
    ],
    slideStructure: emergingMarketSlideStructure(),
  },

  {
    id: "premium_consulting_clean",
    name: "Premium Consulting Clean",
    category: "corporate",
    intensity: "clean",
    description:
      "A clean consulting-style PowerPoint template for professional, boardroom-ready business cases.",
    targetUser: "Consultants, executives, corporate founders",
    investorLevel: "premium",
    slideCount: 14,
    acuCost: 520,
    exportFormat: "pptx",
    theme: {
      primary: "#08111F",
      secondary: "#CBD5E1",
      accent: "#1F73E8",
      background: "#FFFFFF",
      text: "#0F172A",
    },
    visualStyle: [
      "McKinsey-style structure",
      "clean graphs",
      "sharp executive summaries",
      "low decoration",
      "high credibility",
    ],
    graphicsIncluded: [
      "business case summary",
      "market sizing table",
      "strategic option matrix",
      "financial forecast chart",
      "roadmap graphic",
      "investment logic slide",
    ],
    slideStructure: consultingSlideStructure(),
  },

  {
    id: "saas_product_colour",
    name: "SaaS Product Colour",
    category: "tech",
    intensity: "bold",
    description:
      "A colourful product-first deck for SaaS, digital platforms, and technology ventures.",
    targetUser: "Tech founders and platform builders",
    investorLevel: "premium",
    slideCount: 15,
    acuCost: 620,
    exportFormat: "pptx",
    theme: {
      primary: "#0B1020",
      secondary: "#7C3AED",
      accent: "#06B6D4",
      background: "#F8FAFC",
      text: "#111827",
    },
    visualStyle: [
      "modern SaaS visuals",
      "product mockup placeholders",
      "feature cards",
      "growth charts",
      "clean technology storytelling",
    ],
    graphicsIncluded: [
      "product screen mockups",
      "feature architecture graphic",
      "user journey map",
      "subscription revenue chart",
      "unit economics panel",
      "growth flywheel",
    ],
    slideStructure: techProductSlideStructure(),
  },

  {
    id: "impact_investor_story",
    name: "Impact Investor Story",
    category: "impact",
    intensity: "colourful",
    description:
      "A strong investor deck for social impact, education, healthcare, sustainability, and community ventures.",
    targetUser: "Impact founders and grant/investor applicants",
    investorLevel: "premium",
    slideCount: 15,
    acuCost: 580,
    exportFormat: "pptx",
    theme: {
      primary: "#064E3B",
      secondary: "#10B981",
      accent: "#FBBF24",
      background: "#F0FDF4",
      text: "#052E2B",
    },
    visualStyle: [
      "human-centred visuals",
      "impact metrics",
      "colourful storytelling",
      "commercial + social value balance",
      "grant and investor friendly",
    ],
    graphicsIncluded: [
      "impact outcome dashboard",
      "beneficiary journey",
      "revenue and impact dual chart",
      "problem severity visual",
      "SDG-style icon blocks",
      "funding use breakdown",
    ],
    slideStructure: impactSlideStructure(),
  },

  {
    id: "luxury_private_equity",
    name: "Luxury Private Equity",
    category: "premium",
    intensity: "executive",
    description:
      "A luxury, high-authority investment deck for premium business opportunities and serious capital conversations.",
    targetUser: "High-value founders and investor-facing consultants",
    investorLevel: "elite",
    slideCount: 18,
    acuCost: 850,
    exportFormat: "pptx",
    theme: {
      primary: "#050505",
      secondary: "#1F2937",
      accent: "#C6A15B",
      background: "#0B0B0B",
      text: "#FFFFFF",
    },
    visualStyle: [
      "black and gold luxury theme",
      "private equity style",
      "executive investment memo feel",
      "high contrast charts",
      "premium deal-room presentation",
    ],
    graphicsIncluded: [
      "deal snapshot",
      "investment thesis graphic",
      "market attractiveness matrix",
      "financial upside chart",
      "risk-adjusted return visual",
      "capital deployment plan",
    ],
    slideStructure: privateEquitySlideStructure(),
  },

  {
    id: "creative_founder_pitch",
    name: "Creative Founder Pitch",
    category: "creative",
    intensity: "graphic_heavy",
    description:
      "A colourful, highly visual pitch deck for creative, consumer, lifestyle, media, and brand-led ventures.",
    targetUser: "Consumer brand founders and creative entrepreneurs",
    investorLevel: "standard",
    slideCount: 13,
    acuCost: 500,
    exportFormat: "pptx",
    theme: {
      primary: "#111827",
      secondary: "#EC4899",
      accent: "#F59E0B",
      background: "#FFF7ED",
      text: "#111827",
    },
    visualStyle: [
      "bold visuals",
      "colour blocks",
      "brand storytelling",
      "customer lifestyle graphics",
      "attractive consumer pitch style",
    ],
    graphicsIncluded: [
      "brand moodboard section",
      "customer persona cards",
      "market trend visual",
      "sales channel map",
      "social growth graphic",
      "revenue forecast chart",
    ],
    slideStructure: creativeFounderSlideStructure(),
  },
];


function defaultInvestorSlideStructure(): PitchSlideTemplate[] {
  return [
    {
      slideNumber: 1,
      title: "Cover",
      purpose: "Introduce the venture with a strong investor-facing opening.",
      layout: "cover",
      requiredData: ["projectName", "country", "sector", "tagline"],
      graphics: ["hero image", "brand mark", "strong colour background"],
    },
    {
      slideNumber: 2,
      title: "The Opportunity",
      purpose: "Show why this niche is worth investor attention.",
      layout: "hero_statement",
      requiredData: ["nicheTitle", "opportunitySummary", "confidenceScore"],
      graphics: ["large opportunity score", "market signal cards"],
    },
    {
      slideNumber: 3,
      title: "Problem",
      purpose: "Explain the pain point clearly and commercially.",
      layout: "problem_solution",
      requiredData: ["problem", "targetCustomer", "painPoints"],
      graphics: ["problem icons", "customer pain cards"],
    },
    {
      slideNumber: 4,
      title: "Solution",
      purpose: "Present the proposed product or business solution.",
      layout: "problem_solution",
      requiredData: ["solution", "valueProposition", "keyFeatures"],
      graphics: ["solution architecture", "feature blocks"],
    },
    {
      slideNumber: 5,
      title: "Market Opportunity",
      purpose: "Show market size, demand drivers, and growth potential.",
      layout: "market_map",
      requiredData: ["marketSize", "marketDrivers", "country"],
      graphics: ["market map", "growth blocks", "TAM/SAM/SOM"],
    },
    {
      slideNumber: 6,
      title: "Niche Scorecard",
      purpose: "Display platform scoring results.",
      layout: "score_dashboard",
      requiredData: [
        "readinessScore",
        "competitivenessScore",
        "successScore",
        "confidenceScore",
      ],
      graphics: ["radar chart", "score cards", "traffic light indicators"],
    },
    {
      slideNumber: 7,
      title: "Business Model",
      purpose: "Explain how the business makes money.",
      layout: "business_model",
      requiredData: ["revenueStreams", "pricingModel", "customerSegments"],
      graphics: ["revenue stream cards", "business model diagram"],
    },
    {
      slideNumber: 8,
      title: "Go-To-Market Strategy",
      purpose: "Show how the venture will acquire customers.",
      layout: "go_to_market",
      requiredData: ["channels", "launchPlan", "salesStrategy"],
      graphics: ["channel map", "launch funnel"],
    },
    {
      slideNumber: 9,
      title: "Competitive Advantage",
      purpose: "Show why the venture can win.",
      layout: "competitive_matrix",
      requiredData: ["competitors", "advantages", "positioning"],
      graphics: ["competitor matrix", "advantage badges"],
    },
    {
      slideNumber: 10,
      title: "3-Year Financial Forecast",
      purpose: "Show revenue, profit, and cashflow direction.",
      layout: "financial_chart",
      requiredData: [
        "revenueYear1",
        "revenueYear2",
        "revenueYear3",
        "profitYear1",
        "profitYear2",
        "profitYear3",
      ],
      graphics: ["bar chart", "line chart", "financial summary cards"],
    },
    {
      slideNumber: 11,
      title: "Execution Roadmap",
      purpose: "Show the practical build plan.",
      layout: "timeline",
      requiredData: ["milestones", "timeline", "executionPhases"],
      graphics: ["12-month roadmap", "milestone markers"],
    },
    {
      slideNumber: 12,
      title: "Investment Ask",
      purpose: "State funding required and use of funds.",
      layout: "investment_ask",
      requiredData: ["fundingRequired", "useOfFunds", "expectedOutcome"],
      graphics: ["funding pie chart", "capital allocation blocks"],
    },
    {
      slideNumber: 13,
      title: "Why Now",
      purpose: "Explain timing and urgency.",
      layout: "hero_statement",
      requiredData: ["whyNow", "marketTiming", "growthTrigger"],
      graphics: ["timing visual", "trend arrows"],
    },
    {
      slideNumber: 14,
      title: "Closing",
      purpose: "End with a confident investor call-to-action.",
      layout: "closing",
      requiredData: ["projectName", "contactDetails", "closingStatement"],
      graphics: ["bold closing statement", "contact card"],
    },
  ];
}

function financialInvestorSlideStructure(): PitchSlideTemplate[] {
  return [
    ...defaultInvestorSlideStructure(),
    {
      slideNumber: 15,
      title: "Risk & Mitigation",
      purpose: "Show investor risk awareness.",
      layout: "competitive_matrix",
      requiredData: ["risks", "mitigations"],
      graphics: ["risk heatmap", "mitigation table"],
    },
    {
      slideNumber: 16,
      title: "Return Logic",
      purpose: "Explain investor upside.",
      layout: "financial_chart",
      requiredData: ["roiLogic", "exitPotential", "growthScenario"],
      graphics: ["upside chart", "scenario comparison"],
    },
  ];
}

function emergingMarketSlideStructure(): PitchSlideTemplate[] {
  return [
    ...defaultInvestorSlideStructure(),
    {
      slideNumber: 15,
      title: "Local Market Execution",
      purpose: "Show how the venture will operate in the selected country.",
      layout: "market_map",
      requiredData: ["localPartners", "distributionModel", "marketEntryRisks"],
      graphics: ["country map", "partner ecosystem"],
    },
  ];
}

function consultingSlideStructure(): PitchSlideTemplate[] {
  return defaultInvestorSlideStructure().map((slide) => ({
    ...slide,
    graphics: [...slide.graphics, "consulting-style summary box"],
  }));
}

function techProductSlideStructure(): PitchSlideTemplate[] {
  return [
    ...defaultInvestorSlideStructure(),
    {
      slideNumber: 15,
      title: "Product Architecture",
      purpose: "Show the digital product or platform model.",
      layout: "business_model",
      requiredData: ["platformFeatures", "userWorkflow", "technologyStack"],
      graphics: ["product architecture diagram", "platform flow"],
    },
  ];
}

function impactSlideStructure(): PitchSlideTemplate[] {
  return [
    ...defaultInvestorSlideStructure(),
    {
      slideNumber: 15,
      title: "Impact Model",
      purpose: "Show measurable social or environmental outcomes.",
      layout: "score_dashboard",
      requiredData: ["impactMetrics", "beneficiaries", "impactOutcomes"],
      graphics: ["impact dashboard", "beneficiary metrics"],
    },
  ];
}

function privateEquitySlideStructure(): PitchSlideTemplate[] {
  return [
    ...financialInvestorSlideStructure(),
    {
      slideNumber: 17,
      title: "Investment Thesis",
      purpose: "Summarise the capital case in one powerful slide.",
      layout: "hero_statement",
      requiredData: ["investmentThesis", "growthPotential", "defensibility"],
      graphics: ["investment thesis blocks", "premium deal summary"],
    },
    {
      slideNumber: 18,
      title: "Deal Summary",
      purpose: "Close with a private-equity style deal snapshot.",
      layout: "investment_ask",
      requiredData: ["fundingRequired", "valuationLogic", "capitalUse"],
      graphics: ["deal card", "capital stack visual"],
    },
  ];
}

function creativeFounderSlideStructure(): PitchSlideTemplate[] {
  return defaultInvestorSlideStructure().slice(0, 13);
}

export function getPitchTemplate(templateId: string): PitchTemplate {
  const template = PITCH_TEMPLATES.find(t => t.id === templateId);

  if (!template) {
    throw new Error("INVALID_TEMPLATE_SELECTION");
  }

  return template;
}

export function listPitchTemplates() {
  return PITCH_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    style: t.visualStyle.join(', '),
    slides: t.slideCount,
    acuCost: t.acuCost,
    description: t.description,
    investorLevel: t.investorLevel,
  }));
}
