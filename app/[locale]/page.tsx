import type { Metadata } from "next"
import { headers } from "next/headers"
import { getLocale, getTranslations } from "next-intl/server"

import { CostumeRow } from "@/components/costume/costume-row"
import { Countdown } from "@/components/countdown/countdown"
import { BloodDrip } from "@/components/home/blood-drip"
import { NightScene } from "@/components/home/night-scene"
import { Tagline } from "@/components/home/tagline"
import { TransformationReel } from "@/components/home/transformation-reel"
import { costumesHref } from "@/components/layout/nav"
import { JsonLd } from "@/components/seo/json-ld"
import { Link } from "@/i18n/navigation"
import { getCostumes, toSummary } from "@/lib/catalog"
import { seasonIn } from "@/lib/countdown"
import {
  costumeList,
  jsonLd,
  organization,
  SITE_NAME,
  seoFor,
  website,
} from "@/lib/seo"
import { visitorFrom } from "@/lib/visitor"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("App")
  return seoFor(locale, {
    path: "/",
    title: SITE_NAME,
    description: t("tagline"),
  })
}

/**
 * Home (spec §11.1): the title card, with a real transformation on a strip
 * of film under the tagline (what to expect), the countdown to Halloween
 * (once its night has passed, to Christmas), and "Choose your costume",
 * "Try it on", "Apply makeup"; then every costume to browse. The costumes
 * live here rather than on a page of their own: one less step.
 */
export default async function HomePage() {
  const locale = await getLocale()
  const app = await getTranslations("App")
  const home = await getTranslations("Home")
  const nav = await getTranslations("Nav")
  const costumes = getCostumes(locale)
  // The server's guess of the season, by the connection's time zone (on
  // Vercel); the browser corrects it with the visitor's own clock.
  const season = seasonIn(new Date(), visitorFrom(await headers()).timeZone)

  return (
    <>
      <JsonLd
        data={jsonLd(
          organization(),
          website(locale, app("tagline")),
          costumeList(costumes, locale, nav("costumes"))
        )}
      />
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
            <Tagline holiday={season.holiday} />
          </div>
          {/* What to expect, without a word. */}
          <TransformationReel className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-16" />
          <div className="lg:col-start-2 lg:row-start-1 lg:pl-4">
            <Countdown season={season} />
          </div>
          {/* The way through, as the strip shows it. Wide screens: beside
              the strip, their tops level. */}
          <ol className="flex flex-col gap-2 font-heading text-[clamp(1.9rem,3.2vw,2.9rem)] leading-none font-semibold lg:col-start-2 lg:row-start-2 lg:mt-[calc(4rem-0.2em)] lg:self-start lg:pl-4">
            <li>
              <Link
                href={costumesHref}
                className="inline-flex min-h-11 items-center gap-3.5 whitespace-nowrap transition-colors hover:text-blood-text"
              >
                {/* The site's link underline, in blood: the one of the three
                    lines that goes somewhere (todo UX-06). */}
                <span className="underline decoration-blood decoration-[0.06em] underline-offset-[0.16em]">
                  {home("chooseCostume")}
                </span>
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
          {costumes.map((costume) => (
            <li key={costume.slug} className="lit">
              <CostumeRow costume={toSummary(costume)} />
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
