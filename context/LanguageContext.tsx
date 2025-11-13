import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../lib/translations';

export type Language = 'es' | 'en' | 'zh';

type Translations = typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  // Fix: Add params to t function signature to allow for dynamic values in translations.
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang && ['es', 'en', 'zh'].includes(savedLang) ? savedLang : 'es') as Language;
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  // Fix: Implement parameter substitution in the t function.
  const t = useCallback((key: keyof Translations, params?: Record<string, string | number>) => {
    let translation = translations[language][key] || key;
    if (params) {
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
        });
    }
    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
