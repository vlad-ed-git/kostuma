import type { Metadata, Viewport } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { documentClassName } from "@/app/fonts"
import { Atmosphere } from "@/components/horror/atmosphere"
import { CueMark } from "@/components/horror/cue-mark"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SkipLink } from "@/components/layout/skip-link"
import { languageTags, routing } from "@/i18n/routing"
import { themeColor } from "@/lib/design/theme"

import "../globals.css"

// Only real languages reach this layout: proxy.ts rewrites every page path to
// one (`/xx` → `/en/xx`, a 404), and next.config.ts sends leftover dotted
// paths (`/missing.txt`) to the server-rendered global 404.

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const t = await getTranslations({ locale, namespace: "App" })

  return {
    title: { default: t("name"), template: `%s · ${t("name")}` },
    description: t("tagline"),
  }
}

// Dark only: browser UI (scrollbars, form controls, the address bar on
// mobile) follows the page's warm black.
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor,
}

// The root layout: every page lives under a language (app/[locale]).
export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // The CSP nonce from proxy.ts is per request, so no page is prerendered.
  await connection()
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html lang={languageTags[locale]} className={documentClassName}>
      <body className="flex min-h-svh flex-col">
        {/* Gives Client Components the locale and messages of this request. */}
        <NextIntlClientProvider>
          <SkipLink />
          <Header />
          {/* Pages render sections; the shell owns the one <main>. */}
          <main id="content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <CueMark />
          <Atmosphere />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
