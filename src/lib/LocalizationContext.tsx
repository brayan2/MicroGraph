import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setClientLocale } from './hygraphClient';

type Locale = 'en' | 'de' | 'fr' | 'es';

interface LocalizationContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    availableLocales: { code: Locale; label: string; flag: string }[];
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const availableLocales: { code: Locale; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const isValidLocale = (locale: string): locale is Locale => {
    return availableLocales.some(l => l.code === locale);
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const getInitialLocale = (): Locale => {
        const path = window.location.pathname;
        const lang = path.split('/')[1];
        if (isValidLocale(lang)) return lang;
        return 'en';
    };

    const [locale, setLocaleState] = useState<Locale>(getInitialLocale());

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        setClientLocale(newLocale);
    };

    // Initialize client locale on mount
    useEffect(() => {
        setClientLocale(locale);
    }, [locale]);

    return (
        <LocalizationContext.Provider value={{ locale, setLocale, availableLocales }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
