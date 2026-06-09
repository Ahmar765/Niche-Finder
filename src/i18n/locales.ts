import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export type SupportedLang = 'en' | 'es' | 'fr';

export type LocalePreference = 'auto' | SupportedLang;

export const LOCALE_STORAGE_KEY = 'niche-finder-locale';

export const SUPPORTED_LANGUAGES: {
  code: SupportedLang;
  labelKey: string;
  defaultLocale: string;
}[] = [
  { code: 'en', labelKey: 'language.en', defaultLocale: 'en-US' },
  { code: 'es', labelKey: 'language.es', defaultLocale: 'es-ES' },
  { code: 'fr', labelKey: 'language.fr', defaultLocale: 'fr-FR' },
];

export type TranslationDictionary = Record<string, unknown>;

export const translations: Record<SupportedLang, TranslationDictionary> = { en, es, fr };

export function isSupportedLang(value: string): value is SupportedLang {
  return value === 'en' || value === 'es' || value === 'fr';
}

export function readStoredLocalePreference(): LocalePreference {
  if (typeof window === 'undefined') return 'auto';
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'auto') return 'auto';
    if (stored && isSupportedLang(stored)) return stored;
  } catch {
    /* ignore */
  }
  return 'auto';
}

export function writeStoredLocalePreference(preference: LocalePreference): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
}

/** Match device/browser language tags against supported app languages. */
export function resolveLocaleFromDevice(): { lang: SupportedLang; locale: string } {
  const candidates: string[] =
    typeof navigator !== 'undefined'
      ? [...(navigator.languages ?? []), navigator.language].filter(Boolean)
      : ['en-US'];

  for (const tag of candidates) {
    const normalized = tag.trim();
    if (!normalized) continue;

    const primary = normalized.split('-')[0]?.toLowerCase();
    if (primary && isSupportedLang(primary)) {
      return { lang: primary, locale: normalized };
    }
  }

  return { lang: 'en', locale: 'en-US' };
}

export function resolveActiveLocale(preference: LocalePreference): { lang: SupportedLang; locale: string } {
  if (preference !== 'auto' && isSupportedLang(preference)) {
    const config = SUPPORTED_LANGUAGES.find((entry) => entry.code === preference);
    return { lang: preference, locale: config?.defaultLocale ?? `${preference}-${preference.toUpperCase()}` };
  }
  return resolveLocaleFromDevice();
}
