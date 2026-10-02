import { getUser } from "@/lib/auth/session"
import { fittingRoomStore } from "@/lib/fitting-room/store"

import { picture } from "../../../picture"

/** A try-on step's picture, to its owner only. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/fitting-room/try-ons/[id]/[step]">
) {
  const user = await getUser()
  if (!user) return new Response(null, { status: 401 })
  const { id, step } = await params
  const index = Number(step)
  if (!/^[0-9a-f]{32}$/.test(id) || !/^\d{1,2}$/.test(step))
    return new Response(null, { status: 404 })
  return picture(() => fittingRoomStore().stepImage(user.uid, id, index))
}
