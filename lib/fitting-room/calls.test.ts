import { describe, expect, it } from "vitest"

import {
  bucketOf,
  busyDelay,
  CAPACITY,
  checkEvery,
  DEBT,
  PER_SECOND,
  take,
  tokensAt,
} from "./calls"

describe("the call budget", () => {
  it("stays under YouCam's 250 calls in any 300 s, whatever the order", () => {
    expect(CAPACITY + 300 * PER_SECOND + DEBT).toBeLessThan(250)
  })

  it("starts full, and takes calls while it has them", () => {
    expect(tokensAt(null, 0)).toBe(CAPACITY)
    let bucket = take(null, CAPACITY - 1, 0)
    expect(bucket).toEqual({ tokens: 1, at: 0 })
    bucket = take(bucket, 1, 0)
    expect(bucket).toEqual({ tokens: 0, at: 0 })
    expect(take(bucket, 1, 0)).toBeNull()
  })

  it("refills over time, never past full", () => {
    const empty = { tokens: 0, at: 0 }
    expect(tokensAt(empty, 1_000)).toBeCloseTo(PER_SECOND)
    expect(take(empty, 2, 1_000)).toBeNull()
    expect(take(empty, 2, Math.ceil(2_000 / PER_SECOND))).not.toBeNull()
    expect(tokensAt(empty, 3_600_000)).toBe(CAPACITY)
  })

  it("lets a deletion run a little into debt, no further", () => {
    let bucket = take(null, CAPACITY, 0)
    for (let n = 0; n < DEBT; n++) bucket = take(bucket, 1, 0, true)
    expect(bucket?.tokens).toBe(-DEBT)
    expect(take(bucket, 1, 0, true)).toBeNull()
    expect(take(bucket, 1, 0)).toBeNull()
  })

  it("reads a stored bucket, or none when malformed", () => {
    expect(bucketOf({ tokens: 3.5, at: 9 })).toEqual({ tokens: 3.5, at: 9 })
    expect(bucketOf({ tokens: "3", at: 9 })).toBeNull()
    expect(bucketOf(undefined)).toBeNull()
  })
})

describe("asking and waiting", () => {
  it("asks about an outfit every 10 s, a makeup or hair step every 5 s", () => {
    expect(checkEvery({ tool: "clothes" })).toBe(10_000)
    expect(checkEvery({ tool: "makeup" })).toBe(5_000)
    expect(checkEvery({ tool: "hair" })).toBe(5_000)
  })

  it("waits 5 s after a busy answer, doubling, at most a minute", () => {
    expect([1, 2, 3, 4, 5, 6, 10].map(busyDelay)).toEqual([
      5_000, 10_000, 20_000, 40_000, 60_000, 60_000, 60_000,
    ])
  })
})
