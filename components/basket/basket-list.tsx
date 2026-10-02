"use client"

import { RiCloseLine } from "@remixicon/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, type Ref } from "react"

import { CostumeImage } from "@/components/costume/costume-image"
import { filmLine } from "@/components/costume/format"
import { Pumpkin } from "@/components/icons/pumpkin"
import { costumesHref } from "@/components/layout/nav"
import { IntentLink } from "@/components/navigation/intent-link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { CostumeSummary, Store } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

import { useBasket } from "./basket-provider"
import { Buy } from "./buy"

/** A costume as the basket shows it: a list row and its shops. */
export type BasketCostume = CostumeSummary & { stores: readonly Store[] }

/** "Clear basket" waits this long for the second click (spec §11.4). */
export const CLEAR_WINDOW_MS = 4_000

/** Where focus goes once a row is gone: a row's Remove, or the empty basket. */
type FocusTarget = { slug: string | null }

/**
 * How many costumes the basket holds, under the page's title. Never where
 * or how it is kept: that is Kostuma's business, not the visitor's.
 */
export function BasketSummary() {
  const t = useTranslations("Basket")
  const { ready, slugs, unreachable } = useBasket()

  if (!ready) {
    return (
      <p
        aria-hidden="true"
        className="skeleton mt-4 h-7 w-32 [@media(scripting:none)]:hidden"
      />
    )
  }
  if (unreachable) {
    return (
      <p role="alert" className="mt-4 text-lead text-destructive">
        {t("unreachable")}
      </p>
    )
  }
  // Empty: the empty basket below says so.
  if (slugs.length === 0) return null
  return (
    <p className="mt-4 text-lead text-muted-foreground">
      {t("count", { count: slugs.length })}
    </p>
  )
}

/**
 * The costumes in My Pumpkin Basket, the last added first, each with Buy,
 * Try on and Remove; then "Clear basket". The server never knows the
 * basket: it sends a placeholder, and the browser fills it in.
 */
export function BasketList({
  costumes,
}: {
  /** Every costume there is, to find the ones in the basket. */
  costumes: readonly BasketCostume[]
}) {
  const t = useTranslations("Basket")
  const { ready, slugs, remove, clear, announce } = useBasket()
  const [armed, setArmed] = useState(false)
  const [focus, setFocus] = useState<FocusTarget | null>(null)
  const removeButtons = useRef(new Map<string, HTMLButtonElement>())
  const emptyTitle = useRef<HTMLHeadingElement>(null)

  const bySlug = new Map(costumes.map((costume) => [costume.slug, costume]))
  const items = [...slugs].reverse().flatMap((slug) => bySlug.get(slug) ?? [])

  // A second click within the window clears; then it forgets the first.
  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), CLEAR_WINDOW_MS)
    return () => clearTimeout(timer)
  }, [armed])

  // The button pressed is gone with its row: keep the visitor's place.
  useEffect(() => {
    if (!focus) return
    const target =
      focus.slug === null
        ? emptyTitle.current
        : removeButtons.current.get(focus.slug)
    target?.focus()
  }, [focus])

  if (!ready) {
    return (
      <>
        <ul
          aria-hidden="true"
          className="mt-12 flex flex-col gap-5 [@media(scripting:none)]:hidden"
        >
          {[0, 1].map((row) => (
            <li key={row} className="flex items-center gap-4">
              <span className="skeleton aspect-4/5 w-18" />
              <span className="flex flex-col gap-2">
                <span className="skeleton h-7 w-48" />
                <span className="skeleton h-5 w-32" />
              </span>
            </li>
          ))}
        </ul>
        {/* Without JavaScript nothing can be added: the basket is empty. */}
        <div className="hidden [@media(scripting:none)]:block">
          <Empty />
        </div>
      </>
    )
  }

  if (items.length === 0) return <Empty titleRef={emptyTitle} />

  return (
    <div className="mt-12">
      <ul aria-label={t("costumes")} className="flex flex-col">
        {items.map((costume, index) => (
          <li
            key={costume.slug}
            className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <IntentLink
              href={`/costumes/${costume.slug}`}
              className="group/row flex min-w-0 flex-1 items-center gap-4 outline-offset-4"
            >
              <span className="relative aspect-4/5 w-18 shrink-0 overflow-hidden border border-foreground/8 bg-card transition-[border-color,box-shadow] duration-300 group-hover/row:border-blood-text/50 group-hover/row:shadow-[0_0_24px_color-mix(in_oklch,var(--blood)_40%,transparent)]">
                <CostumeImage
                  photo={costume.photo}
                  alt=""
                  sizes="72px"
                  reveal={false}
                />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-heading text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-medium text-balance transition-colors duration-300 group-hover/row:text-blood-text">
                  {costume.name}
                </span>
                <span className="text-muted-foreground italic">
                  {filmLine(costume.films)}
                </span>
              </span>
            </IntentLink>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
              <Buy name={costume.name} shops={costume.stores} />
              <IntentLink
                href={`/basket/fitting-room?costume=${costume.slug}`}
                aria-label={t("tryOnNamed", { name: costume.name })}
                className="inline-flex h-10 items-center gap-2 text-ui caps text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("tryOn")}
              </IntentLink>
              <Button
                variant="ghost"
                aria-label={t("removeNamed", { name: costume.name })}
                ref={(button: HTMLButtonElement | null) => {
                  if (!button) return
                  removeButtons.current.set(costume.slug, button)
                  return () => {
                    removeButtons.current.delete(costume.slug)
                  }
                }}
                onClick={() => {
                  const next = items[index + 1] ?? items[index - 1]
                  remove(costume.slug)
                  announce(t("removed", { name: costume.name }))
                  setFocus({ slug: next?.slug ?? null })
                }}
                className="-mx-3 px-3"
              >
                <RiCloseLine aria-hidden="true" className="size-5" />
                {t("remove")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        onClick={() => {
          if (!armed) {
            setArmed(true)
            announce(t("clearConfirm"))
            return
          }
          setArmed(false)
          clear()
          announce(t("cleared"))
          setFocus({ slug: null })
        }}
        className={cn(
          "-ms-3 mt-8 px-3",
          armed
            ? "text-blood-text hover:text-blood-text"
            : "text-muted-foreground"
        )}
      >
        {armed ? t("clearConfirm") : t("clear")}
      </Button>
    </div>
  )
}

/** The empty basket (spec §11.4): an unlit pumpkin and the way back. */
function Empty({ titleRef }: { titleRef?: Ref<HTMLHeadingElement> }) {
  const t = useTranslations("Basket")
  return (
    <div className="mt-16 flex flex-col items-center gap-4 text-center">
      <Pumpkin className="size-16 text-muted-foreground" />
      <h2
        ref={titleRef}
        tabIndex={-1}
        className="font-heading text-h2 font-semibold outline-none"
      >
        {t("empty")}
      </h2>
      <p className="text-lead text-muted-foreground">{t("emptyLine")}</p>
      <Link
        href={costumesHref}
        className={buttonVariants({ size: "lg", className: "mt-4" })}
      >
        {t("browse")}
      </Link>
    </div>
  )
}
