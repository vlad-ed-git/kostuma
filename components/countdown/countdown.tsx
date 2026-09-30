"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { countdownTo, pad, type Countdown as Count } from "@/lib/countdown"
import { cn } from "@/lib/utils"

/**
 * The countdown to Halloween in the title card (spec §11.1): four big
 * numerals, the seconds in blood red, beating once a second like a heart.
 *
 * The server can't know the visitor's time zone, so it renders dashes at
 * the final size; the browser fills in the count once it runs (no layout
 * shift, no mismatch). `year` is the server's guess of the Halloween to
 * come, for the date line until then.
 */
export function Countdown({
  year,
  className,
}: {
  year: number
  className?: string
}) {
  const t = useTranslations("Countdown")
  const format = useFormatter()
  const [count, setCount] = useState<Count | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const now = new Date()
      setCount(countdownTo(now))
      // On the next whole second, so the digits turn with the clock.
      timer = setTimeout(tick, 1000 - now.getMilliseconds())
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  const date = format.dateTime(
    new Date(Date.UTC(count?.year ?? year, 9, 31, 12)),
    { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }
  )

  // The same three rows as the count, so nothing moves at midnight.
  if (count?.kind === "tonight") {
    return (
      <div className={className}>
        <p className="font-mono text-label text-ember uppercase">{date}</p>
        <p className="mt-3 font-heading text-numeral text-ember uppercase">
          {t("tonight")}
        </p>
        <p className="mt-2 font-mono text-micro text-muted-foreground uppercase">
          {t("tonightLine")}
        </p>
      </div>
    )
  }

  const cells = [
    { unit: t("days"), value: count?.days },
    { unit: t("hours"), value: count?.hours },
    { unit: t("minutes"), value: count?.minutes },
    { unit: t("seconds"), value: count?.seconds, beat: true },
  ]

  return (
    <div className={className}>
      <p className="font-mono text-label text-ember uppercase">
        {t("until", { date })}
      </p>
      <div role="timer" aria-label={t("label")} className="mt-3">
        {count && (
          // Changes once a minute; a timer is never announced on its own.
          <p className="sr-only">
            {t("left", {
              days: count.days,
              hours: count.hours,
              minutes: count.minutes,
            })}
          </p>
        )}
        {/* Four equal columns, numbers and units on one left edge. */}
        <ol
          aria-hidden="true"
          className="grid w-fit grid-cols-4 gap-x-6 sm:gap-x-10"
        >
          {cells.map(({ unit, value, beat }) => (
            <li key={unit} className="flex flex-col items-start">
              <span
                className={cn(
                  "font-heading text-numeral tabular-nums",
                  beat && "text-blood-text"
                )}
              >
                {value === undefined ? (
                  "--"
                ) : beat ? (
                  // A new element each second, so the beat restarts on
                  // every tick: a heart counting down.
                  <span key={value} className="heartbeat inline-block">
                    {pad(value)}
                  </span>
                ) : (
                  pad(value)
                )}
              </span>
              <span className="mt-2 font-mono text-micro text-muted-foreground uppercase">
                {unit}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
