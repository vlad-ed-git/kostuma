"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { Pumpkin } from "@/components/icons/pumpkin"
import { cn } from "@/lib/utils"

import { useBasket } from "./basket-provider"

type BasketToggleProps = {
  slug: string
  /** The character, for the button's name and the announcement. */
  name: string
  className?: string
}

/**
 * Puts a costume in My Pumpkin Basket or takes it out (spec §10.3): an
 * outline pumpkin that ignites when the costume goes in, and stays lit
 * while it is there. Its name shows over it on hover and keyboard focus
 * (todo UX-13: a pumpkin alone says little to a first visit); screen
 * readers hear it once, as the button's name. Hidden without JavaScript,
 * where it could do nothing.
 */
export function BasketToggle({ slug, name, className }: BasketToggleProps) {
  const t = useTranslations("Basket")
  const { ready, has, add, remove, announce } = useBasket()
  const inBasket = has(slug)
  // Each add lights it again.
  const [ignitions, setIgnitions] = useState(0)

  return (
    <button
      type="button"
      // Until the basket is read (the page's scripts), a press would be lost.
      disabled={!ready}
      aria-label={
        inBasket ? t("removeNamed", { name }) : t("addNamed", { name })
      }
      onClick={() => {
        if (inBasket) {
          remove(slug)
          announce(t("removed", { name }))
        } else {
          add(slug)
          setIgnitions((count) => count + 1)
          announce(t("added", { name }))
        }
      }}
      className={cn(
        "group/toggle relative inline-flex size-12 shrink-0 items-center justify-center text-foreground/80 transition-colors duration-150 hover:text-ember [@media(scripting:none)]:hidden",
        className
      )}
    >
      <Pumpkin
        key={ignitions}
        lit={inBasket}
        className={cn("size-7", inBasket && ignitions > 0 && "ignite")}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-0 bottom-full z-10 mb-1 border border-blood/40 bg-card px-3 py-1.5 text-micro caps whitespace-nowrap text-foreground opacity-0 transition-opacity duration-150 group-hover/toggle:opacity-100 group-focus-visible/toggle:opacity-100 motion-reduce:transition-none"
      >
        {inBasket ? t("removeFrom") : t("add")}
      </span>
    </button>
  )
}
