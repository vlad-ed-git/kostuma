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
    await expect(
      steps(page).first().getByRole("link", { name: "Choose your costume" })
    ).toHaveAttribute("href", "/#costumes")
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
})
