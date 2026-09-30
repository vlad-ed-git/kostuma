"use client"

import { useState, type ComponentProps } from "react"

import { Link } from "@/i18n/navigation"

/**
 * The app's link for long lists (the 100 costume rows): it prefetches its
 * page only once someone shows intent to follow it, by hovering, focusing or
 * touching it, not whenever it scrolls into view. Every page is rendered per
 * request (the CSP nonce), so prefetching each row that scrolls past cost
 * about 150 server renders per visit to the home page (measured).
 * The pattern from Next.js' guide (docs/app/guides/prefetching).
 */
export function IntentLink({
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [intent, setIntent] = useState(false)

  return (
    <Link
      {...props}
      // `null` is Next.js' default prefetching; `false` is none at all.
      prefetch={intent ? null : false}
      onMouseEnter={(event) => {
        setIntent(true)
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        setIntent(true)
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        setIntent(true)
        onTouchStart?.(event)
      }}
    />
  )
}
