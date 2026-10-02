import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import {
  type FittingCostume,
  FittingRoom,
} from "@/components/fitting-room/fitting-room"
import { makeupGuides } from "@/content/makeup"
import { redirect } from "@/i18n/navigation"
import { withNext } from "@/lib/auth/next-path"
import { getUser } from "@/lib/auth/session"
import { getCostume, getCostumes, toSummary } from "@/lib/catalog"
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
 * first, then back here.
 */
export default async function FittingRoomPage({
  searchParams,
}: PageProps<"/[locale]/basket/fitting-room">) {
  const { costume: wanted } = await searchParams
  const slug = typeof wanted === "string" ? wanted : undefined
  const here = slug
    ? `/basket/fitting-room?costume=${encodeURIComponent(slug)}`
    : "/basket/fitting-room"
  const user = await getUser()
  if (!user) {
    return redirect({
      href: withNext("/sign-in", here),
      locale: await getLocale(),
    })
  }

  const t = await getTranslations("FittingRoom")
  const costume = slug ? getCostume(slug) : undefined
  const guide = costume ? makeupGuides[costume.slug] : undefined
  const selected: FittingCostume | null =
    costume && guide && costume.images[0]
      ? {
          ...toSummary(costume),
          guide: {
            look: guide.look,
            steps: guide.steps.map(({ title, howTo, products }) => ({
              title,
              howTo,
              products,
            })),
            finish: guide.finish,
          },
        }
      : null

  let room: { face: string | null; body: string | null } = {
    face: null,
    body: null,
  }
  let tryOn: TryOnView | null = null
  try {
    const store = fittingRoomStore()
    const [kept, tryOns] = await Promise.all([
      store.room(user.uid),
      store.tryOns(user.uid),
    ])
    room = { face: kept.face?.id ?? null, body: kept.body?.id ?? null }
    const latest =
      selected && tryOns.find((each) => each.slug === selected.slug)
    tryOn = latest ? toView(latest) : null
  } catch (error) {
    // The page still offers the photos; starting says if it can't.
    console.error("Could not read the Fitting Room.", error)
  }

  const costumes = getCostumes()
    .filter((each) => makeupGuides[each.slug] && each.images[0])
    .map(toSummary)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <h1 className="font-heading text-display font-semibold text-balance">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-[60ch] text-lead text-muted-foreground">
        {t("lead")}
      </p>
      <FittingRoom
        costumes={costumes}
        selected={selected}
        room={room}
        tryOn={tryOn}
        open={fittingRoom() !== null}
      />
    </div>
  )
}
