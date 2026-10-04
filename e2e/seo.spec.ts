import { expect, test, type APIRequestContext } from "@playwright/test"

// What search engines and social networks read (spec §14b): the HTML the
// server sends, before any script runs, and the files beside it.
test.use({ javaScriptEnabled: false })

/** A PNG's width and height, from its header. */
async function pngSize(request: APIRequestContext, url: string) {
  const response = await request.get(url, { maxRedirects: 0 })
  expect(response.status(), url).toBe(200)
  expect(response.headers()["content-type"]).toBe("image/png")
  const png = await response.body()
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}

test.describe("every language's pages, indexed", () => {
  for (const { path, english, ogLocale, card } of [
    {
      path: "/",
      english: "/",
      ogLocale: "en_US",
      card: "/en/opengraph-image/card",
    },
    {
      path: "/es/costumes/freddy-krueger",
      english: "/costumes/freddy-krueger",
      ogLocale: "es_LA",
      card: "/es/costumes/freddy-krueger/opengraph-image/card",
    },
    {
      // No card of its own: the home page's, in its language.
      path: "/zh/terms",
      english: "/terms",
      ogLocale: "zh_CN",
      card: "/zh/opengraph-image/card",
    },
  ]) {
    test(`${path} names its address, its versions and its card`, async ({
      page,
      request,
      baseURL,
    }) => {
      const url = (path: string) => new URL(path, baseURL).href
      const versionIn = (prefix: string) =>
        url(english === "/" ? prefix || "/" : `${prefix}${english}`)

      await page.goto(path)
      const head = page.locator("head")
      // Compared as addresses: Next writes the root without its slash.
      const addressIn = async (selector: string, attribute: string) =>
        new URL((await head.locator(selector).getAttribute(attribute))!).href
      await expect(head.locator('meta[name="robots"]')).toHaveCount(0)
      expect(await addressIn('link[rel="canonical"]', "href")).toBe(url(path))
      const alternates = await head
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((links) =>
          links.map((link) => [
            link.getAttribute("hreflang"),
            new URL(link.getAttribute("href")!).href,
          ])
        )
      expect(Object.fromEntries(alternates)).toEqual({
        en: versionIn(""),
        es: versionIn("/es"),
        "zh-Hans": versionIn("/zh"),
        "x-default": versionIn(""),
      })

      expect(await addressIn('meta[property="og:url"]', "content")).toBe(
        url(path)
      )
      await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute(
        "content",
        ogLocale
      )
      const image = await head
        .locator('meta[property="og:image"]')
        .getAttribute("content")
      expect(new URL(image!).pathname).toBe(card)
      await expect(
        head.locator('meta[property="og:image:alt"]')
      ).not.toHaveAttribute("content", "")
      await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image"
      )
      // Served where it is named, never through a redirect.
      expect(await pngSize(request, image!)).toEqual({
        width: 1200,
        height: 630,
      })
    })
  }

  test("the pages that are each visitor's own stay out of search", async ({
    page,
  }) => {
    for (const path of ["/basket", "/es/sign-in", "/zh/register"]) {
      await page.goto(path)
      const head = page.locator("head")
      await expect(head.locator('meta[name="robots"]'), path).toHaveAttribute(
        "content",
        /noindex/
      )
      await expect(head.locator('link[rel="canonical"]'), path).toHaveCount(0)
      await expect(
        head.locator('link[rel="alternate"][hreflang]'),
        path
      ).toHaveCount(0)
    }
  })

  test("structured data describes the site, its collection and each costume", async ({
    page,
  }) => {
    const dataOf = async () =>
      JSON.parse(
        (await page
          .locator('script[type="application/ld+json"]')
          .textContent()) ?? ""
      )

    await page.goto("/zh")
    const home = await dataOf()
    expect(home["@context"]).toBe("https://schema.org")
    const [organization, website, list] = home["@graph"]
    expect(organization).toMatchObject({ "@type": "Organization" })
    expect(website).toMatchObject({ "@type": "WebSite", inLanguage: "zh-Hans" })
    expect(list).toMatchObject({ "@type": "ItemList", name: "装扮" })
    expect(list.itemListElement).toHaveLength(list.numberOfItems)
    await expect(
      page.getByRole("region", { name: "装扮" }).getByRole("listitem")
    ).toHaveCount(list.numberOfItems)

    await page.goto("/es/costumes/freddy-krueger")
    expect(await dataOf()).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Disfraces" },
        { position: 2, name: "Freddy Krueger" },
      ],
    })
  })
})

test.describe("the files beside the pages", () => {
  test("robots.txt opens the site and points at the sitemap", async ({
    request,
    baseURL,
  }) => {
    const robots = await (await request.get("/robots.txt")).text()
    expect(robots).toContain("Allow: /")
    expect(robots).toContain("Disallow: /api/")
    expect(robots).toContain(`Sitemap: ${new URL("/sitemap.xml", baseURL)}`)
  })

  test("the sitemap lists every page in every language", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get("/sitemap.xml")
    expect(response.headers()["content-type"]).toContain("xml")
    const xml = await response.text()
    const entries = xml.match(/<url>[\s\S]*?<\/url>/g) ?? []
    expect(entries.length % 3).toBe(0)
    const at = (path: string) => new URL(path, baseURL).toString()
    const freddy = entries.find((entry) =>
      entry.includes(`<loc>${at("/zh/costumes/freddy-krueger")}</loc>`)
    )
    expect(freddy).toContain(
      `hreflang="es" href="${at("/es/costumes/freddy-krueger")}"`
    )
    expect(freddy).toContain(
      `hreflang="x-default" href="${at("/costumes/freddy-krueger")}"`
    )
    for (const entry of entries)
      expect(entry.match(/<xhtml:link /g)).toHaveLength(4)
    expect(xml).toContain(`<loc>${at("/es/terms")}</loc>`)
    expect(xml).not.toContain("/basket")
    expect(xml).not.toContain("/sign-in")
  })

  test("a home screen gets Kostuma's name and its icons", async ({
    request,
  }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json()
    expect(manifest).toMatchObject({ name: "Kostuma", start_url: "/" })
    for (const { src, sizes } of manifest.icons) {
      const [width, height] = sizes.split("x").map(Number)
      expect(await pngSize(request, src)).toEqual({ width, height })
    }
    for (const [path, type] of [
      ["/favicon.ico", "image/x-icon"],
      ["/icon.svg", "image/svg+xml"],
      ["/apple-icon.png", "image/png"],
    ]) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect(response.headers()["content-type"], path).toBe(type)
    }
  })

  test("there is no card for a costume or a language Kostuma doesn't have", async ({
    request,
  }) => {
    for (const path of [
      "/es/costumes/nobody/opengraph-image/card",
      "/xx/opengraph-image/card",
      "/en/opengraph-image/another",
    ])
      expect((await request.get(path)).status(), path).toBe(404)
  })
})
