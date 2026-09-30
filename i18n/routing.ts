import { defineRouting } from "next-intl/routing"

/**
 * The site's languages. Each has its own URLs, so search engines can index
 * every language: English at `/`, the others under their prefix (`/es`, `/zh`).
 */
export const routing = defineRouting({
  locales: ["en", "es", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]

/**
 * The BCP 47 tag of each locale, for `<html lang>`. Chinese is Simplified:
 * `zh-Hans` lets browsers pick Simplified glyphs.
 */
export const languageTags: Record<Locale, string> = {
  en: "en",
  es: "es",
  zh: "zh-Hans",
}
