import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BasketList, BasketSummary } from "@/components/basket/basket-list"
import { FittingRoomPanel } from "@/components/basket/fitting-room-panel"
import { getUser } from "@/lib/auth/session"
import { getCostumes, toSummary } from "@/lib/catalog"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Basket")
  // Each visitor's own, and empty to a search engine.
  return { title: t("title"), robots: { index: false } }
}

/**
 * My Pumpkin Basket (spec §11.4): the costumes the visitor keeps, with the
 * Fitting Room at the top, and Buy, Try on and Remove on each.
 */
export default async function BasketPage() {
  const t = await getTranslations("Basket")
  const user = await getUser()
  // Only what the rows show: the basket itself is read in the browser.
  const costumes = getCostumes().map((costume) => ({
    ...toSummary(costume),
    stores: costume.stores,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <div className="max-w-4xl">
        <h1 className="font-heading text-display font-semibold text-balance">
          {t("title")}
        </h1>
        <BasketSummary />
        <FittingRoomPanel
          signedIn={user !== null}
          source="basket"
          className="mt-10"
        />
        <BasketList costumes={costumes} />
      </div>
    </div>
  )
}
