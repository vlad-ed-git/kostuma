import { chromium, expect, test } from "@playwright/test"
import sharp from "sharp"

// Headless Chromium hides scrollbars (`--hide-scrollbars`): this test
// opens one that shows them, to look at the page's own.
test("the scrollbar is a clot of blood in a grimy gutter", async ({
  baseURL,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop scrollbars only")
  const browser = await chromium.launch({
    ignoreDefaultArgs: ["--hide-scrollbars"],
  })
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      reducedMotion: "reduce",
    })
    await page.goto(baseURL ?? "/")
    const gutter = await page.evaluate(
      () => window.innerWidth - document.documentElement.clientWidth
    )
    expect(gutter).toBe(13)

    const png = await page.screenshot({
      clip: { x: 1280 - gutter, y: 0, width: gutter, height: 800 },
    })
    const { data, info } = await sharp(png)
      .raw()
      .toBuffer({ resolveWithObject: true })
    const at = (y: number) => {
      const i = (y * info.width + Math.floor(info.width / 2)) * info.channels
      return { r: data[i], g: data[i + 1], b: data[i + 2] }
    }
    // At the top of the page, the thumb is at the top: blood red.
    const thumb = at(20)
    expect(thumb.r).toBeGreaterThan(90)
    expect(thumb.r).toBeGreaterThan(thumb.g * 2)
    // Far below it, the gutter: dark, never grey, its rot red.
    let darkest = 255
    let reddest = 0
    for (let y = 400; y < 790; y += 5) {
      const { r, g } = at(y)
      darkest = Math.min(darkest, r)
      reddest = Math.max(reddest, r - g)
    }
    expect(darkest).toBeLessThan(30)
    expect(reddest).toBeGreaterThan(15)
  } finally {
    await browser.close()
  }
})
