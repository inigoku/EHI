export type Language = "es" | "en";

const STORAGE_KEY = "reading_language";

/** Detects the visitor's preferred language from the browser, defaulting to Spanish. */
export function detectDefaultLanguage(): Language {
  if (typeof navigator === "undefined") return "es";
  const candidates = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const lang of candidates) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    if (lower.startsWith("en")) return "en";
    if (lower.startsWith("es")) return "es";
  }
  return "es";
}

export function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;
  return detectDefaultLanguage();
}

export function persistLanguage(language: Language) {
  localStorage.setItem(STORAGE_KEY, language);
}
