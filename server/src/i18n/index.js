import en from "./en.js";
import no from "./no.js";

const translations = { en, no };

// Detect browser language from Accept-Language header
export function getLanguage(header = "") {
  const lang = header.toLowerCase();

  if (
    lang.startsWith("no") ||
    lang.includes("nb") ||
    lang.includes("nn")
  ) {
    return "no";
  }

  return "en";
}

// Translation helper
export function t(lang, key) {
  const keys = key.split(".");
  let value = translations[lang];

  for (const k of keys) {
    value = value?.[k];
  }

  // fallback to English
  if (!value) {
    value = keys.reduce((obj, k) => obj?.[k], translations.en);
  }

  return value || key;
}