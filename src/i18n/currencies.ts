export const exchangeRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 157,
    KES: 130, // Kenyan Shilling
    GHS: 14.8, // Ghanaian Cedi
    NGN: 1480, // Nigerian Naira
    ZAR: 18.3, // South African Rand
    INR: 83.5, // Indian Rupee
};

export const localeCurrencyMap: { [key: string]: string } = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'es-ES': 'EUR',
    'ja-JP': 'JPY',
    'en-KE': 'KES',
    'en-GH': 'GHS',
    'en-NG': 'NGN',
    'en-ZA': 'ZAR',
    'en-IN': 'INR',
};

export const getCurrency = (locale: string) => {
    // Check for full locale first
    if (localeCurrencyMap[locale]) {
        return localeCurrencyMap[locale];
    }
    // Fallback to check language part only for some currencies
    const lang = locale.split('-')[0];
    if (lang === 'fr' || lang === 'de' || lang === 'es') {
        return 'EUR';
    }
    return 'USD';
};
