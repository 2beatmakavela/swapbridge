'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { defaultLanguage, languages, translations } from './translations';

const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('boltSwapLanguage');
      if (saved && translations[saved]) {
        setLanguage(saved);
      }
    } catch (error) {
      console.warn('Unable to read language from storage', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('boltSwapLanguage', language);
    } catch (error) {
      console.warn('Unable to save language to storage', error);
    }
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    languages,
    t: translations[language] || translations[defaultLanguage],
  }), [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
