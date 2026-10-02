import { ViewTransition, type ReactNode } from "react"

/**
 * Wraps every page and, unlike a layout, mounts afresh on each navigation:
 * the reel change (spec §7.2). The old page fades to black and the new one
 * fades up (the `reel` animations in app/film.css) while scratches cross
 * the frame. Browsers without view transitions simply cut.
 *
 * Keep this a Server Component: Next 16.3 renders the chunk of a Client
 * Component imported here without the CSP nonce, which blocks hydration.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="reel" exit="reel" default="none">
      {children}
    </ViewTransition>
  )
}
