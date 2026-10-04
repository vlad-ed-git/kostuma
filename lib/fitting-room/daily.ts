import type { RenderProvider } from "./provider"
import type { FittingRoomStore } from "./try-on"

/**
 * The Fitting Room's daily check (app/api/cron/daily, Vercel Cron): YouCam's
 * unit balance, kept on `config/fittingRoom`, closes the Fitting Room below
 * its floor and reopens what Kostuma closed once units are back (budget.ts).
 * Each part runs on its own: one failing never stops the others, and the
 * next day tries again.
 */

export type DailyReport = {
  /** YouCam's units left; null without a renderer to ask. */
  balance: number | null
  /** Whether the Fitting Room is open after the check; null if unknown. */
  open: boolean | null
  /** The parts that failed (the server's log says why). */
  failed: string[]
}

export async function dailyCheck(
  {
    store,
    provider,
  }: { store: FittingRoomStore; provider: RenderProvider | null },
  now = Date.now()
): Promise<DailyReport> {
  const report: DailyReport = { balance: null, open: null, failed: [] }

  try {
    const balance = provider ? await provider.balance() : null
    if (balance !== null) {
      report.balance = balance
      report.open = (await store.recordBalance(balance, now)).open
    }
  } catch (error) {
    console.error("The daily check could not read YouCam's units.", error)
    report.failed.push("balance")
  }

  return report
}
