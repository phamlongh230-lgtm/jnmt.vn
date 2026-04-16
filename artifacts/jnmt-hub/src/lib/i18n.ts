import vi from "./translations/vi";

export const LANGUAGES = [
  { code: "vi", flag: "🇻🇳", name: "Việt" },
  { code: "ko", flag: "🇰🇷", name: "한국어" },
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "mn", flag: "🇲🇳", name: "Монгол" },
  { code: "kk", flag: "🇰🇿", name: "Қазақ" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
];

export type LangCode = "vi" | "ko" | "en" | "mn" | "kk" | "ru";

// Registry — vi is pre-loaded synchronously, others loaded on demand
const registry: Partial<Record<LangCode, Record<string, string>>> = { vi };

const loaders: Record<LangCode, () => Promise<{ default: Record<string, string> }>> = {
  vi: () => import("./translations/vi"),
  ko: () => import("./translations/ko"),
  en: () => import("./translations/en"),
  mn: () => import("./translations/mn"),
  kk: () => import("./translations/kk"),
  ru: () => import("./translations/ru"),
};

/** Load a language bundle. No-op if already loaded. */
export async function loadLang(lang: LangCode): Promise<void> {
  if (registry[lang]) return;
  const mod = await loaders[lang]();
  registry[lang] = mod.default;
}

/** Synchronous lookup — assumes lang is already loaded (falls back to vi). */
export function t(lang: LangCode, key: string): string {
  return registry[lang]?.[key] ?? registry["vi"]?.[key] ?? key;
}
