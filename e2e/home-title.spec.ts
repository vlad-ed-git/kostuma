import { expect, test, type Page } from "@playwright/test"

/** The three lines under the countdown: the way through, in order. */
const steps = (page: Page) =>
  page
    .locator("[data-title-card] ol", {
      has: page.getByRole("link", { name: "Choose your costume" }),
    })
    .locator("li")

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024

test.describe("the home title", () => {
  test("says the way through in three lines, the first leading to the costumes", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(steps(page)).toHaveText([
      "Choose your costume",
      "Try it on",
      "Apply makeup",
    ])
    const choose = steps(page)
      .first()
      .getByRole("link", { name: "Choose your costume" })
    await expect(choose).toHaveAttribute("href", "/#costumes")
    // The one line that goes somewhere looks it: underlined in blood.
    await expect(choose.getByText("Choose your costume")).toHaveCSS(
      "text-decoration-line",
      "underline"
    )
    // Words, not links: the Fitting Room lives in the basket.
    await expect(steps(page).nth(1).getByRole("link")).toHaveCount(0)
    await expect(steps(page).nth(2).getByRole("link")).toHaveCount(0)
  })

  test("on a wide screen the lines stand beside the film strip, their tops level; on a phone under the countdown", async ({
    page,
  }) => {
    await page.goto("/")
    const strip = (await page
      .getByRole("img", { name: /^A real transformation/ })
      .boundingBox())!
    const list = (await steps(page).first().boundingBox())!
    const countdown = (await page.getByRole("timer").boundingBox())!
    if (wide(page)) {
      // The line box rises a fifth of a letter, so the capitals meet the
      // strip's top edge.
      expect(strip.y - list.y).toBeGreaterThanOrEqual(0)
      expect(strip.y - list.y).toBeLessThan(14)
      expect(list.x).toBeGreaterThan(strip.x + strip.width)
      expect(countdown.y + countdown.height).toBeLessThanOrEqual(list.y)
    } else {
      expect(list.y).toBeGreaterThan(countdown.y + countdown.height)
    }
  })

  test("the hooded figure stands in the window on phones only, and the empty window never flickers", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    const figure = page.locator(".apparition .figure")
    const lamp = page.locator(".apparition .lamp")
    const lampAnimation = () =>
      lamp.evaluate((element) => getComputedStyle(element).animationName)
    if ((page.viewportSize()?.width ?? 0) >= 640) {
      await expect(figure).toBeHidden()
      expect(await lampAnimation()).toBe("none")
    } else {
      await expect(figure).toBeVisible()
      expect(await lampAnimation()).toBe("lamp")
    }
  })

  test("blood drips from “Choose your costume” down past the three lines", async ({
    page,
  }) => {
    await page.goto("/")
    const link = page.getByRole("link", { name: "Choose your costume" })
    const drip = (await link.locator(".blood-drip svg").boundingBox())!
    // The words alone, not the link (which holds the drip too).
    const word = await link.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element.firstChild!)
      const { x, y, width, height } = range.getBoundingClientRect()
      return { x, y, width, height }
    })
    const last = (await steps(page).nth(2).boundingBox())!
    expect(drip.x).toBeGreaterThanOrEqual(word.x + word.width)
    expect(drip.y).toBeLessThan(word.y + word.height)
    expect(drip.y + drip.height).toBeGreaterThan(last.y + last.height)

    const motion = () =>
      link
        .locator(".blood-drip-stream, .blood-drip-fall")
        .evaluateAll((all) =>
          all.map((el) => getComputedStyle(el).animationName)
        )
    // Reduced motion: it hangs still, no drop falling.
    expect(await motion()).toEqual(["none", "none"])
    await expect(link.locator(".blood-drip-fall")).toHaveCSS("opacity", "0")
    await page.emulateMedia({ reducedMotion: "no-preference" })
    expect(await motion()).toEqual(["blood-pour", "blood-fall"])
  })

  test("the countdown's numbers are in decaying ink, its units clean", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.locator("filter#decaying-ink")).toHaveCount(1)
    const filters = await page
      .getByRole("timer")
      .locator("li > span")
      .evaluateAll((all) => all.map((el) => getComputedStyle(el).filter))
    expect(filters).toEqual([
      'url("#decaying-ink")',
      "none",
      'url("#decaying-ink")',
      "none",
      'url("#decaying-ink")',
      "none",
      'url("#decaying-ink")',
      "none",
    ])
  })

  test("the window is as grimy as the film: its glass the strip's grime, its frame rough", async ({
    page,
  }) => {
    await page.goto("/")
    const glass = page.locator(".apparition .lamp image")
    await expect(glass).toHaveAttribute("href", "/images/window-glass.webp")
    expect(
      (await page.request.get("/images/window-glass.webp")).headers()[
        "content-type"
      ]
    ).toBe("image/webp")
    await expect(page.locator(".apparition .lamp")).toHaveAttribute(
      "filter",
      "url(#window-rough)"
    )
  })
})
