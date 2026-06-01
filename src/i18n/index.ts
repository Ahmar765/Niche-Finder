'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { exchangeRates, getCurrency } from './currencies';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const translations: { [key: string]: any } = { en, es, fr };

type LocaleContextType = {
    t: (key: string, values?: { [key: string]: string | number }) => string;
    formatCurrency: (amount: number, fromCurrency?: string, toCurrency?: string, isParity?: boolean) => string;
    locale: string;
    currency: string;
    lang: string;
    isMounted: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState('en-US');
    const [lang, setLang] = useState('en');
    const [currency, setCurrency] = useState('USD');
    const [loadedTranslations, setLoadedTranslations] = useState(en);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const browserLang = navigator.language || 'en-US';
        const primaryLang = browserLang.split('-')[0];
        setLocale(browserLang);
        
        if (translations[primaryLang]) {
            setLang(primaryLang);
            setLoadedTranslations(translations[primaryLang]);
        } else {
            setLang('en');
            setLoadedTranslations(en);
        }
        
        setCurrency(getCurrency(browserLang));
        setIsMounted(true);
    }, []);

    const t = (key: string, values?: { [key: string]: string | number }): string => {
        const keys = key.split('.');
        let result: any = loadedTranslations;
        try {
            for (const k of keys) {
                result = result?.[k];
            }
        } catch (error) {
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
    };

    /**
     * Formats currency with optional parity logic.
     */
    const formatCurrency = (amount: number, fromCurrency: string = 'USD', toCurrency?: string, isParity: boolean = false) => {
        // Hydration safety: use stable default if not mounted
        const currentLocale = isMounted ? locale : 'en-US';
        const targetCurrencyCode = toCurrency || (isMounted ? currency : 'USD');
        
        let displayAmount = amount;
        if (!isParity) {
            const rate = (exchangeRates[targetCurrencyCode] || exchangeRates['USD']) / (exchangeRates[fromCurrency] || 1);
            displayAmount = amount * rate;
        }
        
        try {
            return new Intl.NumberFormat(currentLocale, {
                style: 'currency',
                currency: targetCurrencyCode,
                maximumFractionDigits: 0,
            }).format(displayAmount);
        } catch (e) {
             return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
            }).format(amount);
        }
    };

    const value = { t, formatCurrency, locale, currency, lang, isMounted };

    return React.createElement(LocaleContext.Provider, { value }, children);
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
