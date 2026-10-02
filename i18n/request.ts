import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import * as rootParams from "next/root-params"

import { messagesFor } from "./messages"
import { routing } from "./routing"

// The locale comes from the `[locale]` segment of the URL, set by proxy.ts.
// `locale` is passed in only to override it (e.g. an email in the
// recipient's language).
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const segment = await rootParams.locale()
    if (!hasLocale(routing.locales, segment)) notFound()
    locale = segment
  }
  if (!hasLocale(routing.locales, locale)) notFound()

  return { locale, messages: await messagesFor(locale) }
})
