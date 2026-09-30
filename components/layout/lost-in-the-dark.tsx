import type { ReactNode } from "react"

import { Fog } from "@/components/horror/fog"
import { cn } from "@/lib/utils"

type LostInTheDarkProps = {
  code: string
  title: string
  description: string
  /** The way back, e.g. a link home. */
  action: ReactNode
  className?: string
}

/**
 * The 404 title card (spec §11.8), shared by both not-found pages. The one
 * place video appears: the tape ran out, so the picture rolls (VHS
 * tracking) and "404" splits into a red and a bone ghost.
 */
export function LostInTheDark({
  code,
  title,
  description,
  action,
  className,
}: LostInTheDarkProps) {
  return (
    <section
      data-title-card
      className={cn(
        "relative isolate grid min-h-[calc(100svh-4rem)] place-items-center overflow-hidden px-4 py-24 text-center",
        className
      )}
    >
      <div aria-hidden="true" className="vhs-tracking" />
      <Fog />
      <div className="film-weave flex max-w-xl flex-col items-center gap-6">
        <p className="vhs-ghost font-heading text-h2 tracking-[0.2em] text-muted-foreground">
          {code}
        </p>
        <h1 className="font-heading text-display uppercase">{title}</h1>
        <p className="text-lead text-muted-foreground">{description}</p>
        <div className="mt-2">{action}</div>
      </div>
    </section>
  )
}
