import { RiArrowDownLine } from "@remixicon/react"
import { getTranslations } from "next-intl/server"

import { CostumeCard } from "@/components/costume/costume-card"
import { Countdown } from "@/components/countdown/countdown"
import { Fog } from "@/components/horror/fog"
import { costumesHref } from "@/components/layout/nav"
import { Link } from "@/i18n/navigation"
import { getCostumes, toCard } from "@/lib/catalog"
import { countdownTo } from "@/lib/countdown"

/**
 * Home (spec §11.1): the title card, with the countdown to Halloween and,
 * under it, "Choose your costume", then every costume to browse. The
 * costumes live here rather than on a page of their own: one less step.
 */
export default async function HomePage() {
  const t = await getTranslations("App")
  const home = await getTranslations("Home")
  const nav = await getTranslations("Nav")
  // The server's guess of the Halloween to come; the browser corrects it
  // for the visitor's own time zone.
  const { year } = countdownTo(new Date())

  return (
    <>
      <section
        data-title-card
        // Slides under the header, which stays transparent over a title
        // card. As tall as its content, no taller (owner: no empty band
        // above it). Never clipped: its fog fades out over the costumes.
        className="relative -mt-16 pt-28 pb-14 lg:pt-32"
      >
        <Fog />
        {/* Desktop: the tagline on the left, the countdown on the right with
            "Choose your costume" under it. Small screens: one column. */}
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16 lg:px-8">
          {/* The gate weave moves the title only, never what is read. */}
          <div className="film-weave">
            <h1 className="max-w-[16ch] font-heading text-display-xl text-balance uppercase lg:text-[clamp(4.5rem,7.5vw,8.5rem)]">
              {t("taglineLead")}
            </h1>
            <p className="mt-5 font-heading text-h2 text-blood-text uppercase">
              {t("taglineTail")}
            </p>
          </div>
          <div>
            <Countdown year={year} />
            <Link
              href={costumesHref}
              className="group mt-10 inline-flex min-h-11 items-center gap-3 font-heading text-h2 leading-none whitespace-nowrap uppercase transition-colors hover:text-blood-text lg:text-[clamp(2.25rem,3.6vw,3.5rem)]"
            >
              {home("chooseCostume")}
              <RiArrowDownLine
                aria-hidden="true"
                className="drip size-[0.7em] shrink-0 text-blood-text"
              />
            </Link>
          </div>
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
