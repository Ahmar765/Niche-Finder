
export interface PricingPolicy {
  id: string;
  featureType: string;
  tier: "control" | "professional" | "decision" | "enterprise";
  multiplierMin: number;
  multiplierMax: number;
  marginFloorPct: number;
  fixedAcuFee?: number;
  perPageAcuFee?: number;
  perImageAcuFee?: number;
  inputCapTokens?: number;
  outputCapTokens?: number;
}

export interface ModelPricing {
  provider: "openai" | "gemini" | "vertex";
  model: string;
  pricingMode: "token" | "fixed" | "hybrid";
  inputCostPer1M?: number;
  cachedInputCostPer1M?: number;
  outputCostPer1M?: number;
  fixedUsdPerCall?: number;
}

export interface UsageMetrics {
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  pages?: number;
  images?: number;
}

export const USD_TO_ACU = 100;

export function assertCaps(usage: UsageMetrics, policy: PricingPolicy) {
  if (policy.inputCapTokens && usage.inputTokens > policy.inputCapTokens) {
    throw new Error("INPUT_CAP_EXCEEDED");
  }
  if (policy.outputCapTokens && usage.outputTokens > policy.outputCapTokens) {
    throw new Error("OUTPUT_CAP_EXCEEDED");
  }
}

export function computeRealCostUsd(usage: UsageMetrics, model: ModelPricing): number {
  if (model.pricingMode === "fixed") return model.fixedUsdPerCall ?? 0;

  const input = (usage.inputTokens / 1_000_000) * (model.inputCostPer1M ?? 0);
  const cached = ((usage.cachedInputTokens ?? 0) / 1_000_000) * (model.cachedInputCostPer1M ?? 0);
  const output = (usage.outputTokens / 1_000_000) * (model.outputCostPer1M ?? 0);

  return input + cached + output;
}

export function chooseMultiplier(realCostUsd: number, policy: PricingPolicy, infraOverheadPct = 0.2) {
  const totalCost = realCostUsd * (1 + infraOverheadPct);
  const minChargeForMargin = totalCost / (1 - policy.marginFloorPct);
  const impliedMultiplier = realCostUsd > 0 ? minChargeForMargin / realCostUsd : policy.multiplierMin;

  return Math.min(Math.max(impliedMultiplier, policy.multiplierMin), policy.multiplierMax);
}

export function quoteAcus(usage: UsageMetrics, model: ModelPricing, policy: PricingPolicy) {
  // If a fixed ACU fee is specified, it is the *only* charge. This is for value-based pricing.
  if (policy.fixedAcuFee && policy.fixedAcuFee > 0) {
    return {
      // We still compute real cost for internal analytics, but it's not used for charging.
      realCostUsd: computeRealCostUsd(usage, model),
      multiplier: 1, // Not relevant for charging, but logged.
      chargedAcus: policy.fixedAcuFee,
    };
  }
  
  assertCaps(usage, policy);

  const realCostUsd = computeRealCostUsd(usage, model);
  const multiplier = chooseMultiplier(realCostUsd, policy);

  const variableUsd = realCostUsd * multiplier;
  const pageAcus = (policy.perPageAcuFee ?? 0) * (usage.pages ?? 0);
  const imageAcus = (policy.perImageAcuFee ?? 0) * (usage.images ?? 0);

  // Note: fixedAcuFee is now exclusively for fixed-price actions, not an add-on fee in the usage-based model.
  const totalAcus = Math.ceil(variableUsd * USD_TO_ACU) + pageAcus + imageAcus;

  return {
    realCostUsd,
    multiplier,
    chargedAcus: totalAcus
  };
}
