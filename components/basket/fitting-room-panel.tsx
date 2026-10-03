import { RiArrowRightLine } from "@remixicon/react"
import { useTranslations } from "next-intl"

import { GetPro } from "@/components/pro/get-pro"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { WaitlistSource } from "@/lib/waitlist/schema"
import { cn } from "@/lib/utils"

/**
 * The Fitting Room, at the top of My Pumpkin Basket, which it is part of
 * (spec §11.4): what it does, the costume every account tries on free, and
 * Kostuma Pro for more. On the account page (spec §11.6), whether the
 * account's free costume is still waiting instead.
 */
export function FittingRoomPanel({
  signedIn,
  free,
  source,
  className,
}: {
  signedIn: boolean
  /** The account's free costume is still there; unknown: undefined. */
  free?: boolean
  /** Where the panel is, for the waitlist. */
  source: WaitlistSource
  className?: string
}) {
  const t = useTranslations("FittingRoom")
  const account = useTranslations("Account")

  return (
    <section
      aria-labelledby="fitting-room"
      className={cn(
        "flex flex-col items-start gap-4 border border-blood/40 bg-card p-6 shadow-[0_0_60px_color-mix(in_oklch,var(--blood)_16%,transparent)] sm:p-8",
        className
      )}
    >
      <h2 id="fitting-room" className="font-heading text-h2 font-semibold">
        {t("title")}
      </h2>
      <p className="max-w-[60ch] text-body-lg">{t("line")}</p>
      <p className="text-lead font-semibold">
        {free === undefined
          ? t("free")
          : account(free ? "freeWaiting" : "freeUsed")}
      </p>
      <div className="mt-2 flex flex-wrap items-start gap-4">
        <Link
          href="/basket/fitting-room"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {t("enter")}
          <RiArrowRightLine aria-hidden="true" />
        </Link>
        <GetPro
          source={source}
          signedIn={signedIn}
          back="/basket"
          variant="outline"
        />
      </div>
    </section>
  )
}
