"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { Pumpkin } from "@/components/icons/pumpkin"
import { Button, buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

import { useBasket } from "./basket-provider"

type AddToBasketProps = {
  slug: string
  /** The character, for the announcement. */
  name: string
}

/**
 * The costume page's one action (spec §11.3): "Add to My Pumpkin Basket".
 * Once the costume is in, it becomes "In My Pumpkin Basket", a link to the
 * basket, where it can be bought, tried on or taken out again.
 */
export function AddToBasket({ slug, name }: AddToBasketProps) {
  const t = useTranslations("Basket")
  const { has, add, announce } = useBasket()
  const inBasket = has(slug)
  const [justAdded, setJustAdded] = useState(false)
  const link = useRef<HTMLAnchorElement>(null)
  // Set by the visitor's click only: a change from another tab never moves
  // their focus.
  const focusLink = useRef(false)

  // The button the visitor pressed is gone: keep their place on its link.
  useEffect(() => {
    if (!inBasket || !focusLink.current) return
    focusLink.current = false
    link.current?.focus()
  }, [inBasket])

  const className = "[@media(scripting:none)]:hidden"

  if (inBasket) {
    return (
      <Link
        ref={link}
        href="/basket"
        className={buttonVariants({
          variant: "outline",
          size: "lg",
          className: cn("w-fit gap-3", className),
        })}
      >
        <Pumpkin lit className={cn("size-6", justAdded && "ignite")} />
        {t("inBasket")}
      </Link>
    )
  }

  return (
    <Button
      size="lg"
      className={cn("w-fit gap-3", className)}
      onClick={() => {
        focusLink.current = true
        add(slug)
        setJustAdded(true)
        announce(t("added", { name }))
      }}
    >
      <Pumpkin className="size-6" />
      {t("add")}
    </Button>
  )
}
