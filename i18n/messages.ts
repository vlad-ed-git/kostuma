import type { Messages } from "next-intl"

import en from "@/messages/en.json"

import type { Locale } from "./routing"

/**
 * English is the source of truth. The other languages load on demand and
 * may be incomplete.
 */
const translations: Record<
  Exclude<Locale, "en">,
  () => Promise<PartialMessages>
> = {
  es: () => import("@/messages/es.json").then((module) => module.default),
  zh: () => import("@/messages/zh.json").then((module) => module.default),
}

type PartialMessages = { [key: string]: string | PartialMessages }

/**
 * Every message in a locale. A message not translated yet falls back to
 * English, so a page never shows a raw key.
 */
export async function messagesFor(locale: Locale): Promise<Messages> {
  if (locale === "en") return en
  return withFallback(en, await translations[locale]())
}

/** `translated` laid over `fallback`, key by key, at every depth. */
export function withFallback<T extends PartialMessages>(
  fallback: T,
  translated: PartialMessages
): T {
  const merged: PartialMessages = { ...fallback }
  for (const [key, value] of Object.entries(translated)) {
    const base = fallback[key]
    if (typeof value === "string") {
      // A translation replaces only a message, never a whole group.
      if (typeof base === "string") merged[key] = value
    } else if (base !== undefined && typeof base !== "string") {
      merged[key] = withFallback(base, value)
    }
  }
  return merged as T
}
