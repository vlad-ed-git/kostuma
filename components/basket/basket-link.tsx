"use client"

import { useTranslations } from "next-intl"
import { useState, type CSSProperties } from "react"

import { Pumpkin } from "@/components/icons/pumpkin"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

import { useBasket, useBasketEvents } from "./basket-provider"

/** A change of the count the visitor made: it rolls up or down. */
type Roll = { id: number; from: number; direction: 1 | -1 }

/**
 * The header's way to My Pumpkin Basket (spec §10.2): the pumpkin, lit
 * while the basket holds something, with the count on it ("My Pumpkin
 * Basket, 3 costumes"). Adding a costume anywhere on the page ignites it
 * and rolls the count up; taking one out rolls it down.
 */
export function BasketLink({ className }: { className?: string }) {
  const t = useTranslations("Basket")
  const { slugs } = useBasket()
  const count = slugs.length
  const [ignitions, setIgnitions] = useState(0)
  const [roll, setRoll] = useState<Roll | null>(null)

  useBasketEvents((event) => {
    if (event.type === "clear") return setRoll(null)
    if (event.type !== "add" && event.type !== "remove") return
    if (event.type === "add") setIgnitions((ignited) => ignited + 1)
    setRoll((last) => ({
      id: (last?.id ?? 0) + 1,
      // The count this render shows: the one before the change.
      from: count,
      direction: event.type === "add" ? 1 : -1,
    }))
  })

  return (
    <Link
      href="/basket"
      aria-label={count > 0 ? t("label", { count }) : t("title")}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 text-ui caps text-muted-foreground transition-colors hover:text-ember",
        className
      )}
    >
      <span className="relative inline-flex">
        <Pumpkin
          key={ignitions}
          lit={count > 0}
          className={cn("size-6", count > 0 && ignitions > 0 && "ignite")}
        />
        {count > 0 && (
          <Badge
            variant="count"
            aria-hidden="true"
            className="absolute -end-3 -top-2.5"
          >
            {roll && roll.from !== count && roll.from > 0 && (
              <span
                key={`out-${roll.id}`}
                className="basket-count-out absolute inset-0 flex items-center justify-center"
                style={{ "--roll": roll.direction } as CSSProperties}
              >
                {roll.from}
              </span>
            )}
            <span
              key={`in-${roll?.id ?? 0}`}
              className={roll ? "basket-count-in" : undefined}
              style={{ "--roll": roll?.direction ?? 1 } as CSSProperties}
            >
              {count}
            </span>
          </Badge>
        )}
      </span>
      {/* The icon alone on small screens; the label names it for readers. */}
      <span className="hidden lg:inline">{t("title")}</span>
    </Link>
  )
}
