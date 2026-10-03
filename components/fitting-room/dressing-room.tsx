import type { CSSProperties, ReactNode } from "react"

import { Fog } from "@/components/horror/fog"
import type { PhotoKind } from "@/lib/fitting-room/try-on"
import { cn } from "@/lib/utils"

/** How many bulbs ring a vanity: across the top, and down each side. */
const BULBS = { lg: { top: 6, side: 7 }, sm: { top: 4, side: 5 } } as const

/**
 * A mirror of the dressing room (spec §11.4b): the vanity, ringed with
 * bulbs (`bulbs`), or the full-length mirror (none). A dark frame lit red
 * from behind, a bone edge round the glass, fog rolling at its feet
 * (`fog`). The glass is `height` tall (any CSS length) and `ratio` wide
 * for each unit of height, smaller on a screen too narrow for it. Nothing
 * is drawn over the glass: what it holds shows as it is.
 */
export function Mirror({
  bulbs,
  ratio,
  height,
  off = false,
  error = false,
  fog = false,
  className,
  children,
}: {
  bulbs?: keyof typeof BULBS
  ratio: number
  height: string
  /** Lights out: the Fitting Room is closed. */
  off?: boolean
  /** Rimmed in the error color: what it holds can't be used. */
  error?: boolean
  fog?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn("relative isolate w-fit max-w-full", className)}>
      <div
        className="mirror"
        data-off={off || undefined}
        data-error={error || undefined}
        style={
          {
            "--ratio": ratio,
            "--glass-h": height,
            // The large vanity's band, wide enough for larger bulbs.
            "--band":
              bulbs === "lg" ? "clamp(1.25rem, 2.2vw, 1.75rem)" : undefined,
          } as CSSProperties
        }
      >
        {fog && !off && (
          <div aria-hidden="true" className="mirror-fog">
            <Fog />
          </div>
        )}
        {bulbs && <Bulbs {...BULBS[bulbs]} />}
        <div className="mirror-glass">{children}</div>
      </div>
    </div>
  )
}

/**
 * The bulbs round the top of a vanity and down both sides. The second
 * across the top and one on the right flicker; one on the left is dead.
 */
function Bulbs({ top, side }: { top: number; side: number }) {
  const bulbs = [
    ...Array.from({ length: top }, (_, i) => ({ x: i / (top - 1), y: 0 })),
    ...Array.from({ length: side }, (_, j) => ({ x: 0, y: (j + 1) / side })),
    ...Array.from({ length: side }, (_, j) => ({ x: 1, y: (j + 1) / side })),
  ]
  const flicker = new Map([
    [1, "6s"],
    [top + side + 2, "7.7s"],
  ])
  const dead = top + side - 2
  return (
    <span aria-hidden="true">
      {bulbs.map(({ x, y }, index) => (
        <span
          key={index}
          className="mirror-bulb"
          data-flicker={flicker.has(index) || undefined}
          data-dead={index === dead || undefined}
          style={
            {
              "--x": x,
              "--y": y,
              "--flicker": flicker.get(index),
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

/**
 * The shape a photo should have, waiting in an empty mirror: a head and
 * shoulders for the face, a figure standing with its arms a little away
 * for the whole body. Black, rimmed in red, breathing.
 */
export function FigureGuide({ kind }: { kind: PhotoKind }) {
  return (
    <span aria-hidden="true" className="step-silhouette" data-current>
      {kind === "face" ? (
        <svg
          viewBox="0 0 120 160"
          className="absolute inset-x-[12%] bottom-0 w-[76%]"
        >
          <ellipse cx="60" cy="64" rx="29" ry="37" />
          <path d="M50 96h20v18H50z" />
          <path d="M6 160c3-30 24-45 54-45s51 15 54 45z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 80 160"
          className="absolute inset-y-[7%] left-1/2 h-[86%] -translate-x-1/2"
        >
          <circle cx="40" cy="15" r="10" />
          <path d="M27 30q13-5 26 0l3 50h-6l-2 77h-7l-1-62-1 62h-7l-2-77h-6z" />
          <path d="M27 31 15 78l5 1 10-38z" />
          <path d="m53 31 12 47-5 1-10-38z" />
        </svg>
      )}
    </span>
  )
}

/**
 * The hook a costume hangs from: up from the frame, curled over the rail
 * (its curl centred on the rail's bar, `.rail`).
 */
export function HangerHook({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={cn("h-7 w-4", className)}
    >
      <path d="M8 28V16c0-4 5-4.5 5-9.5a5 5 0 1 0-10 0" />
    </svg>
  )
}

/** An empty coat hanger on the rail (the basket is empty). */
export function EmptyHanger({ delay }: { delay: string }) {
  return (
    <span
      className="hanger"
      data-sway
      style={{ "--sway-delay": delay } as CSSProperties}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 96 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-14 w-24 text-foreground/55"
      >
        <path d="M48 24v-8c0-4 5-4.5 5-9.5a5 5 0 1 0-10 0" />
        <path d="M48 24 7 46.5c-3 1.6-2 3.5 1 3.5h80c3 0 4-1.9 1-3.5z" />
      </svg>
    </span>
  )
}
