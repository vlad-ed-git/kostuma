import { useEffect } from "react"

import { beginNavigation } from "@/lib/navigation-status"

/**
 * Tells the cue mark a page is on its way while `pending` is true (a link's
 * pending state, or a transition's).
 */
export function useReportNavigation(pending: boolean) {
  useEffect(() => (pending ? beginNavigation() : undefined), [pending])
}
