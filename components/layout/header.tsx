import { useTranslations } from "next-intl"

import { Pumpkin } from "@/components/icons/pumpkin"
import { LanguageMenu } from "@/components/language/language-menu"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

import { MobileMenu } from "./mobile-menu"
import { primaryNav } from "./nav"
import { Wordmark } from "./wordmark"

/**
 * The site header (spec §10.2). Solid everywhere; over a title card (the
 * home hero) it starts transparent and solidifies after 24 px of scroll,
 * in CSS (app/film.css). It stays put while pages change reels.
 */
export function Header() {
  const t = useTranslations("Nav")
  const badge = useTranslations("Badge")

  return (
    <header className="site-header sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md [view-transition-name:site-header]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center">
          <Wordmark />
        </Link>

        <nav aria-label={t("label")} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  {t(item.label)}
                  {item.soon && <Badge variant="soon">{badge("soon")}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:gap-3">
          <Link
            href="/basket"
            aria-label={t("basket")}
            className={buttonVariants({
              variant: "ghost",
              size: "icon-lg",
              className: "text-muted-foreground hover:text-ember",
            })}
          >
            <Pumpkin className="size-6" />
          </Link>
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
