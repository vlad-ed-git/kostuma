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
  const shape = (message: string) => ({
    args: [...message.matchAll(/\{\s*([A-Za-z_]\w*)\s*[,}]/g)]
      .map(([, name]) => name)
      .sort(),
    tags: [...message.matchAll(/<(\w+)>/g)].map(([, name]) => name).sort(),
  })

  it.each([
    ["es", es],
    ["zh", zh],
  ] as const)("%s translates every English message", (_, messages) => {
    expect(keysOf(messages)).toEqual(keysOf(en))
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

function keysOf(messages: object, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : keysOf(value as object, `${prefix}${key}.`)
  )
}
