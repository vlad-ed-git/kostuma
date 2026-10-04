"use client"

import { Menu } from "@base-ui/react/menu"
import { RiArrowDownSLine, RiArrowRightUpLine } from "@remixicon/react"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import type { ShopLink } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

/**
 * What a shop link tells search engines: another site, not one Kostuma
 * vouches for, and never paid for (spec §10.3: no affiliate links).
 */
const SHOP_REL = "noopener noreferrer nofollow"

type BuyProps = {
  /** The character, for screen readers. */
  name: string
  /** At least one: every costume names a shop that has it. */
  shops: readonly [ShopLink, ...ShopLink[]]
}

/**
 * Buy, on a costume in My Pumpkin Basket (spec §10.3): opens its shop's
 * search for it in a new tab; with several shops, a menu of them.
 */
export function Buy({ name, shops }: BuyProps) {
  const t = useTranslations("Basket")

  if (shops.length === 1) {
    const [shop] = shops
    return (
      <a
        href={shop.url}
        target="_blank"
        rel={SHOP_REL}
        aria-label={t("buyNamed", { name })}
        className={buttonVariants()}
      >
        {t("buy")}
        <RiArrowRightUpLine aria-hidden="true" className="size-4" />
      </a>
    )
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t("chooseShop", { name })}
        className={buttonVariants({ className: "group/buy" })}
      >
        {t("buy")}
        <RiArrowDownSLine
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-heavy group-data-popup-open/buy:rotate-180 motion-reduce:transition-none"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className="min-w-56 origin-(--transform-origin) border border-border bg-card py-2 transition-[opacity,translate] duration-200 ease-dread outline-none data-ending-style:opacity-0 data-ending-style:duration-100 data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none">
            <Menu.Group>
              <Menu.GroupLabel className="px-4 pt-1 pb-2 text-micro caps text-muted-foreground">
                {t("shops")}
              </Menu.GroupLabel>
              {shops.map((shop) => (
                <Menu.LinkItem
                  key={shop.url}
                  closeOnClick
                  render={
                    <a
                      href={shop.url}
                      target="_blank"
                      rel={SHOP_REL}
                      aria-label={t("buyAtNamed", { shop: shop.name })}
                    />
                  }
                  className={cn(
                    "relative flex min-h-11 items-center justify-between gap-6 px-4 text-lg text-muted-foreground transition-colors focus-visible:-outline-offset-2",
                    "before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:bg-blood before:opacity-0 before:transition-opacity data-highlighted:bg-muted data-highlighted:text-foreground data-highlighted:before:opacity-100"
                  )}
                >
                  {t("buyAt", { shop: shop.name })}
                  <RiArrowRightUpLine aria-hidden="true" className="size-4" />
                </Menu.LinkItem>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
