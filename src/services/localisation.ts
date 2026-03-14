import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@assets/translations/en.json';
import es from '@assets/translations/es.json';
import ar from '@assets/translations/ar.json';

const languageResources = {
  en: { translation: en },
  es: { translation: es },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector) // Add language detector
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: languageResources,
    // Remove hardcoded language - let detector handle it
    fallbackLng: 'en', // Changed to English as more universal fallback
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => {
        // Convert 'en-US' to 'en', 'es-ES' to 'es', etc.
        return lng.split('-')[0];
      }
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;