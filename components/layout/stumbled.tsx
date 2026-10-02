"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

type StumbledProps = {
  title: string
  description: string
  retry: string
  /** The way back, e.g. a link home. */
  home: ReactNode
  onRetry(): void
}

/**
 * What a visitor sees when a page breaks, in their language (the error
 * pages: app/[locale]/error.tsx, app/global-error.tsx). Never the error
 * itself: it means nothing to them, and may say too much.
 */
export function Stumbled({
  title,
  description,
  retry,
  home,
  onRetry,
}: StumbledProps) {
  return (
    <section className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 py-24 text-center">
      <div className="flex max-w-xl flex-col items-center gap-6">
        <h1 className="font-heading text-display font-semibold text-balance">
          {title}
        </h1>
        <p className="text-lead text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={onRetry}>
            {retry}
          </Button>
          {home}
        </div>
      </div>
    </section>
  )
}
