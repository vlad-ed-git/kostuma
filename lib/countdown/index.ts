/**
 * The countdown (spec §11.1), in the visitor's own time zone: to Halloween,
 * October 31, whose whole day is "Tonight"; then, the darkest night past,
 * to Christmas (owner, 2026-10-04: you stay a monster until Santa comes),
 * reached at the local midnight that starts December 25; from then on, to
 * the next Halloween.
 *
 * The count is real time left, second by second: across a daylight-saving
 * change it never jumps, so at midnight of October 1 in Berlin (clocks go
 * back on October 25) it reads 30 days and 1 hour, which is true.
 */

export type Holiday = "halloween" | "christmas"

/** What the countdown counts to: a holiday, and the year it falls in. */
export type Season = { holiday: Holiday; year: number }

export type Countdown =
  | (Season & {
      kind: "counting"
      days: number
      hours: number
      minutes: number
      seconds: number
    })
  | { kind: "tonight"; holiday: "halloween"; year: number }

const OCTOBER = 9
const NOVEMBER = 10
const DECEMBER = 11

/** Each holiday's day: its month (0–11) and date. */
export const holidayDay: Record<Holiday, [month: number, date: number]> = {
  halloween: [OCTOBER, 31],
  christmas: [DECEMBER, 25],
}

/**
 * The season on a local calendar day (`month` 0–11): Christmas from
 * November 1 to December 24, else Halloween, next year's from December 25.
 */
export function seasonOn(year: number, month: number, date: number): Season {
  if (month === NOVEMBER || (month === DECEMBER && date < 25))
    return { holiday: "christmas", year }
  return { holiday: "halloween", year: month === DECEMBER ? year + 1 : year }
}

/**
 * The season on the day it is in `timeZone` (a visitor's, as their
 * connection tells it), else in the server's own: the server's guess,
 * which the browser corrects.
 */
export function seasonIn(now: Date, timeZone?: string | null): Season {
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone ?? undefined,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(now)
  } catch {
    // A zone this runtime doesn't know: the server's own.
    return seasonOn(now.getFullYear(), now.getMonth(), now.getDate())
  }
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((each) => each.type === type)?.value)
  return seasonOn(part("year"), part("month") - 1, part("day"))
}

export function countdownTo(now: Date): Countdown {
  const year = now.getFullYear()
  const month = now.getMonth()
  const date = now.getDate()
  if (month === OCTOBER && date === 31)
    return { kind: "tonight", holiday: "halloween", year }

  const season = seasonOn(year, month, date)
  const [targetMonth, targetDate] = holidayDay[season.holiday]
  const target = new Date(season.year, targetMonth, targetDate)
  // Rounded up, so the last second still reads "1" and zero is midnight.
  const left = Math.ceil((target.getTime() - now.getTime()) / 1000)
  return {
    kind: "counting",
    ...season,
    days: Math.floor(left / 86_400),
    hours: Math.floor((left % 86_400) / 3_600),
    minutes: Math.floor((left % 3_600) / 60),
    seconds: left % 60,
  }
}

/** Two digits at least, as on a film leader: 7 → "07", 120 → "120". */
export function pad(value: number) {
  return String(value).padStart(2, "0")
}
