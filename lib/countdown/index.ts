/**
 * The countdown to Halloween (spec §11.1). Halloween is October 31 in the
 * visitor's own time zone: the count reaches zero at their local midnight,
 * the whole day is "Tonight", and from November 1 it counts to next year.
 *
 * The count is real time left, second by second: across a daylight-saving
 * change it never jumps, so at midnight of October 1 in Berlin (clocks go
 * back on October 25) it reads 30 days and 1 hour, which is true.
 */

export type Countdown =
  | {
      kind: "counting"
      /** The Halloween being counted to. */
      year: number
      days: number
      hours: number
      minutes: number
      seconds: number
    }
  | { kind: "tonight"; year: number }

const OCTOBER = 9

export function countdownTo(now: Date): Countdown {
  const year = now.getFullYear()
  const month = now.getMonth()
  if (month === OCTOBER && now.getDate() === 31)
    return { kind: "tonight", year }

  // November and December count to next year's Halloween.
  const target = new Date(month > OCTOBER ? year + 1 : year, OCTOBER, 31)
  // Rounded up, so the last second still reads "1" and zero is midnight.
  const left = Math.ceil((target.getTime() - now.getTime()) / 1000)
  return {
    kind: "counting",
    year: target.getFullYear(),
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
