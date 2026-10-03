import { expect, test, type Page } from "@playwright/test"

import { collectErrors } from "./console"

const costumes = (page: Page) => page.getByRole("region", { name: "Costumes" })

/** The header's way to the basket, named with its count. */
const headerBasket = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: /^My Pumpkin Basket/ })

const toggle = (page: Page, name: string) =>
  costumes(page).getByRole("button", {
    name: `Add ${name} to My Pumpkin Basket`,
  })

/** What the basket's live region last said. */
const announced = (page: Page) =>
  page.locator("[aria-live='polite']").textContent()

/** Puts `value` in the basket's storage before any page script runs. */
const storeBefore = (page: Page, value: string) =>
  page.addInitScript((raw) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("kostuma.basket", raw)
      sessionStorage.setItem("seeded", "1")
    }
  }, value)

const rows = (page: Page) =>
  page
    .getByRole("list", { name: "Costumes in My Pumpkin Basket" })
    .getByRole("listitem")

test.describe("My Pumpkin Basket", () => {
  test("a costume row puts its costume in the basket, and the header counts it", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/")
    await expect(headerBasket(page)).toHaveAccessibleName("My Pumpkin Basket")

    await toggle(page, "Ghostface").click()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )
    await expect(
      costumes(page).getByRole("button", {
        name: "Remove Ghostface from My Pumpkin Basket",
      })
    ).toBeVisible()
    expect(await announced(page)).toBe("Ghostface added to My Pumpkin Basket.")

    await toggle(page, "Pearl").click()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 2 costumes"
    )
    await expect(headerBasket(page)).toContainText("2")

    // Kept on the device.
    await page.reload()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 2 costumes"
    )
    await costumes(page)
      .getByRole("button", { name: "Remove Pearl from My Pumpkin Basket" })
      .click()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )
    expect(errors).toEqual([])
  })

  test("a costume's page adds it, then leads to the basket", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.goto("/costumes/michael-myers")
    await page.getByRole("button", { name: "Add to My Pumpkin Basket" }).click()
    const inBasket = page.getByRole("link", { name: "In My Pumpkin Basket" })
    await expect(inBasket).toBeFocused()
    await inBasket.click()
    await expect(page).toHaveURL(/\/basket$/)
    await expect(page).toHaveTitle("My Pumpkin Basket · Kostuma")
    await expect(rows(page)).toHaveCount(1)
    await expect(rows(page).first()).toContainText("Michael Myers")
    expect(errors).toEqual([])
  })

  test("the basket: the Fitting Room, each costume's actions, and its count", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await storeBefore(
      page,
      JSON.stringify({ v: 1, slugs: ["ghostface", "pearl"] })
    )
    await page.goto("/basket")
    await expect(
      page.getByRole("heading", { level: 1, name: "My Pumpkin Basket" })
    ).toBeVisible()
    await expect(page.getByText("2 costumes", { exact: true })).toBeVisible()

    const fittingRoom = page.getByRole("region", { name: "The Fitting Room" })
    await expect(fittingRoom).not.toContainText("Soon")
    // No price and no Premium badge: one costume free, then Kostuma Pro.
    await expect(fittingRoom).not.toContainText(/Premium|\$/)
    await expect(fittingRoom).toContainText(
      "One costume is free with every account."
    )
    // Signed out, Kostuma Pro's waitlist asks to sign in first.
    await expect(
      fittingRoom.getByRole("link", { name: "Get Kostuma Pro" })
    ).toHaveAttribute("href", "/sign-in?next=%2Fbasket")

    // The last added first.
    await expect(rows(page)).toHaveCount(2)
    await expect(rows(page).first()).toContainText("Pearl")
    const pearl = rows(page).first()
    await expect(pearl.getByText("Buy")).toContainText("Soon")
    await expect(
      pearl.getByRole("link", { name: "Try on Pearl" })
    ).toHaveAttribute("href", "/basket/fitting-room?costume=pearl")
    await expect(pearl.getByRole("link", { name: /^Pearl/ })).toHaveAttribute(
      "href",
      "/costumes/pearl"
    )
    expect(errors).toEqual([])
  })

  test("removing keeps the visitor's place; clearing asks twice", async ({
    page,
  }) => {
    await storeBefore(
      page,
      JSON.stringify({ v: 1, slugs: ["ghostface", "pearl", "carrie-white"] })
    )
    await page.goto("/basket")
    await page
      .getByRole("button", { name: "Remove Pearl from My Pumpkin Basket" })
      .click()
    await expect(rows(page)).toHaveCount(2)
    await expect(
      page.getByRole("button", {
        name: "Remove Ghostface from My Pumpkin Basket",
      })
    ).toBeFocused()

    await page.getByRole("button", { name: "Clear basket" }).click()
    await expect(rows(page)).toHaveCount(2)
    await page.getByRole("button", { name: "Click again to clear" }).click()
    const empty = page.getByRole("heading", { name: "Your basket is empty." })
    await expect(empty).toBeFocused()
    await expect(headerBasket(page)).toHaveAccessibleName("My Pumpkin Basket")

    await page.getByRole("link", { name: "Browse costumes" }).click()
    await expect(page).toHaveURL(/\/#costumes$/)
  })

  test("follows the other open tabs", async ({ page, context }) => {
    await page.goto("/basket")
    await expect(
      page.getByRole("heading", { name: "Your basket is empty." })
    ).toBeVisible()
    const other = await context.newPage()
    await other.goto("/costumes/ghostface")
    await other
      .getByRole("button", { name: "Add to My Pumpkin Basket" })
      .click()

    await expect(rows(page)).toHaveCount(1)
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )
    await page
      .getByRole("button", { name: "Remove Ghostface from My Pumpkin Basket" })
      .click()
    await expect(
      other.getByRole("button", { name: "Add to My Pumpkin Basket" })
    ).toBeVisible()
  })

  for (const [what, raw] of [
    ["corrupted", "{not json"],
    ["outdated", JSON.stringify({ v: 0, items: ["ghostface"] })],
    ["oversized", JSON.stringify({ v: 1, slugs: ["x".repeat(50_000)] })],
  ]) {
    test(`survives ${what} saved data`, async ({ page }) => {
      const errors = collectErrors(page)
      await storeBefore(page, raw)
      await page.goto("/basket")
      await expect(
        page.getByRole("heading", { name: "Your basket is empty." })
      ).toBeVisible()
      await page.goto("/")
      await toggle(page, "Ghostface").click()
      await expect(headerBasket(page)).toHaveAccessibleName(
        "My Pumpkin Basket, 1 costume"
      )
      expect(errors).toEqual([])
    })
  }

  test("drops costumes that no longer exist", async ({ page }) => {
    await storeBefore(
      page,
      JSON.stringify({ v: 1, slugs: ["the-wolf-man", "pearl", "pearl"] })
    )
    await page.goto("/basket")
    await expect(rows(page)).toHaveCount(1)
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )
  })

  test("works where the browser forbids storage", async ({ page }) => {
    const errors = collectErrors(page)
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError")
        },
      })
    })
    await page.goto("/")
    await toggle(page, "Ghostface").click()
    await expect(headerBasket(page)).toHaveAccessibleName(
      "My Pumpkin Basket, 1 costume"
    )
    expect(errors).toEqual([])
  })

  test("speaks the visitor's language around it", async ({ page }) => {
    // Spanish is still to come for the basket: English, never a raw key.
    await page.goto("/es")
    await page
      .getByRole("region", { name: "Disfraces" })
      .getByRole("button", { name: "Add Ghostface to My Pumpkin Basket" })
      .click()
    await page.goto("/es/basket")
    await expect(page.locator("html")).toHaveAttribute("lang", "es")
    await expect(rows(page)).toHaveCount(1)
    await expect(
      page
        .getByRole("region", { name: "The Fitting Room" })
        .getByRole("link", { name: "Consigue Kostuma Pro" })
    ).toHaveAttribute("href", "/es/sign-in?next=%2Fbasket")
  })

  test("never scrolls sideways, even at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 })
    await storeBefore(
      page,
      JSON.stringify({
        v: 1,
        slugs: ["nikki-freaky-nikki-freeman", "dani-the-may-queen"],
      })
    )
    await page.goto("/basket")
    await expect(rows(page)).toHaveCount(2)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test("nobody signs in for it: no Firebase is loaded", async ({ page }) => {
    const firebase: string[] = []
    page.on("request", (request) => {
      if (/googleapis|firebase/.test(new URL(request.url()).host)) {
        firebase.push(request.url())
      }
    })
    await page.goto("/")
    await toggle(page, "Ghostface").click()
    await page.goto("/basket")
    await expect(rows(page)).toHaveCount(1)
    expect(firebase).toEqual([])
  })
})

test.describe("My Pumpkin Basket, with motion", () => {
  test.use({ reducedMotion: "no-preference" })

  test("adding ignites the pumpkins", async ({ page }) => {
    await page.goto("/")
    await toggle(page, "Ghostface").click()
    const animations = (selector: string) =>
      page.evaluate(
        (target) =>
          getComputedStyle(document.querySelector(target)!).animationName,
        selector
      )
    expect(await animations("header a[href='/basket'] svg")).toBe(
      "ignite, heartbeat"
    )
    const lit = costumes(page)
      .getByRole("button", { name: "Remove Ghostface from My Pumpkin Basket" })
      .locator("svg")
    expect(
      await lit.evaluate((svg) => getComputedStyle(svg).animationName)
    ).toBe("ignite, heartbeat")
  })
})

test.describe("My Pumpkin Basket without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("offers no buttons that could do nothing, and an empty basket", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(costumes(page).getByRole("button")).toHaveCount(0)
    await page.goto("/costumes/ghostface")
    await expect(
      page.getByRole("button", { name: "Add to My Pumpkin Basket" })
    ).toBeHidden()
    await page.goto("/basket")
    await expect(
      page.getByRole("heading", { name: "Your basket is empty." })
    ).toBeVisible()
    await expect(
      page.getByRole("region", { name: "The Fitting Room" })
    ).toBeVisible()
  })
})
