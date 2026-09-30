import { expect, test } from "@playwright/test"

import { collectErrors } from "./console"

test.describe("languages", () => {
  test("English lives at the root, dark on a light system", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.locator("html")).toHaveClass(/\bdark\b/)
    const background = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    )
    // The warm black of the palette: nowhere near white.
    expect(background).not.toMatch(/rgb\(255, 255, 255\)/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  for (const [path, tag] of [
    ["/es", "es"],
    ["/zh", "zh-Hans"],
  ]) {
    test(`${path} is served in ${tag}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator("html")).toHaveAttribute("lang", tag)
    })
  }

  test("Spanish and Chinese pages speak their language", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-01T12:00:00Z") })
    for (const [path, title, choose, date] of [
      [
        "/es",
        "Se acerca el día más oscuro.",
        "Elige tu disfraz",
        "sábado, 31 de octubre",
      ],
      ["/zh", "最黑暗的一天即将来临。", "挑选你的装扮", "10月31日星期六"],
    ]) {
      await page.goto(path)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title)
      await expect(page.getByRole("link", { name: choose })).toBeVisible()
      await expect(page.getByText(date)).toBeVisible()
    }
  })

  test("the default locale's prefix redirects to the root", async ({
    page,
  }) => {
    await page.goto("/en")
    await expect(page).toHaveURL(/\/$/)
  })

  test("sends alternate links for search engines", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 })
    const links = response.headers()["link"] ?? ""
    expect(links).toContain('hreflang="es"')
    expect(links).toContain('hreflang="x-default"')
  })

  test("language links are never prefetched", async ({ page }) => {
    // A prefetch carries the language cookie of its moment; the click that
    // follows changes it, so a prefetched answer would be the wrong one.
    const prefetched: string[] = []
    page.on("request", (request) => {
      const { pathname } = new URL(request.url())
      if (
        request.headers()["next-router-prefetch"] &&
        ["/en", "/es", "/zh"].includes(pathname)
      ) {
        prefetched.push(pathname)
      }
    })
    await page.goto("/")
    await page
      .getByRole("contentinfo")
      // The label is in the page's own language.
      .getByRole("navigation", { name: /^(Language|Idioma|语言)$/ })
      .scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    expect(prefetched).toEqual([])
  })

  test("switching languages keeps the page and logs no errors", async ({
    page,
  }) => {
    const errors = collectErrors(page)

    // The footer's language links: the header's menu hides on small screens.
    const language = (name: string) =>
      page
        .getByRole("contentinfo")
        // The label is in the page's own language.
        .getByRole("navigation", { name: /^(Language|Idioma|语言)$/ })
        .getByRole("link", { name })
    await page.goto("/")
    await language("Español").click()
    await expect(page).toHaveURL(/\/es$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "es")

    await language("English").click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")

    expect(errors).toEqual([])
  })
})

test.describe("unknown pages", () => {
  for (const [path, tag, title] of [
    ["/no-such-page", "en", "Lost in the dark"],
    ["/es/no-such-page", "es", "Perdido en la oscuridad"],
    ["/zh/a/b", "zh-Hans", "迷失在黑暗中"],
    ["/missing.txt", "en", "Lost in the dark"],
  ]) {
    test(`${path} is a server-rendered 404 in ${tag}`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(404)
      const html = await response.text()
      // Server-rendered: the page's own <html>, not Next's error shell.
      expect(html).toContain(`<html lang="${tag}"`)
      expect(html).not.toContain("__next_error__")
      expect(html).toContain(title)
    })
  }
})
