import { expect, test, type Locator, type Page } from "@playwright/test"
import sharp from "sharp"

import { collectErrors } from "./console"

const costumes = (page: Page) => page.getByRole("region", { name: "Costumes" })

/** Where the costumes' top edge is, from the top of the window. */
const costumesTop = (page: Page) =>
  costumes(page).evaluate((section) =>
    Math.round(section.getBoundingClientRect().top)
  )

/** Scrolled to the costumes: their top just under the 64 px header. */
const expectAtCostumes = (page: Page, timeout?: number) =>
  expect.poll(() => costumesTop(page), { timeout }).toBe(64)

/** Whether an image has arrived, with its pixels. */
const hasLoaded = (img: Locator) =>
  img.evaluate(
    (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
  )

/** The filter on a photo's frame: a silhouette until the reveal. */
const revealFilter = (img: Locator) =>
  img.evaluate(
    (element) => getComputedStyle(element.closest(".photo-reveal")!).filter
  )

/** The file an image was loaded from (picked from its srcset). */
const loadedFrom = (img: Locator) =>
  img.evaluate((element: HTMLImageElement) => element.currentSrc)

const storage = "/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com"

test.describe("browsing the costumes", () => {
  test("the home page shows all 82 costumes, each a link to its page", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    const links = costumes(page).getByRole("link")
    await expect(links).toHaveCount(82)
    const hrefs = await links.evaluateAll((all) =>
      all.map((link) => link.getAttribute("href"))
    )
    for (const href of hrefs) expect(href).toMatch(/^\/costumes\/[a-z0-9-]+$/)
    expect(new Set(hrefs).size).toBe(82)
    // By year, latest first, with no ranks, badges or headings on screen.
    await expect(links.first()).toContainText("Nikki 'Freaky Nikki' Freeman")
    await expect(links.last()).toContainText("Count Orlok")
    await expect(costumes(page)).not.toContainText(/No\. ?\d|New blood/)
    expect(errors).toEqual([])
  })

  test("a costume row opens the costume's page", async ({ page }) => {
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
    // The latest film first, the oldest last.
    await page.goto("/costumes/nikki-freaky-nikki-freeman")
    const neighbors = page.getByRole("navigation", {
      name: "Previous and next costumes",
    })
    await expect(neighbors.getByRole("link")).toHaveCount(1)
    await neighbors.getByRole("link", { name: /Next\s*Pirate Clark/ }).click()
    await expect(page).toHaveURL(/\/costumes\/pirate-clark$/)

    await page.goto("/costumes/count-orlok")
    await expect(neighbors.getByRole("link")).toHaveCount(1)
    await expect(
      neighbors.getByRole("link", {
        name: /Previous\s*The Phantom of the Opera/,
      })
    ).toHaveAttribute("href", "/costumes/the-phantom-of-the-opera")
  })

  test("more from the same film, else the costumes that follow", async ({
    page,
  }) => {
    await page.goto("/costumes/jack-torrance")
    const sameFilm = page.getByRole("region", {
      name: "More from The Shining",
    })
    await expect(sameFilm.getByRole("link")).toContainText([
      "The Grady Twins",
      "Danny Torrance",
    ])

    // Next to last: the last costume, then around to the first ones.
    await page.goto("/costumes/the-phantom-of-the-opera")
    const more = page.getByRole("region", { name: "More costumes" })
    await expect(more.getByRole("link")).toHaveCount(4)
    await expect(more.getByRole("link")).toContainText([
      "Count Orlok",
      "Nikki 'Freaky Nikki' Freeman",
      "Pirate Clark",
      "Aunt Gladys",
    ])
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

  test("rows prefetch their page when hovered, not when scrolled past", async ({
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
    // Down to the last row, half a screen at a time, as a reader would.
    const lastCard = costumes(page).getByRole("listitem").last()
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
    await page.goto("/es/costumes/nikki-freaky-nikki-freeman")
    await expect(
      page
        .getByRole("navigation", { name: "Ruta de navegación" })
        .getByRole("link", { name: "Disfraces" })
    ).toHaveAttribute("href", "/es#costumes")
    await expect(
      page
        .getByRole("navigation", { name: "Disfraz anterior y siguiente" })
        .getByRole("link")
    ).toHaveAttribute("href", "/es/costumes/pirate-clark")
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

  test("no line marks where the title ends and the costumes begin", async ({
    page,
  }) => {
    // The owner's rule, measured: brightness down the left margin, row by
    // row, across the bottom edge of the title (fog, figure and light all
    // fade out before it). Motion is still, so nothing drifts meanwhile.
    await page.goto("/")
    const title = page.locator("[data-title-card]")
    const bottom = await title.evaluate(
      (el) => el.getBoundingClientRect().bottom + window.scrollY
    )
    await page.evaluate((y) => window.scrollTo(0, y - 300), bottom)
    const edge = await title.evaluate((el) =>
      Math.round(el.getBoundingClientRect().bottom)
    )
    // The 12 px at the far left: inside the smallest page margin (16 px),
    // so no thumbnail or text falls in the strip.
    // Without the film grain: it is noise by design, not a line.
    await page.addStyleTag({
      content: ".film-grain { display: none !important; }",
    })
    const png = await page.screenshot({
      clip: { x: 0, y: edge - 60, width: 12, height: 120 },
    })
    const { data, info } = await sharp(png)
      .raw()
      .toBuffer({ resolveWithObject: true })
    const rows = Array.from({ length: info.height }, (_, row) => {
      let sum = 0
      for (let x = 0; x < info.width; x++) {
        const i = (row * info.width + x) * info.channels
        sum += data[i] + data[i + 1] + data[i + 2]
      }
      return sum / (info.width * 3)
    })
    const jumps = rows.slice(1).map((value, i) => Math.abs(value - rows[i]))
    // A gradient steps by one level at most; the line this caught was 1.7.
    expect(Math.max(...jumps)).toBeLessThan(1.5)
  })
})

test.describe("the costume photos", () => {
  test("each row shows its costume's photo, from Storage through the optimizer", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    await costumes(page).scrollIntoViewIfNeeded()
    const rows = costumes(page).getByRole("listitem")
    for (const [index, file] of [
      [0, "nikki-freaky-nikki-freeman."],
      [1, "pirate-clark."],
    ] as const) {
      const img = rows.nth(index).locator("img")
      // The file the browser chose from the srcset.
      await expect
        .poll(() => loadedFrom(img), { timeout: 20_000 })
        .toContain(storage)
      expect(decodeURIComponent(await loadedFrom(img))).toContain(
        `costumes%2F${file}`
      )
      // Decorative in a list: the name is written next to it.
      await expect(img).toHaveAttribute("alt", "")
      await expect.poll(() => hasLoaded(img), { timeout: 20_000 }).toBe(true)
    }
    // No CSP violation, no failed image.
    expect(errors).toEqual([])
  })

  test("a costume's page shows its photo, described, without shifting the page", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/costumes/ghostface")
    const photo = page.getByRole("img", { name: "Ghostface costume" })
    await expect(photo).toBeVisible()
    await expect.poll(() => hasLoaded(photo), { timeout: 20_000 }).toBe(true)
    // Contained in its frame, never cropped (owner).
    await expect(photo).toHaveCSS("object-fit", "contain")
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & {
              value: number
              hadRecentInput: boolean
            })[]) {
              if (!entry.hadRecentInput) total += entry.value
            }
          }).observe({ type: "layout-shift", buffered: true })
          setTimeout(() => resolve(total), 500)
        })
    )
    expect(shift).toBeLessThan(0.02)
    expect(errors).toEqual([])
  })

  test("with several photos, the thumbnails choose the large one", async ({
    page,
  }) => {
    await page.goto("/costumes/dollface")
    const choices = page.getByRole("group", { name: "Photos" })
    await expect(choices.getByRole("button")).toHaveCount(3)
    const large = page.getByRole("img", { name: "Dollface costume" })
    await expect(large).toHaveAttribute("src", /dollface\./)
    await choices.getByRole("button", { name: "Photo 2 of 3" }).click()
    await expect(large).toHaveAttribute("src", /strangers_1\./)
    await expect(
      choices.getByRole("button", { name: "Photo 2 of 3" })
    ).toHaveAttribute("aria-pressed", "true")
    await expect.poll(() => hasLoaded(large), { timeout: 20_000 }).toBe(true)

    // A costume with one photo has nothing to choose.
    await page.goto("/costumes/ghostface")
    await expect(page.getByRole("group", { name: "Photos" })).toHaveCount(0)
  })

  test("reduced motion: every photo is lit from the start", async ({
    page,
  }) => {
    await page.goto("/")
    // The last row, never scrolled to: no silhouette waiting there.
    const last = costumes(page).getByRole("listitem").last().locator("img")
    expect(await revealFilter(last)).toBe("none")
  })
})

test.describe("the costume photos, with motion", () => {
  test.use({ reducedMotion: "no-preference" })

  test("wait as silhouettes in the dark, and light up when seen", async ({
    page,
  }) => {
    await page.goto("/")
    const row = costumes(page).getByRole("listitem").nth(9)
    const img = row.locator("img")
    // Not seen yet: a black silhouette in red light.
    expect(await revealFilter(img)).toMatch(/^brightness\(0\) drop-shadow/)
    await row.scrollIntoViewIfNeeded()
    await expect(img.locator("xpath=..")).toHaveAttribute("data-revealed", {
      timeout: 20_000,
    })
    // The light comes on and nothing is left on the photo.
    await expect.poll(() => revealFilter(img), { timeout: 15_000 }).toBe("none")
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
    // With every loop running, headless Chromium draws without a GPU and
    // other tests compete for the CPU: allow more time to settle.
    await expectAtCostumes(page, 15_000)
    expect(errors).toEqual([])
  })
})

test.describe("costumes without JavaScript", () => {
  // Motion on: the scroll light is what could leave a row faint.
  test.use({ javaScriptEnabled: false, reducedMotion: "no-preference" })

  test("the home page's last costume lights up when scrolled to", async ({
    page,
  }) => {
    await page.goto("/")
    const last = costumes(page).getByRole("listitem").last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeInViewport()
    await expect
      .poll(() => last.evaluate((card) => getComputedStyle(card).opacity))
      .toBe("1")
  })

  test("photos are lit, and the thumbnails that need scripts are hidden", async ({
    page,
  }) => {
    await page.goto("/costumes/dollface")
    const large = page.getByRole("img", { name: "Dollface costume" })
    await expect(large).toBeVisible()
    expect(await revealFilter(large)).toBe("none")
    await expect(page.getByRole("group", { name: "Photos" })).toBeHidden()
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
