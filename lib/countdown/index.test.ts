// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"

import { countdownTo, pad, seasonIn, seasonOn } from "./index"

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

describe("the countdown", () => {
  it("counts days, hours, minutes and seconds to local midnight", () => {
    expect(countdownTo(at("UTC", 2026, 10, 1, 13, 45, 30))).toEqual({
      kind: "counting",
      holiday: "halloween",
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
      holiday: "halloween",
      year: 2026,
    })
    expect(countdownTo(at("UTC", 2026, 10, 31, 23, 59, 59))).toEqual({
      kind: "tonight",
      holiday: "halloween",
      year: 2026,
    })
  })

  it("counts to Christmas from November 1, once Halloween's night has passed", () => {
    expect(countdownTo(at("UTC", 2026, 11, 1))).toEqual({
      kind: "counting",
      holiday: "christmas",
      year: 2026,
      days: 54,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
    expect(countdownTo(at("UTC", 2026, 12, 24, 23, 59, 59))).toMatchObject({
      holiday: "christmas",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    })
  })

  it("counts to next year's Halloween from Christmas, the stroke of midnight", () => {
    expect(countdownTo(at("UTC", 2026, 12, 25))).toMatchObject({
      kind: "counting",
      holiday: "halloween",
      year: 2027,
      days: 310,
      hours: 0,
    })
    expect(countdownTo(at("UTC", 2026, 12, 31, 23, 59, 59))).toMatchObject({
      holiday: "halloween",
      year: 2027,
      days: 303,
    })
  })

  it("counts to this year's Halloween from January 1", () => {
    expect(countdownTo(at("UTC", 2027, 1, 1))).toMatchObject({
      holiday: "halloween",
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
      holiday: "halloween",
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
    // 2028 is a leap year: December 25, 2027 → October 31, 2028 is 311 days.
    expect(countdownTo(at("UTC", 2027, 12, 25))).toMatchObject({
      holiday: "halloween",
      year: 2028,
      days: 311,
      hours: 0,
    })
  })
})

describe("the season", () => {
  it("is Halloween until its night, then Christmas until December 25", () => {
    expect(seasonOn(2026, 9, 30)).toEqual({ holiday: "halloween", year: 2026 })
    expect(seasonOn(2026, 9, 31)).toEqual({ holiday: "halloween", year: 2026 })
    expect(seasonOn(2026, 10, 1)).toEqual({ holiday: "christmas", year: 2026 })
    expect(seasonOn(2026, 11, 24)).toEqual({ holiday: "christmas", year: 2026 })
    expect(seasonOn(2026, 11, 25)).toEqual({ holiday: "halloween", year: 2027 })
    expect(seasonOn(2027, 0, 1)).toEqual({ holiday: "halloween", year: 2027 })
  })

  it("is guessed on the day it is in the visitor's time zone", () => {
    // October 31, 16:30 in London: already November in Tokyo.
    const instant = new Date(Date.UTC(2026, 9, 31, 16, 30))
    expect(seasonIn(instant, "Asia/Tokyo")).toEqual({
      holiday: "christmas",
      year: 2026,
    })
    expect(seasonIn(instant, "America/New_York")).toEqual({
      holiday: "halloween",
      year: 2026,
    })
  })

  it("falls back on the server's own zone without one, or with one unknown", () => {
    process.env.TZ = "UTC"
    const instant = new Date(Date.UTC(2026, 11, 24, 23, 30))
    for (const zone of [undefined, null, "Mars/Olympus_Mons"])
      expect(seasonIn(instant, zone)).toEqual({
        holiday: "christmas",
        year: 2026,
      })
  })
})

describe("pad", () => {
  it("keeps two digits at least", () => {
    expect([0, 7, 10, 120].map(pad)).toEqual(["00", "07", "10", "120"])
  })
})
