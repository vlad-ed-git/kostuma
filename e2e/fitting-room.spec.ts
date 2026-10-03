import { randomUUID } from "node:crypto"

import { expect, test, type Page } from "@playwright/test"
import sharp from "sharp"

import { collectErrors } from "./console"

// The e2e build renders with the fake provider (lib/fitting-room/
// renderer.e2e.ts, 400 ms a step) and keeps everything in the server's
// memory (store.e2e.ts): no unit is ever spent here.

type Photo = { name: string; mimeType: string; buffer: Buffer }

/** A plain photo: a background with a skin-colored oval, or a red corner. */
async function photo(
  width: number,
  height: number,
  { redCorner = false, name = "photo.jpg" } = {}
): Promise<Photo> {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#DDE3EA"/><ellipse cx="${width / 2}" cy="${height * 0.4}" rx="${width * 0.28}" ry="${height * 0.3}" fill="#C68642"/>${redCorner ? '<rect width="48" height="48" fill="#FF0000"/>' : ""}</svg>`
  return {
    name,
    mimeType: "image/jpeg",
    buffer: await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer(),
  }
}

/** Signed in as a visitor of this test's own, with these costumes in the basket. */
async function enter(page: Page, slugs: string[]) {
  await page.context().addCookies([
    {
      name: "e2e-session",
      value: randomUUID(),
      url: "http://localhost:3100",
    },
  ])
  await page.addInitScript((value) => {
    localStorage.setItem("e2e.account-basket", value)
  }, JSON.stringify(slugs))
}

const facePicker = (page: Page) => page.locator('[data-photo="face"]')
const bodyPicker = (page: Page) => page.locator('[data-photo="body"]')

async function givePhotos(page: Page, face: Photo, body: Photo) {
  await page.locator('input[name="face"]').setInputFiles(face)
  await expect(
    page.getByRole("button", { name: "Change the photo of your face" })
  ).toBeVisible()
  await page.locator('input[name="body"]').setInputFiles(body)
  await expect(
    page.getByRole("button", { name: "Change the photo of you, head to toe" })
  ).toBeVisible()
}

/** Every <img> in the region has loaded a picture. */
async function picturesLoaded(page: Page, region: string) {
  const images = page.getByRole("region", { name: region }).locator("img")
  await expect(images.first()).toBeVisible()
  await expect
    .poll(() =>
      images.evaluateAll((all) =>
        all.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0
        )
      )
    )
    .toBe(true)
}

test.describe("The Fitting Room", () => {
  test("asks a signed-out visitor to sign in, then brings them back", async ({
    page,
  }) => {
    await page.goto("/basket/fitting-room?costume=pearl")
    await expect(page).toHaveURL(
      "/sign-in?next=%2Fbasket%2Ffitting-room%3Fcostume%3Dpearl"
    )
  })

  test("sends an empty basket to the costumes", async ({ page }) => {
    await enter(page, [])
    await page.goto("/basket/fitting-room")
    await expect(
      page.getByRole("heading", { name: "Your basket is empty." })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Browse costumes" })
    ).toHaveAttribute("href", "/#costumes")
  })

  test("opens on the costume added last", async ({ page }) => {
    await enter(page, ["pearl", "beetlejuice"])
    await page.goto("/basket/fitting-room")
    await expect(page).toHaveURL("/basket/fitting-room?costume=beetlejuice")
    const costumes = page.getByRole("navigation", { name: "Your costumes" })
    await expect(
      costumes.getByRole("link", { name: "Beetlejuice" })
    ).toHaveAttribute("aria-current", "page")
    await costumes.getByRole("link", { name: "Pearl" }).click()
    await expect(page).toHaveURL("/basket/fitting-room?costume=pearl")
  })

  test("offers to add a costume that isn't in the basket", async ({ page }) => {
    await enter(page, ["pearl"])
    await page.goto("/basket/fitting-room?costume=ghostface")
    await expect(
      page.getByText("Ghostface isn't in My Pumpkin Basket yet.")
    ).toBeVisible()
    await page.getByRole("button", { name: "Add to My Pumpkin Basket" }).click()
    await expect(
      page.getByRole("heading", { name: "Your photos" })
    ).toBeVisible()
  })

  test("tries on the outfit, then the makeup step by step", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await enter(page, ["beetlejuice"])
    await page.goto("/basket/fitting-room?costume=beetlejuice")
    await expect(
      page.getByRole("heading", { name: "Your photos" })
    ).toBeVisible()

    await givePhotos(page, await photo(900, 1200), await photo(1000, 1500))
    await page.getByRole("button", { name: "Continue" }).click()

    // Confirmed first: nothing is sent before.
    await expect(
      page.getByRole("heading", { name: "Ready to try on Beetlejuice?" })
    ).toBeFocused()
    await expect(
      page.getByText("once the try-on starts, they can't be changed")
    ).toBeVisible()
    await page.getByRole("button", { name: "Start the try-on" }).click()

    // Locked while it runs: no way to change the photos.
    await expect(page.getByText("Trying on the outfit…")).toBeVisible()
    await expect(page.getByRole("button", { name: /photos/ })).toHaveCount(0)

    await expect(page.getByText("Your try-on is ready.")).toBeVisible({
      timeout: 30_000,
    })
    await picturesLoaded(page, "The outfit")
    await picturesLoaded(page, "The makeup")
    const makeup = page.getByRole("region", { name: "The makeup" })
    await expect(
      makeup.getByRole("img", { name: "Your face before the makeup" })
    ).toBeVisible()
    await expect(
      makeup.getByRole("img", { name: "Your face after step 1: Corpse base" })
    ).toBeVisible()
    await expect(makeup.getByText("Step 7")).toBeVisible()

    const product = makeup.getByRole("link", {
      name: "Find gray cream face paint on Amazon (opens in a new tab)",
    })
    await expect(product).toHaveAttribute(
      "href",
      "https://www.amazon.com/s?k=gray%20cream%20face%20paint"
    )
    await expect(product).toHaveAttribute("target", "_blank")
    await expect(product).toHaveAttribute("rel", /noopener/)

    // Coming back shows the same try-on, made once.
    await page.reload()
    await expect(page.getByText("Your try-on is ready.")).toBeVisible()
    await picturesLoaded(page, "The makeup")
    expect(errors).toEqual([])
  })

  test("offers the same photos again for the next costume", async ({
    page,
  }) => {
    await enter(page, ["pearl", "beetlejuice"])
    await page.goto("/basket/fitting-room?costume=beetlejuice")
    await givePhotos(page, await photo(900, 1200), await photo(1000, 1500))
    await page.getByRole("button", { name: "Continue" }).click()
    await page.getByRole("button", { name: "Start the try-on" }).click()
    await expect(page.getByText("Your try-on is ready.")).toBeVisible({
      timeout: 30_000,
    })

    await page
      .getByRole("navigation", { name: "Your costumes" })
      .getByRole("link", { name: "Pearl" })
      .click()
    await expect(
      page.getByRole("button", { name: "Change the photo of your face" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Change the photo of you, head to toe" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(
      page.getByRole("heading", { name: "Ready to try on Pearl?" })
    ).toBeVisible()
  })

  test("needs only the face for a costume that is all makeup", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await enter(page, ["nikki-freaky-nikki-freeman"])
    await page.goto("/basket/fitting-room?costume=nikki-freaky-nikki-freeman")
    await expect(
      page.getByText("Nikki 'Freaky Nikki' Freeman is all makeup: one photo")
    ).toBeVisible()
    await expect(bodyPicker(page)).toHaveCount(0)
    await page
      .locator('input[name="face"]')
      .setInputFiles(await photo(900, 1200))
    await expect(
      page.getByRole("button", { name: "Change the photo of your face" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Continue" }).click()
    await page.getByRole("button", { name: "Start the try-on" }).click()

    await expect(page.getByText("Your try-on is ready.")).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByText("there is no outfit to try on", { exact: false })
    ).toBeVisible()
    await picturesLoaded(page, "The makeup")
    await expect(
      page
        .getByRole("region", { name: "The makeup" })
        .getByRole("img", { name: "Your face after step 7: Black hair" })
    ).toBeVisible()
    expect(errors).toEqual([])
  })

  test("says at once when a photo is too small, and keeps the other", async ({
    page,
  }) => {
    await enter(page, ["pearl"])
    await page.goto("/basket/fitting-room?costume=pearl")
    await page
      .locator('input[name="body"]')
      .setInputFiles(await photo(1000, 1500))
    await page
      .locator('input[name="face"]')
      .setInputFiles(await photo(300, 400))
    await expect(facePicker(page).getByRole("alert")).toHaveText(
      "This photo is too small. Choose a larger one."
    )
    await expect(
      page.getByRole("button", { name: "Change the photo of you, head to toe" })
    ).toBeVisible()

    await page.getByRole("button", { name: "Continue" }).click()
    // Inside main: Next.js' route announcer is an alert too.
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Add both photos first."
    )
    await expect(
      page.getByRole("heading", { name: "Your photos" })
    ).toBeVisible()
  })

  test("says when a file isn't a photo", async ({ page }) => {
    await enter(page, ["pearl"])
    await page.goto("/basket/fitting-room?costume=pearl")
    await page.locator('input[name="body"]').setInputFiles({
      name: "notes.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("not a photo"),
    })
    await expect(bodyPicker(page).getByRole("alert")).toHaveText(
      "This file can't be opened. Choose a JPEG, PNG or WebP photo."
    )
  })

  test("fails a try-on whose face can't be read, and asks for another photo", async ({
    page,
  }) => {
    await enter(page, ["pearl"])
    await page.goto("/basket/fitting-room?costume=pearl")
    await givePhotos(
      page,
      await photo(900, 1200, { redCorner: true }),
      await photo(1000, 1500)
    )
    await page.getByRole("button", { name: "Continue" }).click()
    await page.getByRole("button", { name: "Start the try-on" }).click()

    const message =
      "Your face couldn't be found in the photo. Choose one where you look straight at the camera, in even light."
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      message,
      { timeout: 30_000 }
    )
    // The outfit came out; the makeup steps didn't.
    await picturesLoaded(page, "The outfit")
    await expect(
      page.getByRole("region", { name: "The makeup" }).getByText("Not rendered")
    ).not.toHaveCount(0)

    await page.getByRole("button", { name: "Choose other photos" }).click()
    await expect(facePicker(page).getByRole("alert")).toHaveText(message)
  })

  test("never shows a visitor's pictures to anyone else", async ({
    page,
    request,
  }) => {
    await enter(page, ["pearl"])
    await page.goto("/basket/fitting-room?costume=pearl")
    await givePhotos(page, await photo(900, 1200), await photo(1000, 1500))
    await page.getByRole("button", { name: "Continue" }).click()
    await page.getByRole("button", { name: "Start the try-on" }).click()
    await expect(page.getByText("Your try-on is ready.")).toBeVisible({
      timeout: 30_000,
    })
    const face = await page
      .getByRole("img", { name: "Your face before the makeup" })
      .getAttribute("src")
    const step = await page
      .getByRole("img", { name: /Your face after step 1/ })
      .getAttribute("src")
    const tryOn = step?.replace(/\/\d+\?v=\d+$/, "")
    expect(face).toMatch(/^\/api\/fitting-room\/photos\/face\/[0-9a-f]{32}$/)

    // Its owner: yes, kept privately.
    const own = await page.request.get(face ?? "")
    expect(own.status()).toBe(200)
    expect(own.headers()["cache-control"]).toMatch(/^private/)

    // Signed out (a fresh request, no cookie): no.
    for (const url of [face, step, tryOn])
      expect((await request.get(url ?? "")).status()).toBe(401)

    // Another visitor: nothing there.
    const stranger = await page.context().browser()!.newContext()
    await stranger.addCookies([
      {
        name: "e2e-session",
        value: randomUUID(),
        url: "http://localhost:3100",
      },
    ])
    for (const url of [face, step, tryOn])
      expect(
        (await stranger.request.get(`http://localhost:3100${url}`)).status()
      ).toBe(404)
    await stranger.close()
  })
})
