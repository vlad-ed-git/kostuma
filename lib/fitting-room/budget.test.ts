import { describe, expect, it } from "vitest"

import { makeupGuides } from "@/content/makeup"

import {
  admits,
  afterBalance,
  controlsOf,
  dayOf,
  DEFAULT_CONTROLS,
  unitsOf,
  unitsOfGuide,
  unitsOfPlan,
  unspentUnits,
} from "./budget"
import { renderPlan } from "./render-plan"
import type { StoredStep } from "./try-on"

const face = { id: "f", width: 768, height: 1024, skin: "#C69C82" as const }

describe("controlsOf", () => {
  it("takes the defaults until the owner sets the controls", () => {
    expect(controlsOf(undefined)).toEqual(DEFAULT_CONTROLS)
    expect(controlsOf({})).toEqual(DEFAULT_CONTROLS)
  })

  it("keeps what the owner set, and ignores anything malformed", () => {
    expect(
      controlsOf({ open: false, dailyUnits: 60, floor: 10, closedFor: "key" })
    ).toMatchObject({
      open: false,
      dailyUnits: 60,
      floor: 10,
      closedFor: "key",
    })
    expect(
      controlsOf({
        open: "no",
        dailyUnits: -5,
        floor: "ten",
        closedFor: "owner",
        balance: Number.NaN,
      })
    ).toEqual(DEFAULT_CONTROLS)
  })
})

describe("the units of a try-on", () => {
  it("costs 2 per outfit and 1 per makeup or hair step", () => {
    expect(unitsOf({ tool: "clothes" })).toBe(2)
    expect(unitsOf({ tool: "makeup" })).toBe(1)
    expect(unitsOf({ tool: "hair" })).toBe(1)
  })

  it("knows every guide's price before there is a face photo", () => {
    for (const [slug, guide] of Object.entries(makeupGuides)) {
      expect(unitsOfGuide(guide), slug).toBe(
        unitsOfPlan(renderPlan(slug, guide, face))
      )
    }
  })

  it("gives back what was never rendered, up to what was reserved", () => {
    const step = (tool: "clothes" | "makeup", status: StoredStep["status"]) =>
      ({ render: { tool }, status }) as StoredStep
    const steps = [
      step("clothes", "done"),
      step("clothes", "failed"),
      step("makeup", "done"),
      step("makeup", "waiting"),
    ]
    expect(unspentUnits({ steps, reserved: { day: "d", units: 6 } })).toBe(3)
    expect(unspentUnits({ steps, reserved: { day: "d", units: 2 } })).toBe(2)
    expect(unspentUnits({ steps })).toBe(0)
  })
})

describe("the day's budget", () => {
  it("counts days in UTC", () => {
    expect(dayOf(Date.UTC(2026, 9, 31, 23, 59))).toBe("2026-10-31")
    expect(dayOf(Date.UTC(2026, 10, 1, 0, 0))).toBe("2026-11-01")
  })

  it("admits a try-on while it fits, and nothing while closed", () => {
    expect(admits({ open: true, dailyUnits: 20 }, 10, 10)).toBe(true)
    expect(admits({ open: true, dailyUnits: 20 }, 11, 10)).toBe(false)
    expect(admits({ open: false, dailyUnits: 20 }, 0, 10)).toBe(false)
  })
})

describe("afterBalance", () => {
  const controls = { open: true, floor: 40, closedFor: null }

  it("closes the Fitting Room below the floor", () => {
    expect(afterBalance(controls, 39.5)).toEqual({
      open: false,
      closedFor: "units",
    })
    expect(afterBalance(controls, 40)).toBeNull()
  })

  it("reopens what Kostuma closed once units are back, never what the owner closed", () => {
    expect(
      afterBalance({ ...controls, open: false, closedFor: "units" }, 300)
    ).toEqual({ open: true, closedFor: null })
    expect(
      afterBalance({ ...controls, open: false, closedFor: "key" }, 300)
    ).toEqual({ open: true, closedFor: null })
    expect(afterBalance({ ...controls, open: false }, 300)).toBeNull()
    expect(afterBalance({ ...controls, open: false }, 10)).toBeNull()
  })

  it("forgets why Kostuma had closed it once the owner reopened it", () => {
    expect(afterBalance({ ...controls, closedFor: "units" }, 300)).toEqual({
      open: true,
      closedFor: null,
    })
  })
})
