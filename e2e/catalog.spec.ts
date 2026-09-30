import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

const costumes = (page: Page) => page.getByRole("region", { name: "Costumes" })

/** Where the costumes' top edge is, from the top of the window. */
const costumesTop = (page: Page) =>
  costumes(page).evaluate((section) =>
    Math.round(section.getBoundingClientRect().top)
  )

/** Scrolled to the costumes: their top just under the 64 px header. */
const expectAtCostumes = (page: Page) =>
  expect.poll(() => costumesTop(page)).toBe(64)

test.describe("browsing the costumes", () => {
  test("the home page shows all 100 costumes, each a link to its page", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    const links = costumes(page).getByRole("link")
    await expect(links).toHaveCount(100)
    const hrefs = await links.evaluateAll((all) =>
      all.map((link) => link.getAttribute("href"))
    )
    for (const href of hrefs) expect(href).toMatch(/^\/costumes\/[a-z0-9-]+$/)
    expect(new Set(hrefs).size).toBe(100)
    // In the owner's order, with no ranks, badges or headings on screen.
    await expect(links.first()).toHaveText("Ghostface")
    await expect(links.last()).toHaveText("Alice")
    await expect(costumes(page)).not.toContainText(/No\. ?\d|New blood/)
    expect(errors).toEqual([])
  })

  test("a card opens the costume's one-sheet", async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    await costumes(page).getByRole("link", { name: "Ghostface" }).click()
    await expect(page).toHaveURL(/\/costumes\/ghostface$/)
    await expect(page).toHaveTitle("Ghostface costume · Kostuma")
    await expect(
      page.getByRole("heading", { level: 1, name: "Ghostface" })
    ).toBeVisible()
    await expect(page.getByText("Scream (1996)").first()).toBeVisible()
    for (const section of [
      "The lore",
      "The look",
      "Behind the screams",
      "Credits",
    ]) {
      await expect(
        page.getByRole("heading", { level: 2, name: section })
      ).toBeVisible()
    }
    await expect(
      page.getByRole("listitem").filter({ hasText: "White mask" })
    ).toBeVisible()
    await expect(page.getByRole("term").first()).toHaveText("Created by")
    expect(errors).toEqual([])
  })

  test("the first costume leads on, the last one back, by name only", async ({
    page,
  }) => {
    await page.goto("/costumes/ghostface")
    const neighbors = page.getByRole("navigation", {
      name: "Previous and next costumes",
    })
    await expect(neighbors.getByRole("link")).toHaveCount(1)
    await neighbors.getByRole("link", { name: /Next\s*Michael Myers/ }).click()
    await expect(page).toHaveURL(/\/costumes\/michael-myers$/)

    await page.goto("/costumes/alice")
    await expect(neighbors.getByRole("link")).toHaveCount(1)
    await expect(
      neighbors.getByRole("link", {
        name: /Previous\s*Billy Chapman \(Killer Santa\)/,
      })
    ).toHaveAttribute("href", "/costumes/billy-chapman-killer-santa")
  })

  test("more from the same film, else the costumes that follow", async ({
    page,
  }) => {
    await page.goto("/costumes/jack-torrance")
    const sameFilm = page.getByRole("region", {
      name: "More from The Shining",
    })
    await expect(sameFilm.getByRole("link")).toHaveText([
      "The Grady Twins",
      "Danny Torrance",
    ])

    // The last costume wraps around to the first ones.
    await page.goto("/costumes/alice")
    const more = page.getByRole("region", { name: "More costumes" })
    await expect(more.getByRole("link")).toHaveCount(4)
    await expect(more.getByRole("link").first()).toHaveText("Ghostface")
  })

  test("the breadcrumb leads back to the costumes on the home page", async ({
    page,
  }) => {
    await page.goto("/costumes/michael-myers")
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" })
    await expect(crumbs.getByText("Michael Myers")).toHaveAttribute(
      "aria-current",
      "page"
    )
    await crumbs.getByRole("link", { name: "Costumes" }).click()
    await expect(page).toHaveURL(/\/#costumes$/)
    await expectAtCostumes(page)
  })

  test("the header's Costumes scrolls to them, from any page", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the menu holds the link on small screens")
    await page.goto("/costumes/ghostface")
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Costumes" })
      .click()
    await expect(page).toHaveURL(/\/#costumes$/)
    await expectAtCostumes(page)

    // Already home, at the top: the same link scrolls down to them.
    await page.goto("/")
    expect(await costumesTop(page)).toBeGreaterThan(300)
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Costumes" })
      .click()
    await expectAtCostumes(page)
  })

  test("the menu's Costumes closes it and shows them", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "small screens only")
    await page.goto("/")
    await page.getByRole("button", { name: "Open the menu" }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await menu.getByRole("link", { name: "Costumes" }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/\/#costumes$/)
    await expectAtCostumes(page)
  })

  test("cards prefetch their page when hovered, not when scrolled past", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "no hover on touch screens")
    // Every page renders per request: a prefetch costs the server a render.
    const asked: string[] = []
    page.on("request", (request) => {
      const { pathname } = new URL(request.url())
      if (pathname.startsWith("/costumes/")) asked.push(pathname)
    })
    await page.goto("/")
    // Down to the last card, half a screen at a time, as a reader would.
    const lastCard = costumes(page).getByRole("article").last()
    const end = await lastCard.evaluate(
      (card) => card.getBoundingClientRect().top + window.scrollY
    )
    for (let y = 0; y <= end; y += 450) {
      await page.evaluate((top) => window.scrollTo(0, top), y)
      await page.waitForTimeout(100)
    }
    await expect(lastCard).toBeInViewport()
    await page.waitForTimeout(1000)
    expect(asked).toEqual([])

    await costumes(page).getByRole("link", { name: "Alice" }).hover()
    await expect.poll(() => asked).toContain("/costumes/alice")
    expect(new Set(asked)).toEqual(new Set(["/costumes/alice"]))
  })

  test("links keep the language: the Spanish breadcrumb", async ({ page }) => {
    await page.goto("/es/costumes/ghostface")
    await expect(
      page
        .getByRole("navigation", { name: "Breadcrumb" })
        .getByRole("link", { name: "Costumes" })
    ).toHaveAttribute("href", "/es#costumes")
    await expect(
      page
        .getByRole("navigation", { name: "Previous and next costumes" })
        .getByRole("link")
    ).toHaveAttribute("href", "/es/costumes/michael-myers")
  })

  test("an unknown costume is a 404", async ({ page }) => {
    for (const path of [
      "/costumes/no-such-costume",
      "/costumes/Ghostface",
      "/es/costumes/no-such-costume",
    ]) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(404)
    }
  })

  test("the page never scrolls sideways", async ({ page }) => {
    for (const path of ["/", "/costumes/nikki-freaky-nikki-freeman"]) {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })

  test("no section clips its fog, so no line marks where it ends", async ({
    page,
  }) => {
    for (const path of ["/", "/costumes/ghostface", "/no-such-page"]) {
      await page.goto(path)
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll(".fog")].flatMap((fog) => {
          const own = getComputedStyle(fog)
          const parent = getComputedStyle(fog.parentElement!)
          return own.zIndex === "-1" &&
            own.overflowY === "visible" &&
            parent.overflowY === "visible"
            ? []
            : [fog.parentElement!.tagName]
        })
      )
      expect(clipped, path).toEqual([])
    }
  })
})

test.describe("the cue mark on a costume link", () => {
  test("burns while the costume's page loads", async ({ page }) => {
    // Hold the costume page's requests (prefetches included) for 1.5 s.
    await page.route(
      (url) => url.pathname === "/costumes/ghostface",
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        await route.continue()
      }
    )
    await page.goto("/")
    const mark = page.locator(".cue-mark")
    await costumes(page).getByRole("link", { name: "Ghostface" }).click()
    await expect(mark).toHaveAttribute("data-active")
    await expect(page.getByRole("status")).toHaveText("Loading…")
    await expect(page).toHaveURL(/\/costumes\/ghostface$/)
    await expect(mark).not.toHaveAttribute("data-active")
  })
})

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" })

  test("reel changes between costumes and home log no errors", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    await costumes(page).getByRole("link", { name: "Ghostface" }).click()
    await expect(
      page.getByRole("heading", { level: 1, name: "Ghostface" })
    ).toBeVisible()
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Costumes" })
      .click()
    await expectAtCostumes(page)
    expect(errors).toEqual([])
  })
})

test.describe("costumes without JavaScript", () => {
  // Motion on: the fade-up is what could leave a card invisible.
  test.use({ javaScriptEnabled: false, reducedMotion: "no-preference" })

  test("the home page's last costume fades up when scrolled to", async ({
    page,
  }) => {
    await page.goto("/")
    const last = costumes(page).getByRole("article").last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeInViewport()
    await expect
      .poll(() => last.evaluate((card) => getComputedStyle(card).opacity))
      .toBe("1")
  })

  test("a costume's page reads in full", async ({ page }) => {
    await page.goto("/costumes/michael-myers")
    await expect(
      page.getByRole("heading", { level: 1, name: "Michael Myers" })
    ).toBeVisible()
    await expect(page.getByText(/Smith's Grove Sanitarium/)).toBeVisible()
    await expect(page.getByText("John Carpenter & Debra Hill")).toBeVisible()
  })
})
