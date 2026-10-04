import type { MakeupGuide } from "@/lib/makeup"

import { planTools, type Render } from "./render-plan"
import type { TryOn } from "./try-on"

/**
 * What the Fitting Room may spend (owner, 2026-10-04: todo ENG-02). YouCam
 * charges units per picture; the owner steers the spending without a
 * deploy, through one Firestore document, `config/fittingRoom`, read at
 * every start:
 * - `open`: false closes the Fitting Room (the existing "closed" message);
 * - `dailyUnits`: what the try-ons started on one day (UTC) may reserve;
 * - `floor`: below this many units left at YouCam (the daily check), the
 *   Fitting Room closes itself.
 * Kostuma closes it too, at once, when YouCam says the units ran out or the
 * key is refused (`closedFor`), and the daily check opens it again once the
 * balance is back above the floor. The owner's own `open: false` stays.
 * Every try-on reserves its units in the transaction that starts it, and
 * gives back what was never rendered when it ends.
 */

export type Controls = {
  open: boolean
  dailyUnits: number
  floor: number
  /** Why Kostuma closed it (not the owner): the daily check may reopen it. */
  closedFor: ClosedFor | null
  /** YouCam's balance at the last daily check, and when. */
  balance: number | null
  balanceAt: number | null
}

/** YouCam's units ran out, or its key was refused. */
export type ClosedFor = "units" | "key"

/** Until the owner says otherwise: about ten try-ons a day. */
export const DEFAULT_CONTROLS: Controls = {
  open: true,
  dailyUnits: 120,
  floor: 40,
  closedFor: null,
  balance: null,
  balanceAt: null,
}

const amount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null

/** The stored controls, any field missing or malformed taking its default. */
export function controlsOf(data: unknown): Controls {
  const fields =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : {}
  return {
    open:
      typeof fields.open === "boolean" ? fields.open : DEFAULT_CONTROLS.open,
    dailyUnits: amount(fields.dailyUnits) ?? DEFAULT_CONTROLS.dailyUnits,
    floor: amount(fields.floor) ?? DEFAULT_CONTROLS.floor,
    closedFor:
      fields.closedFor === "units" || fields.closedFor === "key"
        ? fields.closedFor
        : null,
    balance: amount(fields.balance),
    balanceAt: amount(fields.balanceAt),
  }
}

/** YouCam's price of one render, in units (docs, 2026-10-04). */
export function unitsOf(render: Pick<Render, "tool">): number {
  return render.tool === "clothes" ? 2 : 1
}

/** A try-on's price: every render of its plan. */
export const unitsOfPlan = (renders: readonly Pick<Render, "tool">[]) =>
  renders.reduce((sum, render) => sum + unitsOf(render), 0)

/** The price of a try-on of this guide, before there is a face photo. */
export const unitsOfGuide = (guide: MakeupGuide) =>
  unitsOfPlan(planTools(guide).map((tool) => ({ tool })))

/**
 * The units a try-on reserved for renders it never made, up to what it
 * reserved: given back to its day's budget when it ends.
 */
export function unspentUnits(tryOn: Pick<TryOn, "steps" | "reserved">) {
  if (!tryOn.reserved) return 0
  const unspent = tryOn.steps
    .filter((step) => step.status !== "done")
    .reduce((sum, step) => sum + unitsOf(step.render), 0)
  return Math.min(unspent, tryOn.reserved.units)
}

/** The budget's day: the UTC date, "YYYY-MM-DD". */
export const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** Whether `units` more fit today's budget, and the Fitting Room is open. */
export function admits(
  controls: Pick<Controls, "open" | "dailyUnits">,
  reserved: number,
  units: number
) {
  return controls.open && reserved + units <= controls.dailyUnits
}

/**
 * What the daily check does with YouCam's balance: closes below the floor,
 * reopens what Kostuma closed once the balance is back above it, and
 * forgets why Kostuma had closed it once the owner reopened it. Null: no
 * change.
 */
export function afterBalance(
  controls: Pick<Controls, "open" | "floor" | "closedFor">,
  balance: number
): Pick<Controls, "open" | "closedFor"> | null {
  if (balance < controls.floor)
    return controls.open ? { open: false, closedFor: "units" } : null
  if (controls.closedFor) return { open: true, closedFor: null }
  return null
}
