import type { Metadata, Viewport } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { cookies, headers } from "next/headers"
import Link from "next/link"

import { documentClassName } from "@/app/fonts"
import { Atmosphere } from "@/components/horror/atmosphere"
import { LostInTheDark } from "@/components/layout/lost-in-the-dark"
import { buttonVariants } from "@/components/ui/button"
import { languageTags, routing } from "@/i18n/routing"
import { themeColor } from "@/lib/design/theme"

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

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor,
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
    <html lang={languageTags[locale]} className={documentClassName}>
      <body className="flex min-h-svh flex-col">
        {/* No header here: this page stands outside every language. */}
        <main id="content" className="flex-1">
          <LostInTheDark
            className="min-h-svh"
            code={t("code")}
            title={t("title")}
            description={t("description")}
            action={
              <Link href={home} className={buttonVariants({ size: "lg" })}>
                {t("home")}
              </Link>
            }
          />
        </main>
        <Atmosphere />
      </body>
    </html>
  )
}
