import "server-only"

import sharp from "sharp"

import type * as Garment from "./garment"

/**
 * The garments of the e2e test build only (E2E=1, see next.config.ts): a
 * plain dark coat on white, so no test waits on Cloud Storage.
 */
export const garmentImage: typeof Garment.garmentImage = async () =>
  new Uint8Array(
    await sharp({
      create: { width: 600, height: 900, channels: 3, background: "#FFFFFF" },
    })
      .composite([
        {
          input: {
            create: {
              width: 360,
              height: 760,
              channels: 3,
              background: "#2A2233",
            },
          },
          top: 70,
          left: 120,
        },
      ])
      .jpeg()
      .toBuffer()
  )
