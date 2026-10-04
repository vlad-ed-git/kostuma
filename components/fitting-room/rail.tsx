"use client"

import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { CostumeImage } from "@/components/costume/costume-image"
import { Link } from "@/i18n/navigation"
import type { CostumeSummary } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

import { EmptyHanger, HangerHook } from "./dressing-room"

/**
 * The costumes in My Pumpkin Basket on a clothes rail (spec §11.4b), the
 * last added first, each on its hook and a link to its try-on. The chosen
 * one is lit and sways; the others wait dimmed until the pointer or focus
 * finds them. Many costumes scroll along the rail.
 */
export function CostumeRail({
  costumes,
  selected,
}: {
  costumes: readonly CostumeSummary[]
  selected?: string
}) {
  const t = useTranslations("FittingRoom")
  return (
    <nav aria-label={t("costumes")}>
      <Rail>
        {costumes.map((costume) => {
          const current = costume.slug === selected
          return (
            <li key={costume.slug}>
              <Link
                href={`/basket/fitting-room?costume=${costume.slug}`}
                scroll={false}
                aria-current={current ? "page" : undefined}
                title={costume.name}
                className="hanger group outline-offset-4"
              >
                <HangerHook className="mx-auto block text-foreground/55 group-aria-[current=page]:text-blood-text" />
                <span
                  className={cn(
                    "hanger-frame relative block aspect-4/5 w-18 overflow-hidden border bg-card sm:w-20",
                    current
                      ? "border-blood-text shadow-[0_0_28px_color-mix(in_oklch,var(--blood)_55%,transparent)]"
                      : "border-foreground/15"
                  )}
                >
                  <CostumeImage
                    photo={costume.photo}
                    alt={costume.name}
                    sizes="80px"
                    reveal={false}
                  />
                </span>
              </Link>
            </li>
          )
        })}
      </Rail>
    </nav>
  )
}

/** The rail while the basket is read: three frames still in the dark. */
export function RailSkeleton() {
  return (
    <div aria-hidden="true" className="[@media(scripting:none)]:hidden">
      <Rail>
        {[0, 1, 2].map((tile) => (
          <li key={tile}>
            <HangerHook className="mx-auto block text-foreground/25" />
            <span className="skeleton block aspect-4/5 w-18 sm:w-20" />
          </li>
        ))}
      </Rail>
    </div>
  )
}

/** An empty rail: three bare hangers left swinging. */
export function EmptyRail() {
  return (
    <div aria-hidden="true" className="w-72 max-w-full">
      <ul className="rail flex justify-center gap-6 pb-2">
        {["0s", "-1.7s", "-3.1s"].map((delay) => (
          <li key={delay}>
            <EmptyHanger delay={delay} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The bar and what hangs from it. Room around it for the glow and the
 * swing, which the scrolling would otherwise cut off.
 */
function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 [scrollbar-width:thin] overflow-x-auto overscroll-x-contain px-4 pt-1 pb-8">
      <ul className="rail flex w-max min-w-full gap-5 px-3 sm:gap-7">
        {children}
      </ul>
    </div>
  )
}
