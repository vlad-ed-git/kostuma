// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { routing } from "@/i18n/routing"
import { getCostumes } from "@/lib/catalog"
import { PRIVACY_UPDATED, TERMS_UPDATED } from "@/lib/legal"
import { urlIn } from "@/lib/seo"

import sitemap from "./sitemap"

beforeEach(() => {
  vi.stubEnv("SITE_URL", "")
})
afterEach(() => {
  vi.unstubAllEnvs()
})

const pages = [
  "/",
  ...getCostumes().map(({ slug }) => `/costumes/${slug}`),
  "/feedback",
  "/terms",
  "/privacy",
]

describe("the sitemap", () => {
  it("lists every public page in every language, once", () => {
    const urls = sitemap().map(({ url }) => url)
    expect(urls).toHaveLength(pages.length * routing.locales.length)
    expect(new Set(urls).size).toBe(urls.length)
    for (const path of pages)
      for (const locale of routing.locales)
        expect(urls).toContain(urlIn(path, locale))
  })

  it("leaves out the pages that are each visitor's own", () => {
    for (const { url } of sitemap())
      expect(new URL(url).pathname).not.toMatch(
        /^(\/(es|zh))?\/(basket|account|sign-in|register|reset-password|api)(\/|$)/
      )
  })

  it("names each page's versions in every language, itself among them", () => {
    for (const { url, alternates } of sitemap()) {
      const languages = alternates?.languages ?? {}
      expect(Object.keys(languages).sort()).toEqual([
        "en",
        "es",
        "x-default",
        "zh-Hans",
      ])
      expect(Object.values(languages)).toContain(url)
      expect(languages["x-default"]).toBe(languages.en)
    }
  })

  it("dates the legal pages by their last change, in every language", () => {
    const dated = sitemap().filter(({ lastModified }) => lastModified)
    expect(
      dated.map(({ url, lastModified }) => [
        new URL(url).pathname,
        lastModified,
      ])
    ).toEqual([
      ["/terms", TERMS_UPDATED],
      ["/es/terms", TERMS_UPDATED],
      ["/zh/terms", TERMS_UPDATED],
      ["/privacy", PRIVACY_UPDATED],
      ["/es/privacy", PRIVACY_UPDATED],
      ["/zh/privacy", PRIVACY_UPDATED],
    ])
  })
})
