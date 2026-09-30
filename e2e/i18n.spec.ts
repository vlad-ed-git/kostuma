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

  test("switching languages keeps the page and logs no errors", async ({
    page,
  }) => {
    const errors = collectErrors(page)

    // The footer's switcher: the header's hides on small screens.
    const language = () => page.getByRole("contentinfo").getByLabel("Language")
    await page.goto("/")
    await language().selectOption("es")
    await expect(page).toHaveURL(/\/es$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "es")

    await language().selectOption("en")
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")

    expect(errors).toEqual([])
  })
})

test.describe("unknown pages", () => {
  for (const [path, tag] of [
    ["/no-such-page", "en"],
    ["/es/no-such-page", "es"],
    ["/zh/a/b", "zh-Hans"],
    ["/missing.txt", "en"],
  ]) {
    test(`${path} is a server-rendered 404 in ${tag}`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(404)
      const html = await response.text()
      // Server-rendered: the page's own <html>, not Next's error shell.
      expect(html).toContain(`<html lang="${tag}"`)
      expect(html).not.toContain("__next_error__")
      expect(html).toContain("Lost in the dark")
    })
  }
})
