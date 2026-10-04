import type { Metadata, Viewport } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { documentClassName } from "@/app/fonts"
import { BasketProvider } from "@/components/basket/basket-provider"
import { Atmosphere } from "@/components/horror/atmosphere"
import { CueMark } from "@/components/horror/cue-mark"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SkipLink } from "@/components/layout/skip-link"
import { languageTags, routing } from "@/i18n/routing"
import { getUser } from "@/lib/auth/session"
import { getCostumes } from "@/lib/catalog"
import { themeColor } from "@/lib/design/theme"
import { ogLocaleOf, SITE_NAME } from "@/lib/seo"
import { siteUrl } from "@/lib/site"

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

  // What every page shares; each indexable page adds its own address, its
  // versions in the other languages and its card (lib/seo.ts).
  return {
    metadataBase: siteUrl(),
    applicationName: SITE_NAME,
    title: { default: t("name"), template: `%s · ${t("name")}` },
    description: t("tagline"),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocaleOf[locale],
    },
    twitter: { card: "summary_large_image" },
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
  const user = await getUser()

  return (
    <html lang={languageTags[locale]} className={documentClassName}>
      <body className="flex min-h-svh flex-col">
        {/* Gives Client Components the locale and messages of this request. */}
        <NextIntlClientProvider>
          {/* My Pumpkin Basket on every page. Signed in, it follows the
              session's account live. */}
          <BasketProvider
            costumes={getCostumes().map(({ slug }) => slug)}
            account={user?.uid ?? null}
          >
            <SkipLink />
            <Header />
            {/* Pages render sections; the shell owns the one <main>. */}
            <main id="content" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Footer />
          </BasketProvider>
          <CueMark />
          <Atmosphere />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
