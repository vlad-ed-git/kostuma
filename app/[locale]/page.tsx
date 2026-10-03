import { getTranslations } from "next-intl/server"

import { CostumeRow } from "@/components/costume/costume-row"
import { Countdown } from "@/components/countdown/countdown"
import { BloodDrip } from "@/components/home/blood-drip"
import { NightScene } from "@/components/home/night-scene"
import { TransformationReel } from "@/components/home/transformation-reel"
import { costumesHref } from "@/components/layout/nav"
import { Link } from "@/i18n/navigation"
import { getCostumes, toSummary } from "@/lib/catalog"
import { countdownTo } from "@/lib/countdown"

/**
 * Home (spec §11.1): the title card, with a real transformation on a strip
 * of film under the tagline (what to expect), the countdown to Halloween,
 * and "Choose your costume", "Try it on", "Apply makeup"; then every
 * costume to browse. The costumes live here rather than on a page of their own: one
 * less step.
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
        // card. As tall as its content. Clipped, because the scene is
        // wider than the screen; everything in it fades out before the
        // edges, so no line marks where it ends.
        // Owner: a short way down to the costumes, and the window behind
        // left whole (it grows with the card's height).
        className="relative isolate -mt-16 overflow-clip pt-80 pb-10 lg:pt-61 lg:pb-20"
      >
        <NightScene />
        {/* Desktop: the tagline on the left with the film strip under it;
            on the right the countdown, its bottom on the tagline's, and
            "Choose your costume", "Try it on", "Apply makeup" beside the
            strip. Small screens: one column. */}
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-x-16 lg:px-8">
          <div>
            <h1 className="flicker vhs-ghost-title max-w-[11ch] font-heading text-display-xl font-semibold text-balance [--title-glow:0_0_40px_rgb(0_0_0/0.8)]">
              {t("taglineLead")}
            </h1>
            <p className="mt-5 font-heading text-[clamp(1.6rem,3vw,2.6rem)] leading-none font-medium text-blood-text [text-shadow:0_0_24px_color-mix(in_oklch,var(--blood)_45%,transparent)]">
              {t("taglineTail")}
            </p>
          </div>
          {/* What to expect, without a word. */}
          <TransformationReel className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-16" />
          <div className="lg:col-start-2 lg:row-start-1 lg:pl-4">
            <Countdown year={year} />
          </div>
          {/* The way through, as the strip shows it. Wide screens: beside
              the strip, their tops level. */}
          <ol className="flex flex-col gap-2 font-heading text-[clamp(1.9rem,3.2vw,2.9rem)] leading-none font-semibold lg:col-start-2 lg:row-start-2 lg:mt-[calc(4rem-0.2em)] lg:self-start lg:pl-4">
            <li>
              <Link
                href={costumesHref}
                className="inline-flex min-h-11 items-center gap-3.5 whitespace-nowrap transition-colors hover:text-blood-text"
              >
                {home("chooseCostume")}
                <BloodDrip />
              </Link>
            </li>
            <li className="flex min-h-11 items-center">{home("tryItOn")}</li>
            <li className="flex min-h-11 items-center">
              {home("applyMakeup")}
            </li>
          </ol>
        </div>
        {/* The tape rolls up over the whole title, as on the 404. */}
        <div aria-hidden="true" className="vhs-tracking vhs-tracking-fade" />
      </section>

      {/* No heading on screen: "Choose your costume" leads here. */}
      <section
        id="costumes"
        aria-label={nav("costumes")}
        className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-4 pb-28 sm:px-6 lg:px-8"
      >
        <ol className="grid gap-x-16 gap-y-2 lg:grid-cols-2">
          {getCostumes().map((costume) => (
            <li key={costume.slug} className="lit">
              <CostumeRow costume={toSummary(costume)} />
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
