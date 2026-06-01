
export type Provider = "openai" | "gemini" | "vertex";

export type FeatureType =
  | "short_chat"
  | "long_chat"
  | "document_analysis"
  | "vision"
  | "risk_report"
  | "decision_intelligence"
  | "export";


export interface UsageMetrics {
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
  pages?: number;
  images?: number;
}

export interface ProviderRequest {
  requestId: string;
  model: string;
  featureType: FeatureType;
  messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  contents?: unknown[];
  maxOutputTokens: number;
  responseFormat?: "text" | "json";
  metadata?: Record<string, unknown>;
}

export interface ProviderResponse {
  provider: Provider;
  model: string;
  outputText: string;
  raw: unknown;
  usage: UsageMetrics;
  finishReason?: string;
}

export interface ProviderAdapter {
  provider: Provider;
  execute(input: ProviderRequest): Promise<ProviderResponse>;
}
