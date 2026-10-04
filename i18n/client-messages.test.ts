import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"

import { CLIENT_NAMESPACES, clientMessages } from "./client-messages"

const ROOT = path.resolve(__dirname, "..")

/** The app's own source files, tests aside. */
function sources(dir = ROOT): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())
      return /^(node_modules|\.next.*|\.git|e2e.*|scripts|test-results)$/.test(
        entry.name
      )
        ? []
        : sources(full)
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)
      ? [full]
      : []
  })
}

const code = new Map(
  sources().map((file) => [file, readFileSync(file, "utf8")])
)
const isClient = (text: string) => /^\s*["']use client["']/.test(text)

/** A local import's file, if it is one of the app's. */
function resolve(spec: string, from: string) {
  const base = spec.startsWith("@/")
    ? path.join(ROOT, spec.slice(2))
    : spec.startsWith(".")
      ? path.resolve(path.dirname(from), spec)
      : null
  if (!base) return null
  for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"])
    if (code.has(base + ext)) return base + ext
  return null
}

/**
 * Every file that runs in the browser: the client components, and what
 * they import of the app's own code.
 */
function browserFiles() {
  const seen = new Set<string>()
  const queue = [...code].filter(([, text]) => isClient(text)).map(([f]) => f)
  while (queue.length > 0) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    for (const [, spec] of code.get(file)!.matchAll(/from\s+"([^"]+)"/g)) {
      const next = resolve(spec, file)
      if (next && !seen.has(next)) queue.push(next)
    }
  }
  return [...seen]
}

describe("the messages sent to the browser", () => {
  it("hold every namespace the browser's code translates with", () => {
    const used = new Set<string>()
    for (const file of browserFiles()) {
      const text = code.get(file)!
      // All of them, or none to pick from: the list can't serve it.
      expect(text, file).not.toMatch(/useTranslations\(\s*\)|useMessages\(/)
      for (const [, name] of text.matchAll(/useTranslations\(\s*"([^".]+)/g))
        used.add(name)
    }
    expect(used.size).toBeGreaterThan(5)
    expect(
      [...used].filter((name) => !CLIENT_NAMESPACES.includes(name as never))
    ).toEqual([])
  })

  it("leave the legal documents on the server", () => {
    const sent = clientMessages(en)
    expect(Object.keys(sent).sort()).toEqual([...CLIENT_NAMESPACES].sort())
    expect(sent).not.toHaveProperty("Terms")
    expect(sent).not.toHaveProperty("Privacy")
    const size = (value: unknown) => JSON.stringify(value).length
    expect(size(sent)).toBeLessThan(size(en) / 2)
  })
})
