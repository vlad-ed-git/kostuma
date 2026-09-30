"use client"

import { hasLocale, useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { usePathname, useRouter } from "@/i18n/navigation"
import { languageTags, routing, type Locale } from "@/i18n/routing"

// Each language in its own words, so readers find theirs from any page.
const names: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
}

/** Shows the current page in another language. */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value
          if (!hasLocale(routing.locales, next)) return
          startTransition(() => router.replace(pathname, { locale: next }))
        }}
        className="border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
      >
        {routing.locales.map((option) => (
          <option key={option} value={option} lang={languageTags[option]}>
            {names[option]}
          </option>
        ))}
      </select>
    </label>
  )
}
