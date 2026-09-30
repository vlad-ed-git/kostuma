import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { cookies, headers } from "next/headers"
import Link from "next/link"

import { languageTags, routing } from "@/i18n/routing"

import "./globals.css"

/**
 * The 404 page for every URL no route matches (`/es/nope`, `/missing.txt`).
 * Rendered on the server, unlike `notFound()` from a page, which Next 16.3
 * renders in the browser (see app/[locale]/not-found.tsx). It replaces the
 * whole document, so it has its own <html>.
 */
async function visitorLocale() {
  // The language proxy.ts matched for this URL, else the visitor's saved one.
  const candidates = [
    (await headers()).get("x-next-intl-locale"),
    (await cookies()).get("NEXT_LOCALE")?.value,
  ]
  return (
    candidates.find((locale) => hasLocale(routing.locales, locale)) ??
    routing.defaultLocale
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale: await visitorLocale(),
    namespace: "NotFound",
  })
  return { title: t("title") }
}

export default async function GlobalNotFound() {
  const locale = await visitorLocale()
  const t = await getTranslations({ locale, namespace: "NotFound" })
  const home = locale === routing.defaultLocale ? "/" : `/${locale}`

  return (
    <html lang={languageTags[locale]} className="antialiased">
      <body>
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="max-w-md text-muted-foreground">{t("description")}</p>
          <Link href={home} className="text-sm underline underline-offset-4">
            {t("home")}
          </Link>
        </main>
      </body>
    </html>
  )
}
