import { getPictureViewer } from "@/lib/auth/session"
import { pictureAt, pictureName } from "@/lib/fitting-room/frames"
import { fittingRoomStore } from "@/lib/fitting-room/store"
import { toView } from "@/lib/fitting-room/try-on"

import { picture } from "../../../picture"

/** The platform's limit, explicit. */
export const maxDuration = 60

/**
 * A try-on step's picture, to its owner only; with `?download=1`, the same
 * JPEG as a file named after the costume and the step (todo OPP-11).
 */
export async function GET(
  request: Request,
  { params }: RouteContext<"/api/fitting-room/try-ons/[id]/[step]">
) {
  // The cookie's signature and expiry only: no round trip to Firebase per
  // picture (pages still check revocation).
  const user = await getPictureViewer()
  if (!user) return new Response(null, { status: 401 })
  const { id, step } = await params
  const index = Number(step)
  if (!/^[0-9a-f]{32}$/.test(id) || !/^\d{1,2}$/.test(step))
    return new Response(null, { status: 404 })
  const store = fittingRoomStore()
  const image = () => store.stepImage(user.uid, id, index)
  if (new URL(request.url).searchParams.get("download") !== "1")
    return picture(image)
  return picture(image, async () => {
    const tryOn = await store.tryOn(user.uid, id)
    return tryOn && pictureName(tryOn.slug, pictureAt(toView(tryOn), index))
  })
}
