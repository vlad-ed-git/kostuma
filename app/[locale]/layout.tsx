import type { Metadata, Viewport } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { documentClassName } from "@/app/fonts"
import { languageTags, routing } from "@/i18n/routing"

import "../globals.css"

// Every language is rendered at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Any other first segment (`/missing.txt`, `/xx/…`) matches no route, so it
// gets the server-rendered 404 (app/global-not-found.tsx). Nested dynamic
// segments inherit this: list their params in generateStaticParams, or set
// `dynamicParams = true` on them.
export const dynamicParams = false

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
// mobile) follows the preset's dark background.
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#09090b",
}

// The root layout: every page lives under a language (app/[locale]).
export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html lang={languageTags[locale]} className={documentClassName}>
      <body>
        {/* Gives Client Components the locale and messages of this request. */}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
