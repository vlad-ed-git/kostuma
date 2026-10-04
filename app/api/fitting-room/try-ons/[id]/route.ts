import { getUser } from "@/lib/auth/session"
import { fittingRoom } from "@/lib/fitting-room/service"
import { advance } from "@/lib/fitting-room/steps"
import { toView } from "@/lib/fitting-room/try-on"
import { fittingRoomStore } from "@/lib/fitting-room/store"

/** The platform's limit, explicit: a render's start gives up at 40 s. */
export const maxDuration = 60

/**
 * A try-on, as it stands, to its owner only: nobody else learns whether it
 * exists. GET only reads it. POST also moves it along (lib/fitting-room/
 * steps.ts): the Fitting Room asks every couple of seconds while it
 * renders, which is all that moves it where YouCam's webhook can't reach
 * (localhost); YouCam itself is asked at most every few seconds.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/fitting-room/try-ons/[id]">
) {
  return answer((await params).id, false)
}

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/fitting-room/try-ons/[id]">
) {
  return answer((await params).id, true)
}

async function answer(id: string, move: boolean) {
  const user = await getUser()
  if (!user) return Response.json(null, { status: 401, headers: noStore })
  if (!/^[0-9a-f]{32}$/.test(id))
    return Response.json(null, { status: 404, headers: noStore })

  try {
    const deps = move ? fittingRoom() : null
    // Closed, or only read: what was rendered so far, nothing moves.
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
