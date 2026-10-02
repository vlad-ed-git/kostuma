import { getUser } from "@/lib/auth/session"
import { fittingRoom } from "@/lib/fitting-room/service"
import { advance } from "@/lib/fitting-room/steps"
import { toView } from "@/lib/fitting-room/try-on"
import { fittingRoomStore } from "@/lib/fitting-room/store"

/**
 * A try-on, as it stands: the Fitting Room asks every couple of seconds while
 * it renders, and each ask moves it along (lib/fitting-room/steps.ts). Only
 * its owner may ask; nobody else learns whether it exists.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/fitting-room/try-ons/[id]">
) {
  const user = await getUser()
  if (!user) return Response.json(null, { status: 401, headers: noStore })
  const { id } = await params
  if (!/^[0-9a-f]{32}$/.test(id))
    return Response.json(null, { status: 404, headers: noStore })

  try {
    const deps = fittingRoom()
    // Closed: what was rendered so far, nothing moves.
    const tryOn = deps
      ? await advance(deps, user.uid, id)
      : await fittingRoomStore().tryOn(user.uid, id)
    if (!tryOn) return Response.json(null, { status: 404, headers: noStore })
    return Response.json(toView(tryOn), { headers: noStore })
  } catch (error) {
    console.error("A try-on could not be moved along.", error)
    return Response.json(null, { status: 503, headers: noStore })
  }
}

const noStore = { "Cache-Control": "private, no-store" }
