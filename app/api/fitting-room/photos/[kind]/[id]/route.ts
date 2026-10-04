import { getUser } from "@/lib/auth/session"
import { fittingRoomStore } from "@/lib/fitting-room/store"

import { picture } from "../../../picture"

/** The platform's limit, explicit. */
export const maxDuration = 60

/** One of the visitor's photos, as prepared, to its owner only. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/fitting-room/photos/[kind]/[id]">
) {
  const user = await getUser()
  if (!user) return new Response(null, { status: 401 })
  const { kind, id } = await params
  if ((kind !== "face" && kind !== "body") || !/^[0-9a-f]{32}$/.test(id))
    return new Response(null, { status: 404 })
  return picture(() => fittingRoomStore().photo(user.uid, kind, id))
}
