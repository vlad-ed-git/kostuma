import { cn } from "@/lib/utils"

// The brand name is never translated (spec §2.1).
const name = "Kostuma"

/**
 * K●STUMA: the name spaced like a late-'70s one-sheet title, its O a blood
 * disc (a moon, a pupil, the projector's lamp) that beats once on hover.
 * Reads as "Kostuma" to assistive technology.
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
        "wordmark inline-flex items-baseline font-heading text-[1.75rem] leading-none tracking-[0.32em] uppercase",
        // The tracking also follows the last letter: take it back.
        "-me-[0.32em]",
        className
      )}
    >
      <span aria-hidden="true">K</span>
      <span
        aria-hidden="true"
        className="wordmark-disc me-[0.32em] inline-block size-[0.64em] rounded-full bg-blood shadow-[0_0_0.45em_var(--blood)] transition-shadow duration-300 [.wordmark:hover_&]:shadow-[0_0_0.8em_var(--blood)]"
      />
      <span aria-hidden="true">STUMA</span>
    </span>
  )
}
