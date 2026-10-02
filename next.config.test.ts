// @vitest-environment node
import { matchRemotePattern } from "next/dist/shared/lib/match-remote-pattern"
import { describe, expect, it } from "vitest"

import { costumes } from "@/content/costumes"

import config, { costumePhotos } from "./next.config"

const allowed = (url: string) => matchRemotePattern(costumePhotos, new URL(url))

describe("the image optimizer's remote photos", () => {
  it("allows every costume photo", () => {
    const urls = costumes.flatMap((costume) =>
      costume.images.map((photo) => photo.url)
    )
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.filter((url) => !allowed(url))).toEqual([])
  })

  it("allows nothing else: other folders, buckets, hosts, ports, queries or http", () => {
    for (const url of [
      "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fx.webp",
      "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fx.webp?alt=media&token=abc",
      "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/users%2Fphoto.png?alt=media",
      "https://firebasestorage.googleapis.com/v0/b/someone-else.appspot.com/o/costumes%2Fx.png?alt=media",
      "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fx/y.png",
      "https://example.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fx.png",
      "https://firebasestorage.googleapis.com:8443/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fx.png",
      "http://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fx.png",
    ]) {
      expect(allowed(url), url).toBe(false)
    }
  })

  it("is the only remote source, and redirects are never followed", () => {
    expect(config.images?.remotePatterns).toEqual([costumePhotos])
    expect(config.images?.maximumRedirects).toBe(0)
  })
})
