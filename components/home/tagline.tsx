"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { countdownTo, type Holiday } from "@/lib/countdown"

/**
 * The title card's tagline (spec §11.1): "The darkest day is coming." and
 * "Transform into a monster." until Halloween; then, its night past (owner,
 * 2026-10-04), "The darkest night has passed." and "But you shall stay a
 * monster until Santa comes. Hahaha." until Christmas, as the countdown
 * turns (lib/countdown). The server guesses the season from the
 * connection's time zone (`holiday`); the browser corrects it with its own
 * clock, and turns it at midnight.
 */
export function Tagline({ holiday: guess }: { holiday: Holiday }) {
  const t = useTranslations("App")
  const holiday = useHoliday(guess)
  const past = holiday === "christmas"

  return (
    <>
      <h1 className="flicker vhs-ghost-title max-w-[11ch] font-heading text-display-xl font-semibold text-balance [--title-glow:0_0_40px_rgb(0_0_0/0.8)]">
        {t(past ? "taglineAfterLead" : "taglineLead")}
      </h1>
      {/* Wide screens: wrapped before the window, never red over its glass. */}
      <p className="mt-5 font-heading text-[clamp(1.6rem,3vw,2.6rem)] leading-none font-medium text-balance text-blood-text [text-shadow:0_0_24px_color-mix(in_oklch,var(--blood)_45%,transparent)] lg:max-w-[11.5em]">
        {t(past ? "taglineAfterTail" : "taglineTail")}
      </p>
    </>
  )
}

/** The holiday counted to now, by this device's clock: again each midnight. */
function useHoliday(guess: Holiday) {
  const [holiday, setHoliday] = useState(guess)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const check = () => {
      const now = new Date()
      setHoliday(countdownTo(now).holiday)
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      )
      timer = setTimeout(check, midnight.getTime() - now.getTime())
    }
    check()
    return () => clearTimeout(timer)
  }, [])
  return holiday
}
