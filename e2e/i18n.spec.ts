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
        "Se acerca la noche más oscura.",
        "Elige tu disfraz",
        "sábado, 31 de octubre",
      ],
      ["/zh", "最黑暗的夜晚即将来临。", "挑选你的装扮", "10月31日星期六"],
    ]) {
      await page.goto(path)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title)
      await expect(page.getByRole("link", { name: choose })).toBeVisible()
      await expect(page.getByText(date)).toBeVisible()
    }
    // Chinese headlines break where their messages say (<wbr>), never
    // inside a word, in the brush face kept for Chinese headings.
    const headline = page.getByRole("heading", { level: 1 })
    await expect(headline.locator("wbr")).toHaveCount(2)
    await expect(headline).toHaveCSS("word-break", "keep-all")
    await expect(headline).toHaveCSS(
      "font-family",
      /--font-cjk-heading|Ma Shan Zheng|cjk/i
    )
  })

  test("every costume speaks the visitor's language, names and people as they are", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    for (const [path, film, lore, piece] of [
      [
        "/es/costumes/freddy-krueger",
        "Pesadilla en la calle del infierno (1984)",
        "Un asesino de niños al que los padres de Springwood quemaron vivo",
        "Suéter a rayas rojas y verdes",
      ],
      [
        "/zh/costumes/freddy-krueger",
        "《猛鬼街》（1984）",
        "一个被 Springwood 的家长们活活烧死的儿童杀手",
        "红绿条纹毛衣",
      ],
    ]) {
      await page.goto(path)
      const main = page.getByRole("main")
      await expect(
        main.getByRole("heading", { level: 1, name: "Freddy Krueger" })
      ).toBeVisible()
      await expect(main.getByText(film)).toBeVisible()
      await expect(main.getByText(lore, { exact: false })).toBeVisible()
      await expect(main.getByText(piece)).toBeVisible()
      // The people credited stay as they are.
      await expect(main.getByText("Robert Englund")).toBeVisible()
    }
    // The list, too: each film under its local title.
    await page.goto("/zh")
    await expect(
      page
        .getByRole("region", { name: "装扮" })
        .getByRole("link", { name: /Freddy Krueger/ })
    ).toContainText("《猛鬼街》（1984）")
    expect(errors).toEqual([])
  })

  test("the default locale's prefix redirects to the root", async ({
    page,
  }) => {
    await page.goto("/en")
    await expect(page).toHaveURL(/\/$/)
  })

  test("names each page's versions in every language for search engines", async ({
    request,
    baseURL,
  }) => {
    // In the page's head, on the site's own address (lib/seo.ts), never in
    // a header built from whatever host served the request.
    const response = await request.get("/es", { maxRedirects: 0 })
    expect(response.headers()["link"] ?? "").not.toContain("hreflang")
    const alternates = (await response.text()).matchAll(
      /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi
    )
    const at = (path: string) => new URL(path, baseURL).href
    // Compared as addresses: Next writes the root without its slash.
    expect(
      Object.fromEntries(
        alternates.map(([, tag, href]) => [tag, new URL(href).href])
      )
    ).toEqual({
      en: at("/"),
      es: at("/es"),
      "zh-Hans": at("/zh"),
      "x-default": at("/"),
    })
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
  for (const [path, tag, title, costumes] of [
    ["/no-such-page", "en", "Lost in the dark", 'href="/#costumes"'],
    [
      "/es/no-such-page",
      "es",
      "Perdido en la oscuridad",
      'href="/es#costumes"',
    ],
    ["/zh/a/b", "zh-Hans", "迷失在黑暗中", 'href="/zh#costumes"'],
    ["/missing.txt", "en", "Lost in the dark", 'href="/#costumes"'],
  ]) {
    test(`${path} is a server-rendered 404 in ${tag}`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(404)
      const html = await response.text()
      // Server-rendered: the page's own <html>, not Next's error shell.
      expect(html).toContain(`<html lang="${tag}"`)
      expect(html).not.toContain("__next_error__")
      expect(html).toContain(title)
      // A mistyped costume address: the costumes, one press away.
      expect(html).toContain(costumes)
    })
  }
})
