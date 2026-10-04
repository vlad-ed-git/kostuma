import { after } from "next/server"

import { fittingRoom } from "@/lib/fitting-room/service"
import { drive } from "@/lib/fitting-room/steps"
import { readNotice } from "@/lib/fitting-room/webhook"

/** The platform's limit, explicit: the work stops well before it. */
export const maxDuration = 60

/** How long one notice may keep moving its try-on (busy waits included). */
const DRIVE_MS = 45_000

/**
 * YouCam's webhook (lib/fitting-room/webhook.ts): a render ended. Answers at
 * once, then moves its try-on along (lib/fitting-room/steps.ts `drive`):
 * keeps the picture and sends the next render, so a try-on goes on with its
 * page closed. A notice comes once per delivery, however often YouCam
 * retries; an unknown task (a try-on deleted, a task already collected) is
 * nothing to do.
 */
export async function POST(request: Request) {
  const secret = process.env.YOUCAM_WEBHOOK_SECRET
  if (!secret) return new Response(null, { status: 404 })
  const notice = readNotice(await request.text(), request.headers, secret)
  if (!notice) return new Response(null, { status: 401 })

  const deps = fittingRoom()
  if (!deps) return new Response(null, { status: 204 })
  try {
    if (!(await deps.store.firstDelivery(notice.delivery, Date.now())))
      return new Response(null, { status: 204 })
  } catch (error) {
    // YouCam retries what wasn't taken.
    console.error("A YouCam webhook could not be noted.", error)
    return new Response(null, { status: 503 })
  }

  const until = Date.now() + DRIVE_MS
  after(async () => {
    try {
      const step = await deps.store.taskStep(notice.task)
      if (!step) return
      await drive(deps, step.uid, step.id, { due: step.index, until })
    } catch (error) {
      console.error(`YouCam's notice of ${notice.task} went unhandled.`, error)
    }
  })
  return new Response(null, { status: 204 })
}
