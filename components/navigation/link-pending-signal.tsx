"use client"

import { useLinkStatus } from "next/link"

import { useReportNavigation } from "@/hooks/use-report-navigation"

/**
 * Rendered inside every app link (i18n/navigation.tsx): reports the link's
 * pending navigation to the cue mark. Renders nothing.
 */
export function LinkPendingSignal() {
  const { pending } = useLinkStatus()
  useReportNavigation(pending)
  return null
}
