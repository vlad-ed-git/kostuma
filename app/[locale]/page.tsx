import { getTranslations } from "next-intl/server"

import { CostumeCard } from "@/components/costume/costume-card"
import { Fog } from "@/components/horror/fog"
import { getCostumes, toCard } from "@/lib/catalog"

/**
 * Home (spec §11.1): the title card, then every costume to browse. The
 * costumes live here rather than on a page of their own: one less step.
 * feat/landing adds the countdown and the rest of the title card.
 */
export default async function HomePage() {
  const t = await getTranslations("App")
  const nav = await getTranslations("Nav")

  return (
    <>
      <section
        data-title-card
        // Slides under the header, which stays transparent over a title
        // card. A little short of the screen, so the first costumes peek.
        // Never clipped: its fog fades out over the costumes (app/film.css).
        className="relative -mt-16 flex max-h-240 min-h-[88svh] items-end px-4 pt-32 pb-20 sm:px-6 lg:px-8"
      >
        <Fog />
        <div className="film-weave mx-auto w-full max-w-7xl">
          <h1 className="max-w-[12ch] font-heading text-display-xl uppercase">
            {t("taglineLead")}
          </h1>
          <p className="mt-6 font-heading text-h2 text-blood-text uppercase">
            {t("taglineTail")}
          </p>
        </div>
      </section>

      {/* No heading on screen: the costumes speak for themselves. */}
      <section
        id="costumes"
        aria-label={nav("costumes")}
        className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-4 pb-24 sm:px-6 lg:px-8"
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
          {getCostumes().map((costume) => (
            <li key={costume.slug}>
              <CostumeCard costume={toCard(costume)} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
