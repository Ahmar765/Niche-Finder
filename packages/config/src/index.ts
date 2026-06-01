function required(name: string, value?: string): string {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),

  db: {
    mode: process.env.DATABASE_MODE ?? "firestore",
    postgresUrl: process.env.POSTGRES_URL ?? "",
    redisUrl: process.env.REDIS_URL ?? ""
  },

  acu: {
    usdBase: Number(process.env.ACU_USD_BASE ?? 0.01),
    prepaidOnly: process.env.ACU_PREPAID_ONLY === "true",
    hardStopAtZero: process.env.ACU_HARD_STOP_AT_ZERO === "true",
    multiplierFloor: Number(process.env.ACU_DEFAULT_MULTIPLIER_FLOOR ?? 3),
    marginFloorPct: Number(process.env.ACU_MARGIN_FLOOR_PCT ?? 0.60)
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    defaultModel: process.env.OPENAI_DEFAULT_MODEL ?? "gpt-4-turbo"
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    baseUrl:
      process.env.GEMINI_BASE_URL ??
      "https://generativelanguage.googleapis.com",
    defaultModel: process.env.GEMINI_DEFAULT_MODEL ?? "gemini-1.5-flash"
  },

  vertex: {
    projectId: process.env.VERTEX_PROJECT_ID ?? "",
    location: process.env.VERTEX_LOCATION ?? "us-central1",
    defaultModel: process.env.VERTEX_DEFAULT_MODEL ?? "gemini-1.5-pro-preview-0409"
  },

  google: {
    mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    successUrl: process.env.STRIPE_SUCCESS_URL ?? "",
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? ""
  }
};

export { required };
