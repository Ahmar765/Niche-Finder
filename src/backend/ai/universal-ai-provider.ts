
/**
 * @fileoverview Universal AI Provider Standard
 * This module provides a unified client for interacting with multiple AI providers,
 * with built-in fallback logic and configuration management. It is designed to be
 * platform-agnostic and can be used in Next.js, Express, or other Node.js environments.
 *
 * - UniversalAIClient: The main client for making AI requests.
 * - AIConfig: A helper class for managing and validating provider configurations from environment variables.
 * - generatePlatformText: A safe helper for use in server actions or API routes.
 * - verifyAISetup: A startup utility to ensure the environment is correctly configured.
 */

import OpenAI from 'openai';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { z } from 'zod';
import type { FeatureType } from '@acu/provider-contracts';

// --- TYPE DEFINITIONS ---

export type ProviderName = "openai" | "gemini" | "vertex";

const AIProviderHealthSchema = z.object({
  provider: z.nativeEnum({ openai: "openai", gemini: "gemini", vertex: "vertex" }),
  enabled: z.boolean(),
  configured: z.boolean(),
  message: z.string(),
});
export type AIProviderHealth = z.infer<typeof AIProviderHealthSchema>;

export interface GenerateTextParams {
  systemPrompt?: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  preferredProvider?: ProviderName;
  allowFallback?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
  featureType: FeatureType;
  tier: "control" | "professional" | "decision" | "enterprise";
  lowBalance?: boolean;
}

export interface AIUsageMetrics {
  inputTokens: number;
  outputTokens: number;
}

export interface GenerateTextResult {
  text: string;
  provider: ProviderName;
  model: string;
  finishReason?: string | null;
  usage: AIUsageMetrics;
  rawResponse: any;
}

// --- AI Orchestration Strategy ---

function resolvePrimaryProvider(): ProviderName {
  const openai = AIConfig.openAI();
  if (openai.client) return 'openai';
  const gemini = AIConfig.gemini();
  if (gemini.client) return 'gemini';
  return 'openai';
}

const AI_PROVIDER_STRATEGY = {
  get primary(): ProviderName {
    return resolvePrimaryProvider();
  },
  fallback: ["gemini", "openai", "vertex"] as ProviderName[],
  routing: {
    // Maps strategic capabilities to specific providers
    reasoning: "openai" as ProviderName,           // For complex logic, short_chat
    ventureScoring: "openai" as ProviderName,      // For decision_intelligence
    financialForecasting: "openai" as ProviderName,  // Future use
    documentGeneration: "openai" as ProviderName,  // For long_chat, export
    multimodalAnalysis: "gemini" as ProviderName,    // For vision
    largeDatasetProcessing: "vertex" as ProviderName,  // For document_analysis
    fallbackGeneration: "gemini" as ProviderName,
  },
};

// Maps internal feature types to strategic AI capabilities
const featureTypeToStrategyKey: Record<FeatureType, keyof typeof AI_PROVIDER_STRATEGY.routing> = {
    'short_chat': 'reasoning',
    'long_chat': 'documentGeneration',
    'document_analysis': 'largeDatasetProcessing',
    'vision': 'multimodalAnalysis',
    'risk_report': 'reasoning',
    'decision_intelligence': 'ventureScoring',
    'export': 'documentGeneration',
};


// --- CONFIGURATION MANAGEMENT ---

export class AIConfig {
  public static openAI(): { client?: OpenAI; model?: string; error?: string } {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_DEFAULT_MODEL || "gpt-4o-mini";
    if (!apiKey || apiKey.includes('SECRET')) {
      return { error: "OpenAI API key is not configured." };
    }
    return { client: new OpenAI({ apiKey }), model };
  }

  public static gemini(): { client?: GoogleGenAI; model?: string; error?: string } {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_DEFAULT_MODEL || "gemini-2.5-flash";
    if (!apiKey || apiKey.includes('SECRET')) {
      return { error: "Gemini API key is not configured." };
    }
    return { client: new GoogleGenAI({ apiKey }), model };
  }

  public static vertex(): { client?: GoogleGenAI; model?: string; error?: string } {
    const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true';
    if (!useVertex) {
      return { error: "Vertex AI is not enabled via GOOGLE_GENAI_USE_VERTEXAI." };
    }
    const model = process.env.VERTEX_DEFAULT_MODEL || "gemini-1.5-pro-preview-0409";
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.VERTEX_LOCATION;

    if (!model || !project || !location) {
      return { error: "Vertex AI project, location, or model is not fully configured." };
    }
    return { client: new GoogleGenAI({ vertexai: true, project, location }), model };
  }

  public static validateEnv(): AIProviderHealth[] {
    const health: AIProviderHealth[] = [];

    const openai = AIConfig.openAI();
    health.push({
      provider: "openai",
      enabled: !!openai.client,
      configured: !openai.error,
      message: openai.error || "OK",
    });

    const gemini = AIConfig.gemini();
    health.push({
      provider: "gemini",
      enabled: !!gemini.client,
      configured: !gemini.error,
      message: gemini.error || "OK",
    });

    const vertex = AIConfig.vertex();
    health.push({
      provider: "vertex",
      enabled: !!(process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true' && vertex.client),
      configured: !vertex.error,
      message: vertex.error || "OK",
    });

    return health;
  }
}

// --- UNIVERSAL CLIENT ---

export class UniversalAIClient {
  private providers: {
    openai?: { client: OpenAI; model: string };
    gemini?: { client: GoogleGenAI; model: string };
    vertex?: { client: GoogleGenAI; model: string };
  } = {};

  constructor() {
    const openaiConf = AIConfig.openAI();
    if (openaiConf.client && openaiConf.model) {
      this.providers.openai = { client: openaiConf.client, model: openaiConf.model };
    }

    const geminiConf = AIConfig.gemini();
    if (geminiConf.client && geminiConf.model) {
        this.providers.gemini = { client: geminiConf.client, model: geminiConf.model };
    }

    if (process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true') {
        const vertexConf = AIConfig.vertex();
        if (vertexConf.client && vertexConf.model) {
            this.providers.vertex = { client: vertexConf.client, model: vertexConf.model };
        }
    }
  }

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    const { allowFallback = true, featureType, tier, lowBalance, preferredProvider } = params;

    // --- Provider Routing Logic ---
    let routedProvider: ProviderName;

    if (preferredProvider && this.providers[preferredProvider]) {
        // 1. Hard override by the developer
        routedProvider = preferredProvider;
    } else if (lowBalance) {
        // 2. Cost-saving override for low balance users
        routedProvider = AI_PROVIDER_STRATEGY.routing.fallbackGeneration;
    } else {
        // 3. Strategic routing based on feature type
        const strategyKey = featureTypeToStrategyKey[featureType] || 'reasoning';
        routedProvider = AI_PROVIDER_STRATEGY.routing[strategyKey];
    }

    // Ensure the routed provider is actually configured, otherwise use the primary.
    if (!this.providers[routedProvider]) {
        routedProvider = AI_PROVIDER_STRATEGY.primary;
    }
    if (!this.providers[routedProvider]) {
        const available = (['gemini', 'openai', 'vertex'] as ProviderName[]).find((p) => this.providers[p]);
        if (available) routedProvider = available;
    }
    
    // Create the prioritized list of providers to try
    const providerOrder: ProviderName[] = [
        routedProvider,
        // Add fallback providers, ensuring no duplicates and respecting the primary fallback
        ...AI_PROVIDER_STRATEGY.fallback.filter(p => p !== routedProvider)
    ];


    const failures: string[] = [];

    for (const provider of providerOrder) {
      if (this.providers[provider]) {
        try {
          switch (provider) {
            case 'openai':
              return await this.callOpenAI(params);
            case 'gemini':
              return await this.callGemini(params);
            case 'vertex':
              return await this.callVertex(params);
          }
        } catch (error: any) {
          const message = error?.message || String(error);
          failures.push(`${provider}: ${message}`);
          console.error(`AI call failed for provider ${provider}:`, message);
          if (!allowFallback) {
            throw new Error(`AI call failed with preferred provider ${provider} and fallback is disabled.`);
          }
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(`All AI providers failed. ${failures.join(' | ')}`);
    }

    throw new Error('No AI providers are configured. Set OPENAI_API_KEY or GEMINI_API_KEY in your environment.');
  }

  private async callOpenAI({ messages, systemPrompt, temperature = 0.7, maxOutputTokens = 1024, jsonMode = false }: GenerateTextParams): Promise<GenerateTextResult> {
    if (!this.providers.openai) throw new Error("OpenAI provider not configured.");
    
    const { client, model } = this.providers.openai;
    const cappedMaxTokens = Math.min(Math.max(maxOutputTokens, 256), 4096);

    const requestMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
        requestMessages.push({ role: 'system', content: systemPrompt });
    }
    requestMessages.push(...messages.filter(m => m.role !== 'system') as any);

    const response = await client.chat.completions.create({
        model: model,
        messages: requestMessages,
        temperature,
        max_tokens: cappedMaxTokens,
        response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
    });

    const choice = response.choices[0];
    if (!choice.message.content) {
        throw new Error('OpenAI returned no content.');
    }

    return {
        text: choice.message.content,
        provider: 'openai',
        model: model,
        finishReason: choice.finish_reason,
        usage: {
            inputTokens: response.usage?.prompt_tokens ?? 0,
            outputTokens: response.usage?.completion_tokens ?? 0,
        },
        rawResponse: response,
    };
  }

  private async callGemini({ messages, systemPrompt, temperature = 0.7, maxOutputTokens = 1024, jsonMode = false }: GenerateTextParams): Promise<GenerateTextResult> {
    if (!this.providers.gemini) throw new Error("Gemini provider not configured.");
    
    const { client, model } = this.providers.gemini;
    const geminiMaxTokens = Math.min(Math.max(maxOutputTokens, 1024), 8192);
    const conversational = messages.filter((m) => m.role !== 'system');
    const lastMessage = conversational[conversational.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Gemini requires the final message to be from the user.');
    }

    let history = conversational.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    while (history.length > 0 && history[0].role !== 'user') {
      history = history.slice(1);
    }

    const chat = client.chats.create({
        model,
        config: {
            temperature,
            maxOutputTokens: geminiMaxTokens,
            responseMimeType: jsonMode ? "application/json" : "text/plain",
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        },
        history: history.length > 0 ? history : undefined,
    });

    const response = await chat.sendMessage({ message: lastMessage.content });
    const text = response.text;
    if (!text) {
        throw new Error(`Gemini (${model}) returned no content. Try increasing GEMINI_DEFAULT_MODEL output limits.`);
    }

    return {
      text,
      provider: 'gemini',
      model: model,
      finishReason: response.candidates?.[0].finishReason,
      usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
      rawResponse: response,
    };
  }

    private async callVertex({ messages, systemPrompt, temperature = 0.7, maxOutputTokens = 1024, jsonMode = false }: GenerateTextParams): Promise<GenerateTextResult> {
        if (!this.providers.vertex) throw new Error("Vertex AI provider not configured.");

        const { client, model } = this.providers.vertex;
        const conversational = messages.filter((m) => m.role !== 'system');
        const lastMessage = conversational[conversational.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            throw new Error('Vertex AI requires the final message to be from the user.');
        }

        let history = conversational.slice(0, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' as const : 'user' as const,
            parts: [{ text: m.content }],
        }));

        while (history.length > 0 && history[0].role !== 'user') {
            history = history.slice(1);
        }

        const chat = client.chats.create({
            model,
            config: {
                temperature,
                maxOutputTokens,
                responseMimeType: jsonMode ? "application/json" : "text/plain",
                systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ],
            },
            history: history.length > 0 ? history : undefined,
        });

        const response = await chat.sendMessage({ message: lastMessage.content });
        const text = response.text;
        if (!text) {
            throw new Error('Vertex AI returned no content.');
        }

        return {
            text,
            provider: 'vertex',
            model: model,
            finishReason: response.candidates?.[0].finishReason,
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
            },
            rawResponse: response,
        };
    }
}


// --- Express/Next.js-safe helper ---
export async function generatePlatformText(input: {
  prompt: string;
  systemPrompt?: string;
  preferredProvider?: ProviderName;
}) {
  const ai = new UniversalAIClient();
  const result = await ai.generateText({
    preferredProvider: input.preferredProvider || "openai",
    allowFallback: true,
    systemPrompt: input.systemPrompt || "You are an AI assistant for Niche Finder, a venture infrastructure operating system.",
    messages: [{ role: "user", content: input.prompt }],
    temperature: 0.4,
    maxOutputTokens: 800,
    featureType: 'short_chat',
    tier: 'control'
  });

  return {
    provider: result.provider,
    model: result.model,
    content: result.text,
  };
}

// --- Startup check ---
export function verifyAISetup() {
  const health = AIConfig.validateEnv();
  const enabled = health.filter((h) => h.enabled).map((h) => h.provider);

  if (enabled.length === 0) {
      throw new Error("FATAL: No AI providers are configured. Please set up at least one provider in your environment variables.");
  }

  if (!enabled.includes("openai")) {
    console.warn("OpenAI is not configured. The system will rely on fallback providers.");
  }

  console.log("AI Provider Health Check:", health);

  return {
    ok: true,
    providers: health,
  };
}
