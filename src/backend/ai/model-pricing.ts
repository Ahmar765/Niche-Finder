import type { ModelPricing } from '@acu/acu-core';

// NOTE: These are example prices and should be updated with actual costs from provider invoices.
export const modelPricingData: ModelPricing[] = [
    {
        "provider": "openai",
        "model": "gpt-4-turbo",
        "pricingMode": "token",
        "inputCostPer1M": 10,
        "outputCostPer1M": 30
    },
    {
        "provider": "gemini",
        "model": "gemini-1.5-flash",
        "pricingMode": "token",
        "inputCostPer1M": 0.35,
        "outputCostPer1M": 0.70
    },
    {
        "provider": "vertex",
        "model": "gemini-1.5-pro-preview-0409",
        "pricingMode": "token",
        "inputCostPer1M": 3.5,
        "outputCostPer1M": 10.5
    }
];

export const getModelPricing = (provider: string, model: string): ModelPricing | undefined => {
    // Find the most specific match first
    return modelPricingData.find(p => p.provider === provider && p.model === model);
}
