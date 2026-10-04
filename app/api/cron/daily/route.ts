import { fromCron } from "@/lib/cron"
import { dailyCheck } from "@/lib/fitting-room/daily"
// By their @/ names: the e2e build swaps these for its stand-ins.
import { renderProvider } from "@/lib/fitting-room/renderer"
import { fittingRoomStore } from "@/lib/fitting-room/store"

/** The platform's limit, explicit: the work stops well before it. */
export const maxDuration = 60

/**
 * The daily check (lib/fitting-room/daily.ts), run by Vercel Cron
 * (vercel.json) with CRON_SECRET. Anyone else: 401.
 */
export async function GET(request: Request) {
  if (!fromCron(request))
    return Response.json(null, { status: 401, headers: noStore })
  const report = await dailyCheck({
    store: fittingRoomStore(),
    provider: renderProvider(),
  })
  return Response.json(report, { headers: noStore })
}

const noStore = { "Cache-Control": "private, no-store" }
