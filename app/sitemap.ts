import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { getCostumes } from "@/lib/catalog"
import { PRIVACY_UPDATED, TERMS_UPDATED } from "@/lib/legal"
import { languagesOf, urlIn } from "@/lib/seo"

/**
 * Every page a search engine should know, in every language (owner,
 * 2026-10-04: all of it is translated), each with its versions in the
 * others. Not the pages that are each visitor's own (the basket, the
 * Fitting Room, the account pages): those say noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; updated?: string }[] = [
    { path: "/" },
    ...getCostumes().map(({ slug }) => ({ path: `/costumes/${slug}` })),
    { path: "/feedback" },
    { path: "/terms", updated: TERMS_UPDATED },
    { path: "/privacy", updated: PRIVACY_UPDATED },
  ]
  return pages.flatMap(({ path, updated }) =>
    routing.locales.map((locale) => ({
      url: urlIn(path, locale),
      ...(updated && { lastModified: updated }),
      alternates: { languages: languagesOf(path) },
    }))
  )
}
