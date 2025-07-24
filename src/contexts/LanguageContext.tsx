import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  translations: Record<string, string>;
  t: (key: string, replacements?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const loadedLanguages: Record<string, Record<string, string>> = {};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('edupx-lang') || 'en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        if (loadedLanguages[language]) {
            setTranslations(loadedLanguages[language]);
        } else {
            const response = await fetch(`/locales/${language}.json`);
            if (!response.ok) {
              // Fallback to English if the language file is not found
              console.warn(`Language file for ${language} not found, falling back to English.`);
              const fallbackResponse = await fetch(`/locales/en.json`);
              const fallbackData = await fallbackResponse.json();
              loadedLanguages['en'] = fallbackData;
              setTranslations(fallbackData);
              setLanguageState('en');
              localStorage.setItem('edupx-lang', 'en');
              return;
            }
            const data = await response.json();
            loadedLanguages[language] = data;
            setTranslations(data);
        }
      } catch (error) {
        console.error('Could not load translations for', language, error);
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = (langCode: string) => {
    localStorage.setItem('edupx-lang', langCode);
    setLanguageState(langCode);
  };

  const t = useMemo(() => (key: string, replacements?: Record<string, string>): string => {
    let translation = translations[key] || key;
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{{${placeholder}}}`, replacements[placeholder]);
      });
    }
    return translation;
  }, [translations]);

  const value = {
    language,
    setLanguage,
    translations,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
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
