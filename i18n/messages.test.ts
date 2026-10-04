import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"
import es from "@/messages/es.json"
import zh from "@/messages/zh.json"

import { messagesFor, withFallback } from "./messages"

describe("withFallback", () => {
  const fallback = {
    App: { name: "Kostuma", tagline: "English tagline" },
    NotFound: { title: "Lost", home: "Back" },
  }

  it("uses a translation where one exists", () => {
    const merged = withFallback(fallback, { App: { tagline: "Traducido" } })
    expect(merged.App.tagline).toBe("Traducido")
  })

  it("keeps English for every message not translated yet", () => {
    const merged = withFallback(fallback, { App: { tagline: "Traducido" } })
    expect(merged.App.name).toBe("Kostuma")
    expect(merged.NotFound).toEqual(fallback.NotFound)
  })

  it("returns English unchanged when nothing is translated", () => {
    expect(withFallback(fallback, {})).toEqual(fallback)
  })

  it("never lets a string replace a whole group", () => {
    const merged = withFallback(fallback, { NotFound: "broken" })
    expect(merged.NotFound).toEqual(fallback.NotFound)
  })

  it("never lets a group replace a single message", () => {
    const merged = withFallback(fallback, { App: { name: { nested: "x" } } })
    expect(merged.App.name).toBe("Kostuma")
  })

  it("ignores keys English does not have", () => {
    const merged = withFallback(fallback, { Stray: { key: "x" } })
    expect(merged).not.toHaveProperty("Stray")
  })

  it("does not modify its inputs", () => {
    const translated = { App: { tagline: "Traducido" } }
    withFallback(fallback, translated)
    expect(fallback.App.tagline).toBe("English tagline")
  })
})

describe("messagesFor", () => {
  it("gives English as is", async () => {
    expect(await messagesFor("en")).toEqual(en)
  })

  it.each(["es", "zh"] as const)(
    "gives %s every English key, translated or not",
    async (locale) => {
      const messages = await messagesFor(locale)
      expect(keysOf(messages)).toEqual(keysOf(en))
    }
  )
})

describe("the translations", () => {
  const entries = (messages: object) =>
    keysOf(messages).map(
      (key) =>
        [
          key,
          key
            .split(".")
            .reduce<unknown>(
              (group, part) => (group as Record<string, unknown>)[part],
              messages
            ) as string,
        ] as const
    )
  // The arguments (`{date}`, `{days, plural, …}`) and tags (`<b>`) a
  // message uses: a translation that drops or renames one breaks the page.
  // `<wbr>` is Chinese typography, a heading's break point: no other
  // language needs it (components/ui/breaks.tsx).
  const shape = (message: string) => ({
    args: [...message.matchAll(/\{\s*([A-Za-z_]\w*)\s*[,}]/g)]
      .map(([, name]) => name)
      .sort(),
    tags: [...message.matchAll(/<(\w+)>/g)]
      .map(([, name]) => name)
      .filter((name) => name !== "wbr")
      .sort(),
  })

  // Every message in all three languages (owner, 2026-10-04: "everything
  // will be translated"), in English's order.
  it.each([
    ["es", es],
    ["zh", zh],
  ] as const)("%s translates every English message", (_, messages) => {
    expect(keysOf(messages)).toEqual(keysOf(en))
  })

  it.each([
    ["es", es],
    ["zh", zh],
  ] as const)("%s leaves no message empty", (_, messages) => {
    for (const key of keysOf(messages))
      expect(messageAt(messages, key).trim(), key).not.toBe("")
  })

  it.each([
    ["es", es],
    ["zh", zh],
  ] as const)("%s keeps every message's arguments and tags", (_, messages) => {
    const english = new Map(entries(en))
    for (const [key, message] of entries(messages)) {
      expect(shape(message), key).toEqual(shape(english.get(key)!))
    }
  })
})

describe("the words", () => {
  // No prices and no payments anywhere (owner, 2026-10-04): one costume is
  // free, then Kostuma Pro's waitlist. Only the Terms' word on other shops
  // speaks of their prices.
  const priced =
    /[$€£¥]|\b(usd|eur|prices?|precios?|per costume)\b|por disfraz|价格|每套/i
  const shops = "Terms.sections.shops."

  it.each([
    ["en", en],
    ["es", es],
    ["zh", zh],
  ] as const)("%s names no price and no currency", (_, messages) => {
    for (const key of keysOf(messages)) {
      if (key.startsWith(shops)) continue
      expect(messageAt(messages, key), key).not.toMatch(priced)
    }
  })
})

/** The message at a dotted key. */
function messageAt(messages: object, key: string) {
  return key
    .split(".")
    .reduce<unknown>(
      (group, part) => (group as Record<string, unknown>)[part],
      messages
    ) as string
}

function keysOf(messages: object, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : keysOf(value as object, `${prefix}${key}.`)
  )
}
