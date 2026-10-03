import { tryOnGarment } from "@/lib/catalog"
import type { Costume } from "@/lib/catalog/types"

import type { Room, TryOn } from "./try-on"

/**
 * The try-on the page shows for a costume: the one made with the photos the
 * account uses now (`room`), if it was made; else the newest. `tryOns` come
 * newest first. Only those of the renderer in use count (a test build's
 * fake never stands in for a real one), and only those made with the
 * costume's outfit picture as it is now: one made before it was replaced
 * (its `garment` given, or the first photo before garments existed) is out
 * of date, and the visitor tries the costume on afresh.
 *
 * Going back to earlier photos (the same file chosen again) gives their
 * try-on again, made long before: the newest would be the one made with the
 * photos given up. A costume that is all makeup has no body photo and no
 * outfit picture.
 */
export function currentTryOn(
  tryOns: readonly TryOn[],
  {
    costume,
    renderer,
    room,
    allMakeup,
  }: {
    costume: Pick<Costume, "slug" | "garment" | "images">
    renderer: TryOn["renderer"] | undefined
    room: Room
    allMakeup: boolean
  }
): TryOn | null {
  const garment = allMakeup ? null : (tryOnGarment(costume)?.url ?? null)
  const madeWith = (each: TryOn) =>
    each.garment !== undefined
      ? each.garment
      : each.body === null
        ? null
        : (costume.images[0]?.url ?? null)
  const mine = tryOns.filter(
    (each) =>
      each.slug === costume.slug &&
      each.renderer === renderer &&
      madeWith(each) === garment
  )
  const now = mine.find(
    (each) =>
      each.face === room.face?.id && (allMakeup || each.body === room.body?.id)
  )
  return now ?? mine[0] ?? null
}
