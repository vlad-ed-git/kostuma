// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

import { dailyCheck } from "./daily"
import { memoryStore } from "./memory-store"
import { ProviderError, type RenderProvider } from "./provider"

const NOW = Date.UTC(2026, 9, 20, 6)

const provider = (balance: () => Promise<number | null>) =>
  ({ name: "youcam", balance }) as unknown as RenderProvider

afterEach(() => vi.restoreAllMocks())

describe("dailyCheck", () => {
  it("keeps YouCam's balance, and closes the Fitting Room below the floor", async () => {
    const store = memoryStore({ controls: { floor: 50 } })
    const report = await dailyCheck(
      { store, provider: provider(async () => 49) },
      NOW
    )
    expect(report).toEqual({ balance: 49, open: false, failed: [] })
    expect((await store.capacity(NOW)).controls).toMatchObject({
      open: false,
      closedFor: "units",
      balance: 49,
      balanceAt: NOW,
    })
  })

  it("reopens the Fitting Room Kostuma closed once units are back", async () => {
    const store = memoryStore()
    await store.close("units")
    const report = await dailyCheck(
      { store, provider: provider(async () => 1000) },
      NOW
    )
    expect(report.open).toBe(true)
  })

  it("never reopens what the owner closed", async () => {
    const store = memoryStore({ controls: { open: false } })
    await store.close("units")
    expect(
      (await dailyCheck({ store, provider: provider(async () => 1000) }, NOW))
        .open
    ).toBe(false)
  })

  it("says which part failed, and leaves the controls alone", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const store = memoryStore()
    const report = await dailyCheck(
      {
        store,
        provider: provider(async () => {
          throw new ProviderError("timeout", "failed", true)
        }),
      },
      NOW
    )
    expect(report).toEqual({ balance: null, open: null, failed: ["balance"] })
    expect((await store.capacity(NOW)).controls.open).toBe(true)
  })

  it("asks nothing without a renderer, or of the free fake", async () => {
    const store = memoryStore()
    expect(await dailyCheck({ store, provider: null }, NOW)).toEqual({
      balance: null,
      open: null,
      failed: [],
    })
    expect(
      await dailyCheck({ store, provider: provider(async () => null) }, NOW)
    ).toMatchObject({ balance: null })
  })
})
