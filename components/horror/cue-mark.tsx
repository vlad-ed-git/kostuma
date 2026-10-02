"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState, useSyncExternalStore } from "react"

import {
  isNavigating,
  isNavigatingOnServer,
  subscribe,
} from "@/lib/navigation-status"

// Screen readers hear "Loading…" only when a page is genuinely slow, not on
// every quick navigation.
const ANNOUNCE_AFTER_MS = 1000

/**
 * The cue mark, the "cigarette burn" a projectionist watches for before a
 * reel change (spec §10.2): blinks in the top-right corner while the next
 * page loads. The CSS (app/film.css) waits 150 ms, so fast navigations
 * never show it.
 */
export function CueMark() {
  const t = useTranslations("CueMark")
  const navigating = useSyncExternalStore(
    subscribe,
    isNavigating,
    isNavigatingOnServer
  )
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!navigating) return
    const timer = setTimeout(() => setSlow(true), ANNOUNCE_AFTER_MS)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [navigating])

  return (
    <>
      <div
        aria-hidden="true"
        className="cue-mark"
        data-active={navigating || undefined}
      />
      <p role="status" className="sr-only">
        {navigating && slow ? t("loading") : null}
      </p>
    </>
  )
}
