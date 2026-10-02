import { cn } from "@/lib/utils"

// The brand name is never translated (spec §2.1).
const name = "Kostuma"

/**
 * "Kostuma" in the gothic title face, its o a drop of blood that glows
 * and beats once on hover. Reads as "Kostuma" to assistive technology.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      // Latin letters in every language: keeps its spacing on Chinese pages.
      lang="en"
      translate="no"
      className={cn(
        "wordmark inline-flex items-baseline font-heading text-[2rem] leading-none font-semibold",
        className
      )}
    >
      <span aria-hidden="true">K</span>
      <span
        aria-hidden="true"
        className="wordmark-o inline-block text-blood-text [text-shadow:0_0_0.45em_color-mix(in_oklch,var(--blood)_75%,transparent)]"
      >
        o
      </span>
      <span aria-hidden="true">stuma</span>
    </span>
  )
}
