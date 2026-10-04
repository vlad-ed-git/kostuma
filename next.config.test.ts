// @vitest-environment node
import { existsSync } from "node:fs"
import path from "node:path"

import { matchRemotePattern } from "next/dist/shared/lib/match-remote-pattern"
import { describe, expect, it } from "vitest"

import { costumes } from "@/content/costumes"
import { sampleTransformation } from "@/content/sample-transformation"

import config, { costumePhotos, e2eAliases, e2eBundling } from "./next.config"

const allowed = (url: string) => matchRemotePattern(costumePhotos, new URL(url))

describe("the image optimizer's remote photos", () => {
  it("allows every costume photo", () => {
    const urls = costumes.flatMap((costume) =>
      costume.images.map((photo) => photo.url)
    )
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.filter((url) => !allowed(url))).toEqual([])
  })

  it("allows every frame of the home page's sample transformation", () => {
    const urls = sampleTransformation.frames.map((frame) => frame.url)
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

describe("the e2e build's stand-ins", () => {
  it("swaps every stand-in in, with Turbopack and with webpack, from one map", () => {
    const root = "/project"
    const bundling = e2eBundling(root)
    expect(bundling.turbopack.resolveAlias).toEqual(e2eAliases)
    const config = bundling.webpack({
      resolve: { alias: { next: "/next" } },
    })
    expect(config.resolve?.alias).toEqual({
      next: "/next",
      ...Object.fromEntries(
        Object.entries(e2eAliases).map(([name, file]) => [
          `${name}$`,
          path.join(root, file),
        ])
      ),
    })
  })

  it("names a twin for every module, and every twin exists", () => {
    for (const [name, file] of Object.entries(e2eAliases)) {
      expect(file).toBe(`./${name.slice(2)}.e2e.ts`)
      expect(existsSync(file), file).toBe(true)
    }
  })

  it("never bundles them outside the e2e build", () => {
    const names = Object.keys(e2eAliases)
    const turbopack = Object.keys(config.turbopack?.resolveAlias ?? {})
    expect(turbopack.filter((name) => names.includes(name))).toEqual([])
    const webpacked = config.webpack?.(
      { context: process.cwd(), resolve: { alias: {} } },
      {} as never
    ) as { resolve: { alias: Record<string, unknown> } } | undefined
    const webpack = Object.keys(webpacked?.resolve.alias ?? {})
    expect(
      webpack.filter((name) => names.includes(name.replace(/\$$/, "")))
    ).toEqual([])
  })
})
