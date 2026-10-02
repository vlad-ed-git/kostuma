import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// On Remix Icon's 24 px grid with a matching 1.75 px stroke (spec §9.1).
const stem = "M12 8.1V6.4c0-1.5.8-2.6 2.3-3"
const body =
  "M12 8.1c-1.3-.8-3.5-1-5.4-.3C4 8.8 2.5 11.4 2.5 14.5c0 3.6 2.6 6.3 6 6.3h7c3.4 0 6-2.7 6-6.3 0-3.1-1.5-5.7-4.1-6.7-1.9-.7-4.1-.5-5.4.3Z"
const ribs =
  "M9.4 7.4c-1.7 1.9-2.5 4.3-2.5 7.1 0 2.6.8 4.9 2.3 6.3M14.6 7.4c1.7 1.9 2.5 4.3 2.5 7.1 0 2.6-.8 4.9-2.3 6.3"
// The carved face: cut out of the fill, so the dark shows through.
const face =
  "M7.2 13.6l1.4-2.2 1.4 2.2Zm6.8 0 1.4-2.2 1.4 2.2ZM6.8 15.6h10.4l-1.3 2.6-1.4-1-1.2 1.2-1.3-1.2-1.3 1.2-1.2-1.2-1.4 1Z"

type PumpkinProps = ComponentProps<"svg"> & {
  /** Lit when the Pumpkin Basket holds something: ember fill, carved face. */
  lit?: boolean
}

/** The Pumpkin Basket's icon. Decorative: pair it with text or a label. */
export function Pumpkin({ lit = false, className, ...props }: PumpkinProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-lit={lit || undefined}
      className={cn(
        lit && "text-ember drop-shadow-[0_0_6px_var(--ember)]",
        className
      )}
      {...props}
    >
      <path d={stem} />
      {lit ? (
        <>
          <path
            d={`${body}${face}`}
            fill="currentColor"
            fillRule="evenodd"
            stroke="none"
          />
          <path d={body} />
        </>
      ) : (
        <>
          <path d={body} />
          <path d={ribs} />
        </>
      )}
    </svg>
  )
}
