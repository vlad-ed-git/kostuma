import { RiArrowRightLine } from "@remixicon/react"
import { useFormatter, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { fittingRoomPrice } from "@/lib/fitting-room/price"
import { cn } from "@/lib/utils"

/**
 * The Fitting Room, at the top of My Pumpkin Basket, which it is part of
 * (spec §11.4): what it does, and its price. On
 * the account page (spec §11.6), the try-ons waiting there too.
 */
export function FittingRoomPanel({
  credits,
  className,
}: {
  /** The account's free try-ons left, when known. */
  credits?: number
  className?: string
}) {
  const t = useTranslations("FittingRoom")
  const account = useTranslations("Account")
  const badge = useTranslations("Badge")
  const format = useFormatter()
  const price = format.number(fittingRoomPrice.perCostume, {
    style: "currency",
    currency: fittingRoomPrice.currency,
    // "$5", and "$4.99" should it ever cost that.
    minimumFractionDigits: 0,
  })

  return (
    <section
      aria-labelledby="fitting-room"
      className={cn(
        "flex flex-col items-start gap-4 border border-blood/40 bg-card p-6 shadow-[0_0_60px_color-mix(in_oklch,var(--blood)_16%,transparent)] sm:p-8",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 id="fitting-room" className="font-heading text-h2 font-semibold">
          {t("title")}
        </h2>
        <Badge variant="premium">{badge("premium")}</Badge>
      </div>
      <p className="max-w-[60ch] text-body-lg">{t("line")}</p>
      {credits !== undefined && (
        <p className="text-lead">
          {account("tryOnsWaiting", { count: credits })}
        </p>
      )}
      <p className="text-lead font-semibold">
        {t("price", { free: fittingRoomPrice.freeTryOns, price })}
      </p>
      <Link
        href="/basket/fitting-room"
        className={buttonVariants({ variant: "outline", className: "mt-2" })}
      >
        {t("enter")}
        <RiArrowRightLine aria-hidden="true" />
      </Link>
    </section>
  )
}
