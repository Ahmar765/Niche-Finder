'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { exchangeRates, getCurrency } from './currencies';
import {
  type LocalePreference,
  type SupportedLang,
  translations,
  readStoredLocalePreference,
  writeStoredLocalePreference,
  resolveActiveLocale,
} from './locales';

type LocaleContextType = {
  t: (key: string, values?: { [key: string]: string | number }) => string;
  formatCurrency: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string,
    isParity?: boolean,
  ) => string;
  locale: string;
  currency: string;
  lang: SupportedLang;
  localePreference: LocalePreference;
  setLocalePreference: (preference: LocalePreference) => void;
  isMounted: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function applyDocumentLanguage(lang: SupportedLang, locale: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-locale', locale);
}

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [localePreference, setLocalePreferenceState] = useState<LocalePreference>('auto');
  const [locale, setLocale] = useState('en-US');
  const [lang, setLang] = useState<SupportedLang>('en');
  const [currency, setCurrency] = useState('USD');
  const [loadedTranslations, setLoadedTranslations] = useState(translations.en);
  const [isMounted, setIsMounted] = useState(false);

  const applyLocale = useCallback((preference: LocalePreference) => {
    const resolved = resolveActiveLocale(preference);
    setLang(resolved.lang);
    setLocale(resolved.locale);
    setLoadedTranslations(translations[resolved.lang]);
    setCurrency(getCurrency(resolved.locale));
    applyDocumentLanguage(resolved.lang, resolved.locale);
  }, []);

  const setLocalePreference = useCallback(
    (preference: LocalePreference) => {
      setLocalePreferenceState(preference);
      writeStoredLocalePreference(preference);
      applyLocale(preference);
    },
    [applyLocale],
  );

  useEffect(() => {
    const stored = readStoredLocalePreference();
    setLocalePreferenceState(stored);
    applyLocale(stored);
    setIsMounted(true);
  }, [applyLocale]);

  useEffect(() => {
    if (!isMounted || localePreference !== 'auto') return;

    const syncFromDevice = () => applyLocale('auto');

    window.addEventListener('languagechange', syncFromDevice);
    window.addEventListener('focus', syncFromDevice);

    return () => {
      window.removeEventListener('languagechange', syncFromDevice);
      window.removeEventListener('focus', syncFromDevice);
    };
  }, [isMounted, localePreference, applyLocale]);

  const t = useCallback(
    (key: string, values?: { [key: string]: string | number }): string => {
      const keys = key.split('.');
      let result: unknown = loadedTranslations;
      try {
        for (const k of keys) {
          result = (result as Record<string, unknown>)?.[k];
        }
      } catch {
        return key;
      }

      if (typeof result !== 'string') {
        return key;
      }

      let sResult = result;
      if (values) {
        for (const valueKey in values) {
          sResult = sResult.replace(`{${valueKey}}`, String(values[valueKey]));
        }
      }
      return sResult;
    },
    [loadedTranslations],
  );

  const formatCurrency = useCallback(
    (
      amount: number,
      fromCurrency: string = 'USD',
      toCurrency?: string,
      isParity: boolean = false,
    ) => {
      const currentLocale = isMounted ? locale : 'en-US';
      const targetCurrencyCode = toCurrency || (isMounted ? currency : 'USD');

      let displayAmount = amount;
      if (!isParity) {
        const rate =
          (exchangeRates[targetCurrencyCode] || exchangeRates.USD) /
          (exchangeRates[fromCurrency] || 1);
        displayAmount = amount * rate;
      }

      try {
        return new Intl.NumberFormat(currentLocale, {
          style: 'currency',
          currency: targetCurrencyCode,
          maximumFractionDigits: 0,
        }).format(displayAmount);
      } catch {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(amount);
      }
    },
    [isMounted, locale, currency],
  );

  const value = useMemo(
    () => ({
      t,
      formatCurrency,
      locale,
      currency,
      lang,
      localePreference,
      setLocalePreference,
      isMounted,
    }),
    [t, formatCurrency, locale, currency, lang, localePreference, setLocalePreference, isMounted],
  );

  return React.createElement(LocaleContext.Provider, { value }, children);
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export {
  type LocalePreference,
  type SupportedLang,
  SUPPORTED_LANGUAGES,
  resolveLocaleFromDevice,
} from './locales';
