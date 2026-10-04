import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

const cells = (page: Page) =>
  page.getByRole("timer").locator("li > span:first-child")

test.describe("the countdown", () => {
  test.use({ timezoneId: "America/New_York" })

  test("counts down in the visitor's time and turns to tonight at midnight", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    // Held at three seconds before midnight in New York, whatever the time
    // the page takes to load (the clock starts five minutes earlier).
    await page.clock.install({ time: new Date("2026-10-30T23:55:00-04:00") })
    await page.goto("/")
    await page.clock.pauseAt(new Date("2026-10-30T23:59:57-04:00"))
    await expect(
      page.getByText("Until Halloween · Saturday, October 31")
    ).toBeVisible()
    await expect(cells(page)).toHaveText(["00", "00", "00", "03"])
    await expect(
      page.getByText("0 days, 0 hours and 0 minutes until Halloween.")
    ).toBeAttached()

    await page.clock.runFor(3_000)
    await expect(page.getByText("Tonight.")).toBeVisible()
    await expect(page.getByText("The darkest night is here.")).toBeVisible()
    expect(errors).toEqual([])
  })

  test("counts to Christmas once Halloween's night has passed, and keeps the visitor a monster", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.clock.install({ time: new Date("2026-10-31T23:55:00-04:00") })
    await page.goto("/")
    await page.clock.pauseAt(new Date("2026-10-31T23:59:58-04:00"))
    const title = page.getByRole("heading", { level: 1 })
    await expect(page.getByText("Tonight.")).toBeVisible()
    await expect(title).toHaveText("The darkest night is coming.")

    await page.clock.runFor(3_000)
    await expect(title).toHaveText("The darkest night has passed.")
    await expect(
      page.getByText(
        "But you shall stay a monster until Santa comes. Ho. Ho. Ho."
      )
    ).toBeVisible()
    await expect(
      page.getByText("Until Christmas · Friday, December 25")
    ).toBeVisible()
    await expect(page.getByRole("timer")).toHaveAccessibleName(
      "Time until Christmas"
    )
    // A second past midnight: 54 days less a second, and the hour New
    // York's clocks give back on November 1.
    await expect(cells(page)).toHaveText(["54", "00", "59", "59"])
    expect(errors).toEqual([])
  })

  test("counts to the next Halloween once Santa has come", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-12-24T23:55:00-05:00") })
    await page.goto("/")
    await page.clock.pauseAt(new Date("2026-12-24T23:59:58-05:00"))
    const title = page.getByRole("heading", { level: 1 })
    await expect(title).toHaveText("The darkest night has passed.")
    await expect(cells(page)).toHaveText(["00", "00", "00", "02"])

    await page.clock.runFor(3_000)
    await expect(title).toHaveText("The darkest night is coming.")
    await expect(
      page.getByText("Until Halloween · Sunday, October 31")
    ).toBeVisible()
    // 310 days less a second, less the hour the clocks take in March.
    await expect(cells(page)).toHaveText(["309", "22", "59", "59"])
  })

  test("keeps its size from the dashes to the count and to tonight", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-10-30T23:55:00-04:00") })
    await page.goto("/")
    await page.clock.pauseAt(new Date("2026-10-30T23:59:58-04:00"))
    const block = page.getByText("Choose your costume")
    const top = () => block.evaluate((el) => el.getBoundingClientRect().top)
    await expect(cells(page).first()).toHaveText("00")
    const counting = await top()
    await page.clock.runFor(3_000)
    await expect(page.getByText("Tonight.")).toBeVisible()
    expect(await top()).toBe(counting)
  })

  test('"Choose your costume" leads to the costumes', async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Choose your costume" }).click()
    await expect(page).toHaveURL(/\/#costumes$/)
    await expect
      .poll(() =>
        page
          .getByRole("region", { name: "Costumes" })
          .evaluate((el) => Math.round(el.getBoundingClientRect().top))
      )
      .toBe(64)
  })
})

test.describe("the countdown in another time zone", () => {
  test.use({ timezoneId: "Asia/Tokyo" })

  test("it is already Halloween in Tokyo when New York still counts", async ({
    page,
  }) => {
    // 12:30 on October 30 in New York is 01:30 on October 31 in Tokyo.
    await page.clock.install({ time: new Date("2026-10-30T12:30:00-04:00") })
    await page.goto("/")
    await expect(page.getByText("Tonight.")).toBeVisible()
  })
})

test.describe("the countdown without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("shows the date and dashes, and the way to the costumes", async ({
    page,
  }) => {
    await page.goto("/")
    // The season the server guessed from the connection.
    await expect(
      page.getByText(/^Until (Halloween|Christmas) · /)
    ).toBeVisible()
    await expect(cells(page)).toHaveText(["--", "--", "--", "--"])
    await expect(
      page.getByRole("link", { name: "Choose your costume" })
    ).toHaveAttribute("href", "/#costumes")
  })

  test("takes the same room as the live count: nothing jumps", async ({
    browser,
  }) => {
    const heights: number[] = []
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({
        javaScriptEnabled,
        reducedMotion: "reduce",
      })
      const page = await context.newPage()
      await page.goto("/")
      if (javaScriptEnabled)
        await expect(cells(page).first()).not.toHaveText("--")
      heights.push(
        await page
          .getByRole("timer")
          .evaluate((el) => el.getBoundingClientRect().height)
      )
      await context.close()
    }
    expect(heights[1]).toBe(heights[0])
  })
})
