import type { Metadata } from "next"

import { languageTags, type Locale, routing } from "@/i18n/routing"
import type { Costume } from "@/lib/catalog/types"
import { siteUrl } from "@/lib/site"

/**
 * How search engines and social networks meet Kostuma (spec §14b): every
 * page in every language is its own, indexed URL (owner, 2026-10-04: all of
 * it is translated), linked to its versions in the other languages; the
 * English one at the root is the default for everyone else.
 */

/** The brand, never translated (spec §2.1). */
export const SITE_NAME = "Kostuma"

/**
 * Each language as hreflang names it: the same tags as `<html lang>`
 * (Chinese is Simplified: zh-Hans).
 */
export const hreflangOf = languageTags

/** A social card's size: what Open Graph and X show large. */
export const OG_SIZE = { width: 1200, height: 630 }

/** Each language as Open Graph names a locale. */
export const ogLocaleOf: Record<Locale, string> = {
  en: "en_US",
  es: "es_LA",
  zh: "zh_CN",
}

/**
 * A page's path in a language, as the routing has it (`as-needed`):
 * English at the root, the others under their prefix ("/es", "/es/terms").
 */
export function pathIn(path: string, locale: Locale): string {
  if (locale === routing.defaultLocale) return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/** A page's absolute URL in a language. */
export function urlIn(path: string, locale: Locale): string {
  return new URL(pathIn(path, locale), siteUrl()).toString()
}

/**
 * A page's canonical URL in this language, and its versions in every
 * language: x-default, for any other, is the English one.
 */
export function alternatesFor(
  path: string,
  locale: Locale
): NonNullable<Metadata["alternates"]> {
  return { canonical: urlIn(path, locale), languages: languagesOf(path) }
}

/** A page's URL in every language, by hreflang, and x-default. */
export function languagesOf(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [hreflangOf[locale], urlIn(path, locale)])
    ),
    "x-default": urlIn(path, routing.defaultLocale),
  }
}

/** An indexed page, as search and sharing describe it. */
export type Page = {
  /** Its path in English: "/", "/terms", "/costumes/freddy-krueger". */
  path: string
  title: string
  description?: string
  /**
   * For a page without a card of its own (no opengraph-image.tsx beside
   * it): the home page's, described so. A page's Open Graph replaces the
   * one it would inherit, card and all.
   */
  homeCard?: { alt: string }
}

/**
 * The home page's card (app/[locale]/opengraph-image.tsx). Next serves the
 * cards under their language, English too (`/en/…`): proxy.ts lets them be.
 */
export function homeCardIn(locale: Locale, alt: string) {
  return {
    url: `/${locale}/opengraph-image/card`,
    ...OG_SIZE,
    type: "image/png",
    alt,
  }
}

/**
 * A page's Open Graph: what a shared link shows. Next replaces the
 * layout's Open Graph with a page's whole, so every page says it all.
 */
export function openGraphFor(
  locale: Locale,
  page: Page
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: ogLocaleOf[locale],
    alternateLocale: routing.locales
      .filter((other) => other !== locale)
      .map((other) => ogLocaleOf[other]),
    url: urlIn(page.path, locale),
    title: page.title,
    ...(page.description && { description: page.description }),
    ...(page.homeCard && {
      images: [homeCardIn(locale, page.homeCard.alt)],
    }),
  }
}

/** A page's metadata for search and sharing, in one. */
export function seoFor(
  locale: Locale,
  page: Page
): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: alternatesFor(page.path, locale),
    openGraph: openGraphFor(locale, page),
    twitter: {
      card: "summary_large_image",
      title: page.title,
      ...(page.description && { description: page.description }),
      ...(page.homeCard && {
        images: [homeCardIn(locale, page.homeCard.alt)],
      }),
    },
  }
}

// Structured data (schema.org JSON-LD), validated in lib/seo.test.ts.

type Thing = Record<string, unknown>

/** Kostuma itself. */
export function organization(): Thing {
  const home = siteUrl().toString()
  return {
    "@type": "Organization",
    "@id": `${home}#organization`,
    name: SITE_NAME,
    url: home,
    logo: new URL("/icons/icon-512.png", siteUrl()).toString(),
  }
}

/** The site, in this language. */
export function website(locale: Locale, description: string): Thing {
  return {
    "@type": "WebSite",
    "@id": `${urlIn("/", locale)}#website`,
    name: SITE_NAME,
    url: urlIn("/", locale),
    description,
    inLanguage: hreflangOf[locale],
    publisher: { "@id": organization()["@id"] },
  }
}

/** The collection on the home page: every costume, in its order. */
export function costumeList(
  costumes: readonly Pick<Costume, "slug" | "name">[],
  locale: Locale,
  name: string
): Thing {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: costumes.length,
    itemListElement: costumes.map((costume, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: urlIn(`/costumes/${costume.slug}`, locale),
      name: costume.name,
    })),
  }
}

/** Where a page sits: each step a name and, but for the page itself, a URL. */
export function breadcrumbs(
  steps: readonly { name: string; url?: string }[]
): Thing {
  return {
    "@type": "BreadcrumbList",
    itemListElement: steps.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      ...(step.url && { item: step.url }),
    })),
  }
}

/** One or more things as a JSON-LD document. */
export function jsonLd(...things: Thing[]) {
  return things.length === 1
    ? { "@context": "https://schema.org", ...things[0] }
    : { "@context": "https://schema.org", "@graph": things }
}
