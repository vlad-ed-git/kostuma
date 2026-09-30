import { createNavigation } from "next-intl/navigation"
import type { ComponentProps } from "react"

import { LinkPendingSignal } from "@/components/navigation/link-pending-signal"

import { routing } from "./routing"

const navigation = createNavigation(routing)

// Next.js' navigation APIs, aware of the locale prefix. Import these instead
// of the ones from `next/link` and `next/navigation`.
export const { redirect, usePathname, useRouter, getPathname } = navigation

/**
 * The app's link: next-intl's, which also reports its pending navigation to
 * the cue mark (components/horror/cue-mark.tsx) while the next page loads.
 */
export function Link({
  children,
  ...props
}: ComponentProps<typeof navigation.Link>) {
  return (
    <navigation.Link {...props}>
      {children}
      <LinkPendingSignal />
    </navigation.Link>
  )
}
