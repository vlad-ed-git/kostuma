import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Fog } from "@/components/horror/fog"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { supportEmail } from "@/lib/site"

/** The end credits (spec §10.2). */
export function Footer() {
  const t = useTranslations("Footer")
  const nav = useTranslations("Nav")
  const badge = useTranslations("Badge")
  const soon = <Badge variant="soon">{badge("soon")}</Badge>

  return (
    <footer className="relative isolate overflow-hidden border-t border-border">
      <Fog />
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <p className="font-heading text-display text-transparent uppercase transition-colors duration-700 [-webkit-text-stroke:1px_var(--muted-foreground)] hover:text-foreground">
          {t("signOff")}
        </p>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          <Column title={t("explore")}>
            <FooterLink href="/costumes">{nav("costumes")}</FooterLink>
            <FooterLink href="/basket">{nav("basket")}</FooterLink>
            <FooterLink href="/try-on">
              {nav("mirror")} {soon}
            </FooterLink>
          </Column>
          <Column title={t("help")}>
            <FooterLink href="/feedback?type=bug">{t("reportBug")}</FooterLink>
            <FooterLink href="/feedback?type=feedback">
              {t("shareFeedback")}
            </FooterLink>
            <FooterLink href="/feedback?type=feature">
              {t("requestFeature")}
            </FooterLink>
            <li>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {supportEmail}
              </a>
            </li>
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

        <div className="mt-16 flex flex-col gap-6 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <p>{t("contentWarning")}</p>
            <p>{t("trademarks")}</p>
            <p className="font-mono text-micro uppercase">
              {/* A string: as a number, ICU would print "2,026". */}
              {t("copyright", { year: String(new Date().getFullYear()) })}
            </p>
          </div>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-mono text-label text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="mt-4 flex flex-col">{children}</ul>
    </nav>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center gap-2 text-sm transition-colors hover:text-blood-text"
      >
        {children}
      </Link>
    </li>
  )
}
