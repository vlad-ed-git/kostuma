import { describe, expect, it } from "vitest"

import en from "./en.json"
import es from "./es.json"
import zh from "./zh.json"

// English is the source of truth. Spanish and Chinese are translated later
// (they fall back to English key by key); until then they may be partial,
// but must never hold keys English does not have.
const translations = { es, zh }

describe("messages", () => {
  it("English messages are all non-empty text", () => {
    for (const [key, value] of entries(en)) {
      expect(value.trim(), key).not.toBe("")
    }
  })

  it.each(Object.entries(translations))(
    "%s only translates keys that exist in English",
    (_, messages) => {
      const english = new Set(entries(en).map(([key]) => key))
      for (const [key, value] of entries(messages)) {
        expect(english.has(key), `stray key ${key}`).toBe(true)
        expect(value.trim(), key).not.toBe("")
      }
    }
  )

  it("English messages keep their ICU placeholders balanced", () => {
    for (const [key, value] of entries(en)) {
      const opened = value.split("{").length - 1
      const closed = value.split("}").length - 1
      expect(opened, key).toBe(closed)
    }
  })
})

/** Every message as [dotted key, text]. */
function entries(messages: object, prefix = ""): [string, string][] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : entries(value as object, `${prefix}${key}.`)
  )
}
