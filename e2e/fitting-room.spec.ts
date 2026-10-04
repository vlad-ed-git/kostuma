import { randomUUID } from "node:crypto"

import { expect, type Locator, test, type Page } from "@playwright/test"
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

/**
 * On the confirm screen: agrees to the photos' processing (required), then
 * starts the try-on.
 */
async function startTryOn(page: Page, start = "Start the try-on") {
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: start }).click()
}

/** The try-on of a costume: the mirror, the strip of its pictures, the card. */
const room = (page: Page, name: string) =>
  page.getByRole("region", { name, exact: true })
const strip = (room: Locator) =>
  room.getByRole("list", { name: "Your pictures" })

/** Every <img> in the try-on has loaded a picture. */
async function picturesLoaded(room: Locator) {
  const images = room.locator("img")
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
      page.getByText("Ghostface isn’t in My Pumpkin Basket yet.")
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
      page.getByText("once the try-on starts, they can’t be changed")
    ).toBeVisible()
    // Starting uses the free costume: said before.
    await expect(
      page.getByText(
        "This is your free costume. Once it’s done, trying on another needs Kostuma Pro."
      )
    ).toBeVisible()
    // Nothing starts without the consent to the photos' processing.
    const consent = page.getByRole("checkbox", {
      name: /I agree that Kostuma sends my photos to its image service, YouCam/,
    })
    await expect(consent).not.toBeChecked()
    await expect(
      page
        .getByRole("region", { name: "Ready to try on Beetlejuice?" })
        .getByRole("link", { name: "Privacy policy" })
    ).toHaveAttribute("href", "/privacy")
    await page.getByRole("button", { name: "Start the try-on" }).click()
    await expect(
      page.getByText("Tick the box to agree before the try-on starts.")
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Ready to try on Beetlejuice?" })
    ).toBeVisible()
    await startTryOn(page)

    // Locked while it runs: no way to change the photos.
    // How it is going is told to screen readers; how long, to everyone.
    await expect(page.getByText("Trying on the outfit…")).toBeAttached()
    await expect(page.getByRole("button", { name: /photos/ })).toHaveCount(0)
    const takesTime = page.getByText(
      "This takes about two minutes. You can leave and come back."
    )
    await expect(takesTime).toBeVisible()

    await expect(page.getByText("Your try-on is ready.")).toBeAttached({
      timeout: 30_000,
    })
    await expect(takesTime).toHaveCount(0)
    await expect(
      page.getByText("Transform into Beetlejuice. Step by step.")
    ).toBeVisible()
    const beetlejuice = room(page, "Beetlejuice")
    await picturesLoaded(beetlejuice)
    // Done: the mirror shows the whole transformation, the last step.
    await expect(
      beetlejuice.getByRole("img", {
        name: "Your face after step 7: Moss-green hair",
      })
    ).toBeVisible()
    await expect(beetlejuice.getByText("Step 7 of 7")).toBeVisible()
    await expect(
      beetlejuice.getByRole("button", { name: "Next step" })
    ).toBeHidden()
    // The way on from the whole transformation: the guide's first step.
    await beetlejuice.getByRole("button", { name: "Start with step 1" }).click()
    await expect(beetlejuice.getByText("Step 1 of 7")).toBeVisible()
    await expect(
      beetlejuice.getByRole("img", {
        name: "Your face after step 1: Corpse base",
      })
    ).toBeVisible()
    await expect(
      beetlejuice.getByRole("button", { name: "Next step" })
    ).toBeVisible()

    // The strip holds every picture: the outfit, then each step.
    const pictures = strip(beetlejuice)
    await expect(pictures.getByRole("button")).toHaveCount(8)
    if (test.info().project.name === "mobile") {
      // The strip sits under the card: a frame picked there brings the
      // mirror back into view.
      await pictures.scrollIntoViewIfNeeded()
      await pictures.getByRole("button", { name: /^Step 3:/ }).click()
      await expect(beetlejuice.locator("figure")).toBeInViewport()
    }
    await pictures.getByRole("button", { name: "The outfit" }).click()
    await expect(
      beetlejuice.getByRole("img", {
        name: "You wearing the Beetlejuice costume",
      })
    ).toBeVisible()
    await expect(
      beetlejuice.getByRole("button", { name: "Previous step" })
    ).toBeHidden()
    // Before the makeup: what to buy, then on to the makeup.
    await expect(
      beetlejuice.getByText("See the photo and note down what to buy.")
    ).toBeVisible()
    await expect(
      beetlejuice.getByText("Now let’s get started on the makeup.")
    ).toBeVisible()
    // Before step 1 (todo OPP-12, COPY-12): how long, every product once
    // with its shop, and the makeup's safety.
    await expect(
      beetlejuice.getByText("The makeup takes about 55 minutes.")
    ).toBeVisible()
    const needs = beetlejuice.getByRole("list", { name: "What you need" })
    await expect(needs.getByRole("link")).toHaveCount(12)
    await expect(
      needs.getByRole("link", {
        name: "Find gray cream face paint on Amazon (opens in a new tab)",
      })
    ).toHaveAttribute(
      "href",
      "https://www.amazon.com/s?k=gray%20cream%20face%20paint"
    )
    await expect(
      beetlejuice.getByText(
        "Use cosmetic-grade products only, patch-test 24 hours before, and keep paint and fake blood out of your eyes."
      )
    ).toBeVisible()
    // On paper, the guide alone: every step, black on white.
    const paper = page.locator("body > .print-guide")
    await expect(paper).toBeHidden()
    await page.emulateMedia({ media: "print" })
    await expect(paper).toBeVisible()
    await expect(paper.getByRole("heading", { level: 1 })).toHaveText(
      "Beetlejuice"
    )
    await expect(paper.getByRole("listitem")).toHaveCount(12 + 7)
    await expect(paper).toHaveCSS("color", "rgb(0, 0, 0)")
    await expect(beetlejuice).toBeHidden()
    await page.emulateMedia({ media: "screen" })
    await expect(paper).toBeHidden()
    await expect(beetlejuice).toBeVisible()
    // Buy right there, as in the basket: three shops, a menu.
    await expect(
      beetlejuice.getByRole("button", {
        name: "Buy Beetlejuice: choose a shop",
      })
    ).toBeVisible()
    await expect(
      beetlejuice.getByRole("button", { name: "Next step" })
    ).toHaveCount(0)
    await beetlejuice.getByRole("button", { name: "Apply makeup" }).click()
    await expect(
      beetlejuice.getByRole("img", {
        name: "Your face after step 1: Corpse base",
      })
    ).toBeVisible()
    await expect(beetlejuice.getByText("Step 1 of 7")).toBeVisible()
    await expect(
      pictures.getByRole("button", { name: "Step 1: Corpse base" })
    ).toHaveAttribute("aria-current", "true")

    const product = beetlejuice.getByRole("link", {
      name: "Find gray cream face paint on Amazon (opens in a new tab)",
    })
    await expect(product).toHaveAttribute(
      "href",
      "https://www.amazon.com/s?k=gray%20cream%20face%20paint"
    )
    await expect(product).toHaveAttribute("target", "_blank")
    await expect(product).toHaveAttribute("rel", /noopener/)

    // Save (todo OPP-11): the picture in the mirror, the same JPEG,
    // unaltered, as a file named after the costume and the step.
    const save = beetlejuice.getByRole("link", { name: "Save this picture" })
    await expect(save).toHaveAttribute(
      "download",
      "kostuma-beetlejuice-step-1.jpg"
    )
    const saving = (await save.getAttribute("href"))!
    expect(saving).toMatch(/&download=1$/)
    const [shown, saved] = await Promise.all([
      page.request.get(saving.replace("&download=1", "")),
      page.request.get(saving),
    ])
    expect(saved.headers()["content-disposition"]).toBe(
      'attachment; filename="kostuma-beetlejuice-step-1.jpg"'
    )
    expect(await saved.body()).toEqual(await shown.body())

    // On a phone that can share files, Save hands the file to the share
    // sheet (stood in for here: the real one is the system's).
    if (test.info().project.name === "mobile") {
      await page.addInitScript(() => {
        const shared: { name: string; type: string; size: number }[] = []
        Object.assign(window, { shared })
        Object.assign(navigator, {
          canShare: (data: ShareData) => (data.files?.length ?? 0) > 0,
          share: async ({ files = [] }: ShareData) => {
            for (const { name, type, size } of files)
              shared.push({ name, type, size })
          },
        })
      })
    }

    // Coming back shows the same try-on, made once.
    await page.reload()
    await expect(page.getByText("Your try-on is ready.")).toBeAttached()
    await picturesLoaded(room(page, "Beetlejuice"))
    if (test.info().project.name === "mobile") {
      const shared = () =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                shared: { name: string; type: string; size: number }[]
              }
            ).shared
        )
      // The file is fetched before the tap: tap until it is in hand.
      await expect(async () => {
        await room(page, "Beetlejuice")
          .getByRole("link", { name: "Save this picture" })
          .click()
        expect((await shared()).length).toBeGreaterThan(0)
      }).toPass()
      const [file] = await shared()
      expect(file).toMatchObject({
        name: "kostuma-beetlejuice-step-7.jpg",
        type: "image/jpeg",
      })
      expect(file.size).toBeGreaterThan(0)
    }
    expect(errors).toEqual([])
  })

  test("keeps every photo control inside the gutter on small phones, in every language", async ({
    page,
  }) => {
    await enter(page, ["beetlejuice"])
    for (const width of [320, 360]) {
      await page.setViewportSize({ width, height: 740 })
      for (const prefix of ["", "/es", "/zh"]) {
        await page.goto(`${prefix}/basket/fitting-room?costume=beetlejuice`)
        await expect(page.locator("[data-photo]")).toHaveCount(2)
        const outside = await page.locator("main").evaluate((main, width) => {
          const gutter = 16
          const selector =
            "h1, h2, h3, p, li, button, [data-photo] img, [data-photo] svg"
          return [...main.querySelectorAll(selector)]
            .filter((element) => {
              const box = element.getBoundingClientRect()
              return (
                box.width > 0 &&
                (box.right > width - gutter + 0.5 || box.left < gutter - 0.5)
              )
            })
            .map(
              (element) =>
                `${element.tagName}: ${element.textContent?.trim().slice(0, 40)}`
            )
        }, width)
        expect(outside, `${prefix || "/en"} at ${width} px`).toEqual([])
      }
    }
  })

  test("goes on with the page asking nothing: YouCam's webhooks move the try-on along", async ({
    page,
  }) => {
    await enter(page, ["beetlejuice"])
    // The page only reads: every render is announced by a signed webhook
    // (the e2e build's fake does as YouCam does), and that moves it on.
    await page.route("**/api/fitting-room/try-ons/*", (route) =>
      route.request().method() === "POST" ? route.abort() : route.continue()
    )
    await page.goto("/basket/fitting-room?costume=beetlejuice")
    await givePhotos(page, await photo(900, 1200), await photo(1000, 1500))
    await page.getByRole("button", { name: "Continue" }).click()
    await startTryOn(page)
    await expect(page.getByText("Trying on the outfit…")).toBeAttached()

    await expect
      .poll(
        async () => {
          await page.reload()
          return page.getByText("Your try-on is ready.").count()
        },
        { timeout: 30_000, intervals: [2_000] }
      )
      .toBe(1)
    const beetlejuice = room(page, "Beetlejuice")
    await expect(strip(beetlejuice).getByRole("button")).toHaveCount(8)
    await picturesLoaded(beetlejuice)
  })

  test("speaks the visitor's language: the guide in Spanish, its products the shop's search", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await enter(page, ["freddy-krueger"])
    await page.goto("/es/basket/fitting-room?costume=freddy-krueger")
    await expect(
      page.getByText("Transfórmate en Freddy Krueger. Paso a paso.")
    ).toBeVisible()
    await page
      .locator('input[name="face"]')
      .setInputFiles(await photo(900, 1200))
    await expect(
      page.getByRole("button", { name: "Cambiar la foto de tu cara" })
    ).toBeVisible()
    await page
      .locator('input[name="body"]')
      .setInputFiles(await photo(1000, 1500))
    await expect(
      page.getByRole("button", {
        name: "Cambiar la foto tuya de pies a cabeza",
      })
    ).toBeVisible()
    await page.getByRole("button", { name: "Continuar" }).click()
    await startTryOn(page, "Empezar la prueba")
    await expect(page.getByText("Tu prueba está lista.")).toBeAttached({
      timeout: 30_000,
    })

    const freddy = room(page, "Freddy Krueger")
    await expect(freddy.getByText("Paso 6 de 6")).toBeVisible()
    await expect(
      freddy.getByRole("heading", { name: "Labios agrietados" })
    ).toBeVisible()
    const product = freddy.getByRole("link", {
      name: "Buscar labial rojo ladrillo en Amazon (se abre en una pestaña nueva)",
    })
    // Shown in Spanish, searched in English: the shop finds it.
    await expect(product).toHaveAttribute(
      "href",
      "https://www.amazon.com/s?k=brick%20red%20lipstick"
    )
    await expect(
      freddy
        .getByRole("list", { name: "Tus imágenes" })
        .getByRole("button", { name: "El disfraz" })
    ).toBeVisible()
    expect(errors).toEqual([])
  })

  test("offers the same photos again for the next costume", async ({
    page,
  }) => {
    await enter(page, ["pearl", "beetlejuice"])
    await page.goto("/basket/fitting-room?costume=beetlejuice")
    // A body photo the outfit can't read: the try-on fails before any
    // picture is made, so the free costume is still there.
    await givePhotos(
      page,
      await photo(900, 1200),
      await photo(1000, 1500, { redCorner: true })
    )
    await page.getByRole("button", { name: "Continue" }).click()
    await startTryOn(page)
    await expect(
      page.getByRole("button", { name: "Choose other photos" })
    ).toBeVisible({ timeout: 30_000 })

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

  test("tries Nikki's outfit on before her makeup, now that she has one", async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await enter(page, ["nikki-freaky-nikki-freeman"])
    await page.goto("/basket/fitting-room?costume=nikki-freaky-nikki-freeman")
    // Both photos, as for every costume with an outfit.
    await expect(
      page.getByText("Two photos: your face, and you from head to toe.")
    ).toBeVisible()
    await givePhotos(page, await photo(900, 1200), await photo(1000, 1500))
    await page.getByRole("button", { name: "Continue" }).click()
    await startTryOn(page)

    await expect(page.getByText("Your try-on is ready.")).toBeAttached({
      timeout: 30_000,
    })
    const nikki = room(page, "Nikki “Freaky Nikki” Freeman")
    await picturesLoaded(nikki)
    await expect(
      nikki.getByRole("img", { name: "Your face after step 7: Black hair" })
    ).toBeVisible()
    // The outfit, then the seven steps.
    await expect(strip(nikki).getByRole("button")).toHaveCount(8)
    await strip(nikki).getByRole("button", { name: "The outfit" }).click()
    await expect(
      nikki.getByRole("img", {
        name: "You wearing the Nikki “Freaky Nikki” Freeman costume",
      })
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
      "This file can’t be opened. Choose a JPEG, PNG or WebP photo."
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
    await startTryOn(page)

    const message =
      "Your face couldn’t be found in the photo. Choose one where you look straight at the camera, in even light."
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      message,
      { timeout: 30_000 }
    )
    // The outfit came out, and the mirror shows it; the makeup didn't.
    const pearl = room(page, "Pearl")
    await picturesLoaded(pearl)
    await expect(
      pearl.getByRole("img", { name: "You wearing the Pearl costume" })
    ).toBeVisible()
    await strip(pearl)
      .getByRole("button", { name: /^Step 1:/ })
      .click()
    await expect(pearl.getByText("Not rendered")).toBeVisible()
    // What it cost: not the free costume, but one of the photos' tries.
    await expect(
      pearl.getByText("This didn’t use your free costume.")
    ).toBeVisible()
    await expect(
      pearl.getByText("You have one more try with other photos.")
    ).toBeVisible()

    await page.getByRole("button", { name: "Choose other photos" }).click()
    await expect(facePicker(page).getByRole("alert")).toHaveText(message)

    // The photo at fault would fail again, after paying for the outfit:
    // it must change first.
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(facePicker(page).getByRole("alert")).toHaveText(message)
    await expect(
      page.getByRole("heading", { name: "Ready to try on Pearl?" })
    ).toHaveCount(0)
    await page
      .locator('input[name="face"]')
      .setInputFiles(await photo(960, 1280))
    await expect(facePicker(page).getByRole("alert")).toHaveCount(0)
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(
      page.getByRole("heading", { name: "Ready to try on Pearl?" })
    ).toBeVisible()
  })

  test("never shows a visitor's pictures to anyone else", async ({
    page,
    request,
  }) => {
    await enter(page, ["pearl"])
    await page.goto("/basket/fitting-room?costume=pearl")
    // A face the makeup can't read: the outfit comes out, then the try-on
    // stops, and its photos are offered again.
    await givePhotos(
      page,
      await photo(900, 1200, { redCorner: true }),
      await photo(1000, 1500)
    )
    await page.getByRole("button", { name: "Continue" }).click()
    await startTryOn(page)
    const retry = page.getByRole("button", { name: "Choose other photos" })
    await expect(retry).toBeVisible({ timeout: 30_000 })
    const step = await room(page, "Pearl")
      .getByRole("img", { name: "You wearing the Pearl costume" })
      .getAttribute("src")
    // The face photo as the account keeps it, offered again from the server.
    await page.reload()
    await retry.click()
    const face = await facePicker(page).locator("img").getAttribute("src")
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

  test.describe("once the free costume is used", () => {
    /** Pearl tried on, done: the account's free costume. */
    async function tryOnPearl(page: Page) {
      await enter(page, ["pearl", "beetlejuice"])
      await page.goto("/basket/fitting-room?costume=pearl")
      await givePhotos(page, await photo(900, 1200), await photo(1000, 1500))
      await page.getByRole("button", { name: "Continue" }).click()
      await startTryOn(page)
      await expect(page.getByText("Your try-on is ready.")).toBeAttached({
        timeout: 30_000,
      })
    }

    /** The picture in the mirror: the last step once done. */
    const mirror = (page: Page) =>
      room(page, "Pearl").getByRole("img", { name: /Your face after step/ })

    const waitlist = (page: Page) =>
      page.getByRole("dialog", {
        name: "You’re on the Kostuma Pro waitlist.",
      })

    test("Try with other photos asks first, and offers Kostuma Pro", async ({
      page,
    }) => {
      const errors = collectErrors(page)
      await tryOnPearl(page)
      const shown = await mirror(page).getAttribute("src")

      const again = page.getByRole("button", { name: "Try with other photos" })
      const dialog = page.getByRole("alertdialog", {
        name: "You’ve used your free costume.",
      })
      await again.click()
      await expect(dialog).toContainText(
        "New photos would make a new try-on of Pearl. Get Kostuma Pro for more try-ons."
      )
      // The safe answer is the one Enter would give.
      const keep = dialog.getByRole("button", { name: "Keep current photos" })
      await expect(keep).toBeFocused()
      await keep.click()
      await expect(dialog).toBeHidden()
      await expect(again).toBeFocused()
      await expect(mirror(page)).toHaveAttribute("src", shown ?? "")

      // Escape keeps them too.
      await again.click()
      await expect(dialog).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(dialog).toBeHidden()

      // Kostuma Pro, from the pop-up: the waitlist's pop-up over it.
      await again.click()
      const pro = dialog.getByRole("button", { name: "Get Kostuma Pro" })
      await pro.click()
      await expect(waitlist(page)).toContainText(
        "We’ll write to you at this email as soon as it opens."
      )
      await expect(waitlist(page).getByLabel("Email")).toHaveValue(
        "wednesday@example.com"
      )
      await waitlist(page).getByRole("button", { name: "Close" }).click()
      await expect(waitlist(page)).toBeHidden()
      await expect(pro).toBeFocused()
      await page.keyboard.press("Escape")
      await expect(dialog).toBeHidden()
      await expect(mirror(page)).toHaveAttribute("src", shown ?? "")
      expect(errors).toEqual([])
    })

    test("another costume offers Kostuma Pro, whose waitlist keeps the email given", async ({
      page,
    }) => {
      const errors = collectErrors(page)
      await tryOnPearl(page)
      await page
        .getByRole("navigation", { name: "Your costumes" })
        .getByRole("link", { name: "Beetlejuice" })
        .click()
      await expect(
        page.getByRole("heading", { name: "You’ve used your free costume." })
      ).toBeVisible()
      await expect(
        page.getByText(
          "You tried on Pearl. Get Kostuma Pro to try on more costumes."
        )
      ).toBeVisible()
      // Pearl's name leads back to her try-on: the guide they earned.
      await expect(
        page
          .getByRole("region", { name: "You’ve used your free costume." })
          .getByRole("link", { name: "Pearl" })
      ).toHaveAttribute("href", "/basket/fitting-room?costume=pearl")
      // No photos to give: nothing could start.
      await expect(
        page.getByRole("heading", { name: "Your photos" })
      ).toHaveCount(0)
      await page.reload()
      await expect(
        page.getByRole("heading", { name: "You’ve used your free costume." })
      ).toBeVisible()

      const pro = page.getByRole("button", { name: "Get Kostuma Pro" })
      await pro.click()
      const field = waitlist(page).getByLabel("Email")
      await expect(field).toHaveValue("wednesday@example.com")
      await field.fill("morticia@example.com")
      await waitlist(page).getByRole("button", { name: "Update" }).click()
      await expect(waitlist(page).getByRole("status")).toHaveText(
        "Email updated."
      )
      await waitlist(page).getByRole("button", { name: "Close" }).click()
      await expect(pro).toBeFocused()

      // Pressed again: the email on record; the same one sends nothing.
      await pro.click()
      await expect(field).toHaveValue("morticia@example.com")
      await waitlist(page).getByRole("button", { name: "Update" }).click()
      await expect(waitlist(page).getByRole("status")).toHaveText("")
      await waitlist(page).getByRole("button", { name: "Close" }).click()

      // Used, the basket's and the account's panels offer Kostuma Pro too.
      for (const path of ["/basket", "/account"]) {
        await page.goto(path)
        await expect(
          page
            .getByRole("region", { name: "The Fitting Room" })
            .getByRole("button", { name: "Get Kostuma Pro" })
        ).toBeVisible()
      }
      expect(errors).toEqual([])
    })
  })
})
