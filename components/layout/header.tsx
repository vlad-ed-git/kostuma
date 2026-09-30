import { useTranslations } from "next-intl"

import { Pumpkin } from "@/components/icons/pumpkin"
import { LanguageMenu } from "@/components/language/language-menu"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

import { MobileMenu } from "./mobile-menu"
import { costumesHref } from "./nav"
import { Wordmark } from "./wordmark"

/**
 * The site header (spec §10.2). Solid everywhere; over a title card (the
 * home hero) it starts transparent and solidifies after 24 px of scroll,
 * in CSS (app/film.css). It stays put while pages change reels.
 */
export function Header() {
  const t = useTranslations("Nav")

  return (
    <header className="site-header sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md [view-transition-name:site-header]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center">
          <Wordmark />
        </Link>

        {/* The two places of the flow: browse, then My Pumpkin Basket. */}
        <nav aria-label={t("label")} className="flex flex-1 items-center">
          <Link
            href={costumesHref}
            className="hidden min-h-11 items-center text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground lg:inline-flex"
          >
            {t("costumes")}
          </Link>
          <Link
            href="/basket"
            className="ms-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-ember"
          >
            <Pumpkin className="size-6" />
            {/* The icon alone on small screens; the name stays for readers. */}
            <span className="sr-only lg:not-sr-only">{t("basket")}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-1 lg:gap-3">
          <LanguageMenu className="hidden lg:inline-flex" />
          <Link
            href="/sign-in"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "hidden lg:inline-flex",
            })}
          >
            {t("signIn")}
          </Link>
          <MobileMenu className="lg:hidden" />
        </div>
      </div>
    </header>
  )
}
