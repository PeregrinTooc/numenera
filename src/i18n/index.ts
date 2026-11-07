import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import de from "./locales/de.json";

export async function initI18n(): Promise<void> {
  i18next.on("languageChanged", (lang) => {
    document.documentElement.lang = lang;
  });
  await i18next.use(LanguageDetector).init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // Not needed for lit-html (XSS safe)
    },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupQuerystring: "lang",
    },
  });
}

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18next.t(key, options);
};

export const hasTranslation = (key: string): boolean => i18next.exists(key);

export const changeLanguage = async (lang: string): Promise<void> => {
  await i18next.changeLanguage(lang);
};

export const onLanguageChanged = (callback: (lang: string) => void): void => {
  i18next.on("languageChanged", callback);
};
