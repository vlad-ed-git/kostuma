import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

test.describe("site shell", () => {
  test("the skip link is the first stop and jumps past the header", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "keyboard navigation")
    await page.goto("/")
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "Skip to content" })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press("Enter")
    await expect(page.locator("main#content")).toBeFocused()
  })

  test("the header leads to the costumes and the basket", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the menu holds them on small screens")
    await page.goto("/")
    const nav = page.getByRole("banner").getByRole("navigation", {
      name: "Main",
    })
    await expect(nav.getByRole("link")).toHaveText([
      "Costumes",
      "My Pumpkin Basket",
    ])
    await expect(
      page.getByRole("button", { name: "Open the menu" })
    ).toBeHidden()
  })

  test("the menu opens, traps focus, and closes on Escape", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "small screens only")
    const errors = collectErrors(page)
    await page.goto("/")
    const trigger = page.getByRole("button", { name: "Open the menu" })
    await trigger.click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole("link", { name: "Costumes" })).toBeVisible()
    await expect(
      menu
        .getByRole("navigation", { name: "Language" })
        .getByRole("link", { name: "Español" })
    ).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })

  test("the header's language menu lists every language as a link", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the header's menu is for wide screens")
    const errors = collectErrors(page)
    await page.goto("/")
    const trigger = page.getByRole("button", { name: "Language: English" })
    await trigger.click()
    const menu = page.getByRole("menu")
    await expect(menu.getByRole("menuitem")).toHaveText([
      "English",
      "Español",
      "中文",
    ])
    await expect(menu.getByRole("menuitem", { name: "中文" })).toHaveAttribute(
      "href",
      "/zh"
    )
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await page.getByRole("menuitem", { name: "Español" }).click()
    await expect(page).toHaveURL(/\/es$/)
    await expect(
      page.getByRole("button", { name: "Idioma: Español" })
    ).toBeVisible()
    expect(errors).toEqual([])
  })

  test("the footer carries help and the fine print, no sign-off", async ({
    page,
  }) => {
    await page.goto("/")
    const footer = page.getByRole("contentinfo")
    await expect(footer.getByText("The end?")).toHaveCount(0)
    await expect(
      footer.getByRole("link", { name: "Report a bug" })
    ).toHaveAttribute("href", "/feedback?type=bug")
    await expect(
      footer.getByText("Horror imagery. Not intended for children.")
    ).toBeVisible()
  })

  test("pages render without errors or CSP violations", async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    await page.goto("/es/no-such-page")
    expect(errors).toEqual([])
  })
})

test.describe("the fonts", () => {
  test("ship with the app: every face loads, none from elsewhere", async ({
    page,
    baseURL,
  }) => {
    const fonts: string[] = []
    page.on("request", (request) => {
      if (request.resourceType() === "font") fonts.push(request.url())
    })
    await page.goto("/costumes/michael-myers")
    const faces = await page.evaluate(async () => {
      await document.fonts.ready
      const loaded = new Set(
        [...document.fonts]
          .filter((face) => face.status === "loaded")
          .map((face) => `${face.family.replace(/"/g, "")} ${face.style}`)
      )
      // The face each kind of text asks for first: titles, text, films.
      const first = (selector: string) => {
        const style = getComputedStyle(document.querySelector(selector)!)
        const family = style.fontFamily.split(",")[0].replace(/"/g, "").trim()
        return {
          family,
          style: style.fontStyle,
          loaded: loaded.has(`${family} ${style.fontStyle}`),
        }
      }
      return [first("h1"), first("main p.text-body-lg"), first("main p.italic")]
    })
    for (const face of faces)
      expect(face, face.family).toMatchObject({ loaded: true })
    expect(faces.map((face) => face.style)).toEqual([
      "normal",
      "normal",
      "italic",
    ])
    expect(fonts.length).toBeGreaterThan(0)
    for (const url of fonts)
      expect(new URL(url).origin).toBe(new URL(baseURL!).origin)
  })
})

test.describe("the cue mark", () => {
  test("burns while a slow page loads, then goes out", async ({ page }) => {
    await page.goto("/")
    // Hold the Spanish page's requests for 1.5 s. (e2e/catalog.spec.ts does
    // the same with a costume's link.)
    await page.route(
      (url) => url.pathname === "/es",
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        await route.continue()
      }
    )
    const mark = page.locator(".cue-mark")
    await expect(mark).not.toHaveAttribute("data-active")
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Español" })
      .click()
    await expect(mark).toHaveAttribute("data-active")
    await expect(mark).toBeVisible()
    await expect(page.getByRole("status")).toHaveText("Loading…")
    await expect(page).toHaveURL(/\/es$/)
    await expect(mark).not.toHaveAttribute("data-active")
    await expect(mark).toBeHidden()
  })
})

test.describe("film atmosphere", () => {
  const grainAnimation = (page: Page) =>
    page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".film-grain")!, "::before")
          .animationName
    )
  // The 404's VHS look (owner): the tape rolls through the home title and
  // the account pages' night, and their titles split into red and bone.
  const tapeAnimation = (page: Page, selector: string) =>
    page.evaluate(
      (selector) =>
        getComputedStyle(document.querySelector(selector)!, "::before")
          .animationName,
      selector
    )
  const splitTitle = (page: Page) =>
    page.evaluate(() => {
      const shadow = getComputedStyle(document.querySelector("h1")!).textShadow
      const offsets = [...shadow.matchAll(/(-?[\d.]+)px -?[\d.]+px/g)].map(
        ([, x]) => Number(x)
      )
      // A ghost on each side.
      return offsets.some((x) => x < 0) && offsets.some((x) => x > 0)
    })

  test("the grain dances", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    expect(await grainAnimation(page)).toBe("grain")
  })

  test("reduced motion stills every loop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    expect(await grainAnimation(page)).toBe("none")
    const flicker = await page.evaluate(
      () => getComputedStyle(document.querySelector(".flicker")!).animationName
    )
    expect(flicker).toBe("none")
    expect(await tapeAnimation(page, "[data-title-card] .vhs-tracking")).toBe(
      "none"
    )
  })

  test("the tape rolls through the title cards, and their titles split", async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    expect(await tapeAnimation(page, "[data-title-card] .vhs-tracking")).toBe(
      "vhs-roll"
    )
    expect(await splitTitle(page)).toBe(true)

    await page.goto("/sign-in")
    expect(await splitTitle(page)).toBe(true)
    // Phones show the form alone, without the night.
    if (!isMobile) {
      await expect(page.locator(".auth-tape")).toBeVisible()
      expect(await tapeAnimation(page, ".auth-tape")).toBe("vhs-roll")
    }
  })

  test("the header is clear over the title card, solid once scrolled", async ({
    page,
  }) => {
    await page.goto("/")
    const background = () =>
      page.evaluate(
        () =>
          getComputedStyle(document.querySelector(".site-header")!)
            .backgroundColor
      )
    // Chromium reports the keyframe's transparent as rgba() or oklab().
    const clear = /^(rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\))$/
    expect(await background()).toMatch(clear)
    await page.evaluate(() => window.scrollTo(0, 200))
    await expect.poll(background).not.toMatch(clear)
  })
})

test.describe("Chinese pages", () => {
  test("drop Latin tracking; the wordmark stays Latin", async ({ page }) => {
    await page.goto("/zh")
    const spacing = (selector: string) =>
      page.evaluate(
        (target) =>
          getComputedStyle(document.querySelector(target)!).letterSpacing,
        selector
      )
    expect(await spacing("h1")).toBe("normal")
    await expect(page.getByRole("banner").locator(".wordmark")).toHaveAttribute(
      "lang",
      "en"
    )
  })
})

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("every part of the page can still be read", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("banner")).toBeVisible()
    await expect(page.getByRole("contentinfo")).toBeVisible()
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Costumes" })
    ).toHaveAttribute("href", "/#costumes")
  })
})
