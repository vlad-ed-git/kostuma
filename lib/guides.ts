import { makeupGuides } from "@/content/makeup"
import { translations } from "@/content/translations"
import type { Locale } from "@/i18n/routing"
import type { MakeupGuide } from "@/lib/makeup"

/**
 * A costume's makeup guide in a language: the renders as they are (YouCam
 * paints the same face in every language), the words translated
 * (content/translations), its products, the shops' search terms, among
 * them.
 */
export function guideFor(
  slug: string,
  locale: Locale = "en"
): MakeupGuide | undefined {
  const guide = makeupGuides[slug]
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
