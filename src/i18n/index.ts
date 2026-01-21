// i18n initialization and configuration
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import de from "./locales/de.json";

// Initialize i18next with language detection
export async function initI18n(): Promise<void> {
  await i18next
    .use(LanguageDetector) // Detects user language from browser
    .init({
      resources: {
        en: { translation: en },
        de: { translation: de },
      },
      fallbackLng: "en", // Fallback to English if detection fails
      debug: false, // Set to true for debugging
      interpolation: {
        escapeValue: false, // Not needed for lit-html (XSS safe)
      },
      detection: {
        // Order of language detection methods
        order: ["querystring", "localStorage", "navigator"],
        // Cache user language choice
        caches: ["localStorage"],
        // Query string parameter name for language override
        lookupQuerystring: "lang",
      },
    });
}

// Export t function for translations
export const t = (key: string): string => {
  return i18next.t(key);
};

// Export language change function
export const changeLanguage = async (lang: string): Promise<void> => {
  await i18next.changeLanguage(lang);
};

// Export current language getter
export const getCurrentLanguage = (): string => {
  return i18next.language;
};

// Export language change event subscription
export const onLanguageChanged = (callback: (lang: string) => void): void => {
  i18next.on("languageChanged", callback);
};
