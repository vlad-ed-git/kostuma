import { devices, expect, test as setup, type Page } from "@playwright/test"

// The image optimizer encodes a photo the first time a size of it is asked
// for (AVIF costs CPU), then serves it from its cache. A fresh build (every
// CI run) starts cold: done here once, before the tests run in parallel, so
// no test waits on a server busy encoding while it clicks and hovers.

/** Waits until every photo on the page has arrived, row by row, as a reader
 * scrolls (the browser asks for the lazy ones as they come near). */
async function loadEveryPhoto(page: Page) {
  const photos = page.locator("main img")
  const count = await photos.count()
  for (let i = 0; i < count; i++) {
    const photo = photos.nth(i)
    await photo.scrollIntoViewIfNeeded()
    await expect
      .poll(
        () =>
          photo.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
          ),
        { timeout: 30_000 }
      )
      .toBe(true)
  }
}

setup("warm the image cache", async ({ browser }) => {
  setup.setTimeout(300_000)
  // The two projects' screens: their sizes and pixel densities pick
  // different files.
  for (const device of [devices["Desktop Chrome"], devices["Pixel 7"]]) {
    const context = await browser.newContext({
      ...device,
      reducedMotion: "reduce",
    })
    // The basket's small thumbnails too: a basket of the costumes its
    // tests put in (e2e/basket.spec.ts).
    await context.addInitScript(() => {
      localStorage.setItem(
        "kostuma.basket",
        JSON.stringify({
          v: 1,
          slugs: [
            "ghostface",
            "michael-myers",
            "pearl",
            "carrie-white",
            "nikki-freaky-nikki-freeman",
            "dani-the-may-queen",
          ],
        })
      )
    })
    const page = await context.newPage()
    // Every costume's first photo, then the pages whose photos tests open.
    for (const path of [
      "/",
      "/costumes/ghostface",
      "/costumes/dollface",
      "/basket",
    ]) {
      await page.goto(path)
      await loadEveryPhoto(page)
    }
    await context.close()
  }
})
