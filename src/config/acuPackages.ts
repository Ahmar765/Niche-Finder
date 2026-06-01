// ============================================================
// NICHE FINDER — ACU TOP-UP PACKAGES
// ============================================================

export interface ACUTopUpPackage {
  id: string;
  name: string;
  baseCurrency: "GBP";
  priceGBP: number;
  acus: number;
  bonusACUs: number;
  totalACUs: number;
  recommended?: boolean;
  targetUser: string;
  description: string;
}

export const ACU_TOP_UP_PACKAGES: ACUTopUpPackage[] = [
  {
    id: "starter_5",
    name: "Starter",
    baseCurrency: "GBP",
    priceGBP: 5,
    acus: 500,
    bonusACUs: 0,
    totalACUs: 500,
    targetUser: "Beginners testing the platform",
    description: "Enough for 4 niche searches.",
  },
  {
    id: "builder_10",
    name: "Builder",
    baseCurrency: "GBP",
    priceGBP: 10,
    acus: 1000,
    bonusACUs: 100,
    totalACUs: 1100,
    recommended: true,
    targetUser: "Users comparing and unlocking opportunities",
    description: "Best for deeper niche exploration and early project building.",
  },
  {
    id: "founder_20",
    name: "Founder",
    baseCurrency: "GBP",
    priceGBP: 20,
    acus: 2000,
    bonusACUs: 400,
    totalACUs: 2400,
    targetUser: "Users building serious project outputs",
    description: "Best for financials, reports, business plans, and exports.",
  },
  {
    id: "venture_50",
    name: "Venture",
    baseCurrency: "GBP",
    priceGBP: 50,
    acus: 5000,
    bonusACUs: 1500,
    totalACUs: 6500,
    targetUser: "Serious builders preparing investor-level assets",
    description: "Best for full venture creation and investor preparation.",
  },
  {
    id: "investor_100",
    name: "Investor",
    baseCurrency: "GBP",
    priceGBP: 100,
    acus: 10000,
    bonusACUs: 4000,
    totalACUs: 14000,
    targetUser: "Power users, consultants, agencies, and repeat founders",
    description: "Best for multiple projects, premium templates, and investor packs.",
  },
];
