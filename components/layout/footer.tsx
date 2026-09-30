import { useTranslations } from "next-intl"
import type { ComponentProps, ReactNode } from "react"

import { LanguageLinks } from "@/components/language/language-links"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"

import { costumesHref } from "./nav"
import { Wordmark } from "./wordmark"

/**
 * The foot of every page (spec §10.2), on the page's grid: the wordmark and
 * the legal lines, then the places, help and fine print in three columns;
 * below, the year and the languages. No sign-off and no top border (owner).
 */
export function Footer() {
  const t = useTranslations("Footer")
  const nav = useTranslations("Nav")
  const badge = useTranslations("Badge")
  const soon = <Badge variant="soon">{badge("soon")}</Badge>

  return (
    <footer className="relative pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row: who we are on the left, the three columns on the right,
            all starting on one line. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start gap-4 lg:col-span-5">
            <Link href="/" className="flex min-h-11 items-center">
              <Wordmark />
            </Link>
            <p className="max-w-md text-base text-muted-foreground">
              {t("contentWarning")}
            </p>
            <p className="max-w-md text-base text-muted-foreground">
              {t("trademarks")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7 lg:gap-8">
            <Column title={t("explore")}>
              <FooterLink href={costumesHref}>{nav("costumes")}</FooterLink>
              <FooterLink href="/basket">{nav("basket")}</FooterLink>
            </Column>
            <Column title={t("help")}>
              <FooterLink href="/feedback?type=bug">
                {t("reportBug")}
              </FooterLink>
              <FooterLink href="/feedback?type=feedback">
                {t("shareFeedback")}
              </FooterLink>
              <FooterLink href="/feedback?type=feature">
                {t("requestFeature")}
              </FooterLink>
            </Column>
            <Column title={t("finePrint")}>
              <FooterLink href="/terms">
                {t("terms")} {soon}
              </FooterLink>
              <FooterLink href="/privacy">
                {t("privacy")} {soon}
              </FooterLink>
            </Column>
          </div>
        </div>

        {/* Bottom row: the year on the left, the languages on the right. */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-micro caps text-muted-foreground">
            {/* A string: as a number, ICU would print "2,026". */}
            {t("copyright", { year: String(new Date().getFullYear()) })}
          </p>
          <LanguageLinks />
        </div>
      </div>
    </footer>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-label caps text-muted-foreground">{title}</h2>
      <ul className="mt-3 flex flex-col">{children}</ul>
    </nav>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: ComponentProps<typeof Link>["href"]
  children: ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center gap-2 text-base transition-colors hover:text-blood-text"
      >
        {children}
      </Link>
    </li>
  )
}
