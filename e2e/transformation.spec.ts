import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

/** The film strip under the tagline: one picture, named by its label. */
const reel = (page: Page) =>
  page.getByRole("img", { name: /^A real transformation into Longlegs/ })

const box = async (page: Page, selector: string) => {
  const found = await page.locator(selector).first().boundingBox()
  if (!found) throw new Error(`${selector} is not on screen`)
  return found
}

test.describe("the transformation on the home page", () => {
  test("stands under “Transform into a monster.”, every frame loaded from Storage", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    const strip = reel(page)
    await expect(strip).toBeVisible()

    const images = strip.locator("img")
    await expect(images).toHaveCount(5)
    await strip.scrollIntoViewIfNeeded()
    for (let index = 0; index < 5; index++) {
      const image = images.nth(index)
      await expect
        .poll(
          () =>
            image.evaluate(
              (element: HTMLImageElement) =>
                element.complete && element.naturalWidth > 0
            ),
          { timeout: 20_000 }
        )
        .toBe(true)
      expect(
        await image.evaluate((element: HTMLImageElement) => element.currentSrc)
      ).toContain(
        "/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com"
      )
    }
    await expect(strip.locator(".home-reel-number")).toHaveText([
      "1",
      "2",
      "3",
      "4",
      "5",
    ])

    // Under the tagline, on its left edge; the countdown beside the
    // tagline on a wide screen, under the strip on a phone.
    const tail = await box(page, "[data-title-card] h1 + p")
    const title = await box(page, "[data-title-card] h1")
    const film = (await strip.boundingBox())!
    const countdown = await box(page, "[role='timer']")
    expect(film.y).toBeGreaterThan(tail.y + tail.height)
    expect(Math.abs(film.x - title.x)).toBeLessThan(2)
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      expect(film.x + film.width).toBeLessThanOrEqual(countdown.x)
      expect(countdown.y).toBeLessThan(film.y)
    } else {
      expect(countdown.y).toBeGreaterThan(film.y + film.height)
    }
    // A strip of film: wider than tall, its five frames in one row.
    expect(film.width / film.height).toBeCloseTo((5 * 279) / 444, 1)
    expect(errors).toEqual([])
  })

  test("the cigarette burns blink on the last two frames, and stay lit when motion is reduced", async ({
    page,
  }) => {
    await page.goto("/")
    const burns = reel(page).locator(".home-reel-burn")
    await expect(burns).toHaveCount(2)
    const styleOf = () =>
      burns.evaluateAll((all) =>
        all.map((burn) => ({
          cue: burn.getAttribute("data-cue"),
          animation: getComputedStyle(burn).animationName,
          opacity: getComputedStyle(burn).opacity,
        }))
      )
    expect(await styleOf()).toEqual([
      { cue: "motor", animation: "none", opacity: "1" },
      { cue: "changeover", animation: "none", opacity: "1" },
    ])
    await page.emulateMedia({ reducedMotion: "no-preference" })
    expect(
      (await styleOf()).map(({ cue, animation }) => ({ cue, animation }))
    ).toEqual([
      { cue: "motor", animation: "home-reel-cue" },
      { cue: "changeover", animation: "home-reel-cue" },
    ])
  })
})
