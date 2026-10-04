import { makeupGuides } from "@/content/makeup"
import { translations } from "@/content/translations"
import type { Locale } from "@/i18n/routing"
import type { MakeupGuide } from "@/lib/makeup"

/**
 * A costume's makeup guide in a language: the renders as they are (YouCam
 * paints the same face in every language), the words translated
 * (content/translations), its products, the shops' search terms, among
 * them. `slug` may come from a visitor: only a costume's own guide is
 * found ("constructor" or "__proto__" find nothing).
 */
export function guideFor(
  slug: string,
  locale: Locale = "en"
): MakeupGuide | undefined {
  const guide = Object.hasOwn(makeupGuides, slug)
    ? makeupGuides[slug]
    : undefined
  if (!guide || locale === "en") return guide
  const text = translations[locale].guides[slug]
  // translations.test.ts makes sure there is one, step for step.
  if (!text) return guide
  return {
    ...guide,
    look: text.look,
    steps: guide.steps.map((step, index) => ({
      ...step,
      ...text.steps[index],
    })),
    ...(guide.finish !== undefined && { finish: text.finish ?? guide.finish }),
  }
}

/**
 * A product of a guide's step as the page shows it: its name in the
 * visitor's language, and the English words a shop is searched with (todo
 * UX-11: a translated name finds little on amazon.com).
 */
export type Product = { name: string; search: string }

/** A costume's makeup guide as the Fitting Room reads it: words only. */
export type GuideText = {
  steps: { title: string; howTo: string; products: Product[] }[]
  finish?: string
}

/** A costume's guide in a language, for the page; undefined if none. */
export function guideText(
  slug: string,
  locale: Locale = "en"
): GuideText | undefined {
  const guide = guideFor(slug, locale)
  const english = guideFor(slug)
  if (!guide || !english) return undefined
  return {
    steps: guide.steps.map(({ title, howTo, products }, step) => ({
      title,
      howTo,
      products: products.map((name, index) => ({
        name,
        search: english.steps[step]?.products[index] ?? name,
      })),
    })),
    ...(guide.finish !== undefined && { finish: guide.finish }),
  }
}
