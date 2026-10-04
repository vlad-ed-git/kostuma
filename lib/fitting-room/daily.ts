import type { RenderProvider } from "./provider"
import type { FittingRoomStore } from "./try-on"

/**
 * The Fitting Room's daily check (app/api/cron/daily, Vercel Cron):
 * - YouCam's unit balance, kept on `config/fittingRoom`, closes the Fitting
 *   Room below its floor and reopens what Kostuma closed once units are
 *   back (budget.ts);
 * - a try-on still running a day after it started is ended, as Kostuma's
 *   failure ("failed": never counted against the visitor, its free costume
 *   given back), and its tasks deleted at YouCam;
 * - the notes of YouCam's tasks and webhooks older than two days go.
 * Each part runs on its own: one failing never stops the others, and the
 * next day tries again.
 */

const DAY = 24 * 60 * 60 * 1000

/** A try-on running this long is stuck: nothing will move it any more. */
export const STUCK_MS = DAY

/** Try-ons ended per check, at most: the rest the next day. */
const BATCH = 100

export type DailyReport = {
  /** YouCam's units left; null without a renderer to ask. */
  balance: number | null
  /** Whether the Fitting Room is open after the check; null if unknown. */
  open: boolean | null
  /** Stuck try-ons ended. */
  ended: number
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
  const report: DailyReport = {
    balance: null,
    open: null,
    ended: 0,
    failed: [],
  }

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

  try {
    for (const { uid, id } of await store.runningSince(now - STUCK_MS, BATCH)) {
      const tryOn = await store.tryOn(uid, id)
      if (!(await store.finish(uid, id, "failed", "failed"))) continue
      report.ended += 1
      for (const step of tryOn?.steps ?? []) {
        if (!step.task) continue
        await provider?.discard(step.task)
        await store.forgetTask(step.task)
      }
    }
  } catch (error) {
    console.error("The daily check could not end the stuck try-ons.", error)
    report.failed.push("stuck")
  }

  try {
    await store.sweep(now - 2 * DAY)
  } catch (error) {
    console.error("The daily check could not sweep old notes.", error)
    report.failed.push("sweep")
  }

  return report
}
