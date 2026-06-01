// ============================================================
// NICHE FINDER — CURRENCY DISPLAY CONFIG
// ============================================================

export const PLATFORM_BASE_CURRENCY = "GBP";

export const SUPPORTED_DISPLAY_CURRENCIES = [
  "GBP",
  "USD",
  "EUR",
  "CAD",
  "AUD",
  "NGN",
  "GHS",
  "KES",
  "RWF",
  "CDF",
  "ZAR",
  "XAF",
  "XOF",
  "INR",
  "AED",
] as const;

export type SupportedDisplayCurrency =
  (typeof SUPPORTED_DISPLAY_CURRENCIES)[number];

export const COUNTRY_TO_CURRENCY_MAP: Record<string, SupportedDisplayCurrency> =
  {
    GB: "GBP",
    US: "USD",
    FR: "EUR",
    BE: "EUR",
    DE: "EUR",
    ES: "EUR",
    IT: "EUR",
    CA: "CAD",
    AU: "AUD",
    NG: "NGN",
    GH: "GHS",
    KE: "KES",
    RW: "RWF",
    CD: "USD", // DRC override: default to USD as requested
    ZA: "ZAR",
    CM: "XAF",
    CI: "XOF",
    IN: "INR",
    AE: "AED",
  };

/**
 * Determines if a currency should use 'Face Value' parity (e.g. £10k = €10k = $10k)
 * or 'Exchange Value' parity (e.g. 10k USD = X Local Currency).
 */
export type ParityMode = 'FACE_VALUE' | 'USD_EQUIVALENT';

export interface CurrencySettings {
  code: SupportedDisplayCurrency;
  parityMode: ParityMode;
}

export function getCurrencySettings(countryCode?: string): CurrencySettings {
  if (!countryCode) return { code: "USD", parityMode: "FACE_VALUE" };

  const iso = countryCode.toUpperCase();
  const code = COUNTRY_TO_CURRENCY_MAP[iso] || "USD";

  // Major stable zones stay at 10k units flat
  if (code === "GBP" || code === "EUR" || code === "USD") {
    return { code, parityMode: "FACE_VALUE" };
  }

  // Other regions use the local currency but calculate 10k USD equivalent
  return { code, parityMode: "USD_EQUIVALENT" };
}

export function getDisplayCurrencyFromCountryCode(
  countryCode?: string
): SupportedDisplayCurrency {
  const settings = getCurrencySettings(countryCode);
  return settings.code;
}
