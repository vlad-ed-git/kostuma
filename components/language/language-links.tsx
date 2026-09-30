"use client"

import { useLocale, useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import { languageTags, routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

import { endonyms } from "./languages"

/**
 * Every language as a plain link to this same page (spec §10.1), for the
 * footer and the mobile menu: no popup to open, and it works without
 * JavaScript. The current language is marked with `aria-current`.
 */
export function LanguageLinks({ className }: { className?: string }) {
  const t = useTranslations("Language")
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav aria-label={t("label")} className={className}>
      <ul className="flex flex-wrap items-center gap-x-5">
        {routing.locales.map((option) => {
          const current = option === locale
          return (
            <li key={option}>
              <Link
                href={pathname}
                locale={option}
                // Never prefetched: where a language link lands depends on
                // the language cookie, which the click itself changes.
                // A prefetch made before the click (say while "Español"
                // is being clicked) caches the old answer, and "English"
                // then sends the visitor back to Spanish (found in e2e).
                prefetch={false}
                hrefLang={languageTags[option]}
                lang={languageTags[option]}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center text-xs font-semibold tracking-widest uppercase transition-colors",
                  current
                    ? "text-foreground after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:bg-blood"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {endonyms[option]}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
