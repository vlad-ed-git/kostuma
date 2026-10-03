import type { Room, TryOn } from "./try-on"

/**
 * The try-on the page shows for a costume: the one made with the photos the
 * account uses now (`room`), if it was made; else the newest. `tryOns` come
 * newest first. Only those of the renderer in use count: a test build's
 * fake never stands in for a real one.
 *
 * Going back to earlier photos (the same file chosen again) gives their
 * try-on again, made long before: the newest would be the one made with the
 * photos given up. A costume that is all makeup has no body photo.
 */
export function currentTryOn(
  tryOns: readonly TryOn[],
  {
    slug,
    renderer,
    room,
    allMakeup,
  }: {
    slug: string
    renderer: TryOn["renderer"] | undefined
    room: Room
    allMakeup: boolean
  }
): TryOn | null {
  const mine = tryOns.filter(
    (each) => each.slug === slug && each.renderer === renderer
  )
  const now = mine.find(
    (each) =>
      each.face === room.face?.id && (allMakeup || each.body === room.body?.id)
  )
  return now ?? mine[0] ?? null
}
