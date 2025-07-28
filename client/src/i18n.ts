import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
  en: { translation: translationEN },
  ar: { translation: translationAR }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Set Arabic as default language
    fallbackLng: 'ar', // Fallback to Arabic if translation missing
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Set initial HTML attributes
document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';

export default i18n;