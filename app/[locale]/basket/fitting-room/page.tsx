import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import {
  type FittingCostume,
  FittingRoom,
} from "@/components/fitting-room/fitting-room"
import { redirect } from "@/i18n/navigation"
import { withNext } from "@/lib/auth/next-path"
import { getUser } from "@/lib/auth/session"
import { getCostume, getCostumes, toSummary } from "@/lib/catalog"
import { currentTryOn } from "@/lib/fitting-room/current-try-on"
import { allowanceOf } from "@/lib/fitting-room/free-costume"
import { guideFor } from "@/lib/guides"
import { fittingRoom } from "@/lib/fitting-room/service"
import { fittingRoomStore } from "@/lib/fitting-room/store"
import { toView, type TryOnView } from "@/lib/fitting-room/try-on"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FittingRoom")
  // Each visitor's own photos: never indexed.
  return { title: t("title"), robots: { index: false } }
}

/**
 * The Fitting Room (owner, 2026-10-03), part of My Pumpkin Basket: a costume
 * from the basket (`?costume=`) tried on the visitor's own photos, the
 * outfit then its makeup, step by step. Signed in only: signed out, sign in
 * first, then back here. Every account tries one costume on free; then the
 * page offers Kostuma Pro (lib/fitting-room/free-costume.ts).
 */
export default async function FittingRoomPage({
  searchParams,
}: PageProps<"/[locale]/basket/fitting-room">) {
  const { costume: wanted } = await searchParams
  const slug = typeof wanted === "string" ? wanted : undefined
  const here = slug
    ? `/basket/fitting-room?costume=${encodeURIComponent(slug)}`
    : "/basket/fitting-room"
  const locale = await getLocale()
  const user = await getUser()
  if (!user) {
    return redirect({ href: withNext("/sign-in", here), locale })
  }

  const t = await getTranslations("FittingRoom")
  const costume = slug ? getCostume(slug, locale) : undefined
  // The guide's words in the visitor's language; the renders are the same.
  const guide = costume ? guideFor(costume.slug, locale) : undefined
  const selected: FittingCostume | null =
    costume && guide && costume.images[0]
      ? {
          ...toSummary(costume),
          guide: {
            steps: guide.steps.map(({ title, howTo, products }) => ({
              title,
              howTo,
              products,
            })),
            finish: guide.finish,
          },
          allMakeup: guide.allMakeup === true,
        }
      : null

  let room: { face: string | null; body: string | null } = {
    face: null,
    body: null,
  }
  let tryOn: TryOnView | null = null
  // Unknown, the page lets the visitor on: starting a try-on decides.
  let free = true
  let usedOn: string | null = null
  const renderer = fittingRoom()?.provider.name
  try {
    const store = fittingRoomStore()
    const [kept, tryOns] = await Promise.all([
      store.room(user.uid),
      store.tryOns(user.uid),
    ])
    room = { face: kept.face?.id ?? null, body: kept.body?.id ?? null }
    // The try-on of the photos in use, else the newest, by the renderer in
    // use: never a fake one standing in for real renders.
    const current =
      selected &&
      costume &&
      currentTryOn(tryOns, {
        costume,
        renderer,
        room: kept,
        allMakeup: selected.allMakeup,
      })
    tryOn = current ? toView(current) : null
    if (renderer) {
      const allowance = allowanceOf(tryOns, kept.failedTries, renderer)
      free = allowance.free
      if (!allowance.free && allowance.costume)
        usedOn = getCostume(allowance.costume)?.name ?? null
    }
  } catch (error) {
    // The page still offers the photos; starting says if it can't.
    console.error("Could not read the Fitting Room.", error)
  }

  const costumes = getCostumes(locale)
    .filter((each) => guideFor(each.slug) && each.images[0])
    .map(toSummary)

  // The dressing room (spec §11.4b): a red light behind the mirrors and
  // moonlight from above, fading out before the page ends; the title card
  // split into its red and bone ghosts, the tape rolling through it from
  // one edge of the screen to the other (clipped there: no sideways scroll).
  return (
    <div className="relative isolate overflow-x-clip">
      <div
        aria-hidden="true"
        className="dressing-light pointer-events-none absolute inset-0 -z-10"
      />
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 lg:px-8 lg:pt-14">
        <header className="relative">
          <h1 className="vhs-ghost-title font-heading text-display font-semibold text-balance">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-[60ch] text-lead text-muted-foreground">
            {selected ? t("transform", { name: selected.name }) : t("lead")}
          </p>
          <div
            aria-hidden="true"
            className="vhs-tracking vhs-tracking-fade dressing-tape"
          />
        </header>
        <FittingRoom
          costumes={costumes}
          selected={selected}
          room={room}
          tryOn={tryOn}
          open={renderer !== undefined}
          free={free}
          usedOn={usedOn}
        />
      </div>
    </div>
  )
}
