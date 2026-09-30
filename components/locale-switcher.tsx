"use client"

import { RiArrowDownSLine, RiGlobalLine } from "@remixicon/react"
import { hasLocale, useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { useReportNavigation } from "@/hooks/use-report-navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { languageTags, routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

// Each language in its own words, so readers find theirs from any page.
const names: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
}

/**
 * Shows the current page in another language. A native <select>: robust,
 * keyboard- and screen-reader-friendly, dark through `color-scheme`.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  useReportNavigation(pending)

  return (
    <label
      className={cn(
        "relative inline-flex h-11 items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground",
        className
      )}
    >
      <RiGlobalLine aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value
          if (!hasLocale(routing.locales, next)) return
          startTransition(() => router.replace(pathname, { locale: next }))
        }}
        className="h-full cursor-pointer appearance-none bg-transparent pe-5 tracking-widest uppercase disabled:opacity-50"
      >
        {routing.locales.map((option) => (
          <option key={option} value={option} lang={languageTags[option]}>
            {names[option]}
          </option>
        ))}
      </select>
      <RiArrowDownSLine
        aria-hidden="true"
        className="pointer-events-none absolute end-0 size-4"
      />
    </label>
  )
}
