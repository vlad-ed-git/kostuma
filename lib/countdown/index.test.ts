// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"

import { countdownTo, pad } from "./index"

// Node reads TZ afresh whenever it changes, so each test can live in its
// own time zone.
const originalTz = process.env.TZ
afterEach(() => {
  process.env.TZ = originalTz
})

/** A local wall-clock moment in `zone`, as the visitor's device sees it. */
function at(
  zone: string,
  ...parts: [number, number, number, number?, number?, number?]
) {
  process.env.TZ = zone
  const [year, month, day, hours = 0, minutes = 0, seconds = 0] = parts
  return new Date(year, month - 1, day, hours, minutes, seconds)
}

describe("the countdown to Halloween", () => {
  it("counts days, hours, minutes and seconds to local midnight", () => {
    expect(countdownTo(at("UTC", 2026, 10, 1, 13, 45, 30))).toEqual({
      kind: "counting",
      year: 2026,
      days: 29,
      hours: 10,
      minutes: 14,
      seconds: 30,
    })
  })

  it("reads one second, not zero, in the last second", () => {
    const almost = new Date(at("UTC", 2026, 10, 31).getTime() - 300)
    expect(countdownTo(almost)).toMatchObject({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    })
  })

  it("is tonight for the whole of October 31, from midnight", () => {
    expect(countdownTo(at("UTC", 2026, 10, 31))).toEqual({
      kind: "tonight",
      year: 2026,
    })
    expect(countdownTo(at("UTC", 2026, 10, 31, 23, 59, 59))).toEqual({
      kind: "tonight",
      year: 2026,
    })
  })

  it("counts to next year from November 1", () => {
    expect(countdownTo(at("UTC", 2026, 11, 1))).toMatchObject({
      kind: "counting",
      year: 2027,
      days: 364,
      hours: 0,
    })
    expect(countdownTo(at("UTC", 2026, 12, 31, 23, 59, 59))).toMatchObject({
      year: 2027,
      days: 303,
    })
  })

  it("counts to this year's Halloween from January 1", () => {
    expect(countdownTo(at("UTC", 2027, 1, 1))).toMatchObject({
      year: 2027,
      days: 303,
    })
  })

  it("follows the visitor's time zone, east and west of UTC", () => {
    // The same instant: already Halloween in Tokyo, not yet in New York.
    const instant = Date.UTC(2026, 9, 30, 16, 30)
    process.env.TZ = "Asia/Tokyo"
    expect(countdownTo(new Date(instant))).toEqual({
      kind: "tonight",
      year: 2026,
    })
    process.env.TZ = "America/New_York"
    expect(countdownTo(new Date(instant))).toMatchObject({
      kind: "counting",
      days: 0,
      hours: 11,
      minutes: 30,
    })
  })

  it("counts real time across a daylight-saving change: no jump", () => {
    // Berlin turns its clocks back on October 25, 2026: one day has 25 hours.
    const midnight = at("Europe/Berlin", 2026, 10, 1)
    expect(countdownTo(midnight)).toMatchObject({ days: 30, hours: 1 })
    // Every real second takes exactly one second off, through the change.
    const before = at("Europe/Berlin", 2026, 10, 25, 2, 59, 59)
    const after = new Date(before.getTime() + 1000)
    const seconds = (c: ReturnType<typeof countdownTo>) =>
      c.kind === "counting"
        ? c.days * 86_400 + c.hours * 3_600 + c.minutes * 60 + c.seconds
        : 0
    expect(seconds(countdownTo(before)) - seconds(countdownTo(after))).toBe(1)
  })

  it("handles a leap year's extra day", () => {
    // 2028 is a leap year: November 1, 2027 → October 31, 2028 is 366 days.
    expect(countdownTo(at("UTC", 2027, 11, 1))).toMatchObject({
      year: 2028,
      days: 365,
      hours: 0,
    })
  })
})

describe("pad", () => {
  it("keeps two digits at least", () => {
    expect([0, 7, 10, 120].map(pad)).toEqual(["00", "07", "10", "120"])
  })
})
