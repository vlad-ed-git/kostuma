import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Geist_Mono, Noto_Sans, Space_Grotesk } from "next/font/google"
import { notFound } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import { languageTags, routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

import "../globals.css"

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
})

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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

// The root layout: every page lives under a language (app/[locale]).
export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html
      lang={languageTags[locale]}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
        spaceGroteskHeading.variable
      )}
    >
      <body>
        {/* Gives Client Components the locale and messages of this request. */}
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
