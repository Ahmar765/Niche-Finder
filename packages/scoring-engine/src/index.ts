import type { ScoreInputs, TrafficLight, DecisionLabel } from '@nichefinder/domain-types';

export interface ScoreBundle {
  prs: number;
  cs: number;
  pss: number;
  overall: number;
  readinessLabel: TrafficLight;
  competitivenessLabel: TrafficLight;
  successLabel: TrafficLight;
  decisionLabel: DecisionLabel;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function classifyTrafficLight(score: number): TrafficLight {
  if (score >= 8) return "green";
  if (score >= 5) return "amber";
  return "red";
}

export function classifyDecision(overall: number): DecisionLabel {
  if (overall >= 7.5) return "STRONG_GO";
  if (overall >= 6.0) return "CONDITIONAL_GO";
  return "NO_GO";
}

export function computePRS(i: ScoreInputs): number {
  const score =
    i.regulatorySimplicity * 0.20 +
    i.infrastructureReadiness * 0.20 +
    i.skillAvailability * 0.15 +
    i.capitalIntensity * 0.20 +
    i.timeToFirstRevenueScore * 0.15 +
    i.operationalComplexity * 0.10;
  return round1(score);
}

export function computeCS(i: ScoreInputs): number {
  const score =
    i.competitorCountScore * 0.25 +
    i.informalSubstitutesScore * 0.15 +
    i.marketFragmentationScore * 0.15 +
    i.priceSensitivityScore * 0.15 +
    i.switchingCostScore * 0.15 +
    i.differentiationPotentialScore * 0.15;
  return round1(score);
}

export function computePSS(i: ScoreInputs): number {
  const score =
    i.painIntensityScore * 0.20 +
    i.revenueFrequencyScore * 0.20 +
    i.abilityToPayScore * 0.15 +
    i.scalabilityScore * 0.15 +
    i.cashflowStabilityScore * 0.15 +
    i.replicabilityScore * 0.15;
  return round1(score);
}

export function computeOverall(prs: number, cs: number, pss: number): number {
  // Corrected weights as per the new architecture pack
  return round1(prs * 0.35 + cs * 0.30 + pss * 0.35);
}

export function scoreBundle(i: ScoreInputs, maxCapitalUsd: number): ScoreBundle {
  if (maxCapitalUsd > 10000) {
    return {
      prs: 0,
      cs: 0,
      pss: 0,
      overall: 0,
      readinessLabel: "red",
      competitivenessLabel: "red",
      successLabel: "red",
      decisionLabel: "NO_GO"
    };
  }

  const prs = computePRS(i);
  const cs = computeCS(i);
  const pss = computePSS(i);
  const overall = computeOverall(prs, cs, pss);

  return {
    prs,
    cs,
    pss,
    overall,
    readinessLabel: classifyTrafficLight(prs),
    competitivenessLabel: classifyTrafficLight(cs),
    successLabel: classifyTrafficLight(pss),
    decisionLabel: classifyDecision(overall)
  };
}
