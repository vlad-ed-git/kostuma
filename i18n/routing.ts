import { defineRouting } from "next-intl/routing"

/**
 * The site's languages. Each has its own URLs, so search engines can index
 * every language: English at `/`, the others under their prefix (`/es`, `/zh`).
 */
export const routing = defineRouting({
  locales: ["en", "es", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Each page names its versions in the other languages itself, in its head
  // and the sitemap (lib/seo.ts), with the production address and zh-Hans:
  // no Link header built from whatever host served the request.
  alternateLinks: false,
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

/**
 * The language of a page by its path's prefix (`/es/basket` → `es`), else
 * the default (English lives at the root). For the rare place outside
 * next-intl's reach: app/global-error.tsx.
 */
export function localeOfPath(pathname: string | null | undefined): Locale {
  const prefix = pathname?.split("/")[1]
  return (
    routing.locales.find(
      (locale) => locale !== routing.defaultLocale && locale === prefix
    ) ?? routing.defaultLocale
  )
}
