// @vitest-environment node
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { youcamProvider } = await import("./youcam")
const { ProviderError } = await import("./provider")

import sharp from "sharp"

import type { Render } from "./render-plan"

const KEY = "test-key"
const IMAGE = new Uint8Array([1, 2, 3])
const GARMENT = new Uint8Array([4, 5, 6, 7])
// What makeup and hair come back as: a PNG with an alpha channel.
const RESULT = new Uint8Array(
  await sharp({
    create: { width: 8, height: 8, channels: 4, background: "#80402080" },
  })
    .png()
    .toBuffer()
)
const outfit: Render = {
  tool: "clothes",
  garment: "ghostface",
  category: "full_body",
  from: "body",
  after: null,
}

const makeup: Render = {
  tool: "makeup",
  from: "face",
  after: 0,
  size: [8, 8],
  effects: [
    {
      category: "skin_smooth",
      skinSmoothStrength: 0,
      skinSmoothColorIntensity: 0,
    },
  ],
}
const hair: Render = {
  tool: "hair",
  from: 1,
  after: 0,
  size: [8, 8],
  pattern: { name: "full" },
  palettes: [{ color: "#151515", color_intensity: 85, shine_intensity: 20 }],
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

/** A fake YouCam answering each URL with the next response queued for it. */
function youcam(routes: Record<string, (init?: RequestInit) => Response>) {
  const calls: { url: string; init?: RequestInit }[] = []
  const fetcher = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      calls.push({ url, init })
      for (const [prefix, answer] of Object.entries(routes))
        if (url.startsWith(prefix)) return answer(init)
      throw new Error(`Unexpected call: ${url}`)
    }
  )
  return { fetcher: fetcher as unknown as typeof fetch, calls }
}

const API = "https://yce-api-01.makeupar.com"
const uploadAnswer = () =>
  json({
    status: 200,
    data: {
      files: [
        {
          file_id: "file-1",
          requests: [
            {
              url: "https://upload.example/put",
              method: "PUT",
              headers: { "Content-Type": "image/jpeg", "Content-Length": 3 },
            },
          ],
        },
      ],
    },
  })

describe("youcamProvider.start", () => {
  it("uploads the photo, then starts a makeup task on it", async () => {
    const { fetcher, calls } = youcam({
      [`${API}/s2s/v2.0/file`]: uploadAnswer,
      "https://upload.example/put": () => new Response(null, { status: 200 }),
      [`${API}/s2s/v2.0/task/makeup-vto`]: () =>
        json({ status: 200, data: { task_id: "task-1" } }),
    })
    const task = await youcamProvider(KEY, fetcher).start(makeup, {
      source: IMAGE,
    })
    expect(task).toBe("task-1")

    const [file, put, run] = calls
    expect(file.init?.method).toBe("POST")
    expect(new Headers(file.init?.headers).get("authorization")).toBe(
      "Bearer test-key"
    )
    expect(JSON.parse(String(file.init?.body))).toEqual({
      files: [
        { content_type: "image/jpeg", file_name: "face.jpg", file_size: 3 },
      ],
    })
    expect(put.init?.method).toBe("PUT")
    expect(put.init?.body).toEqual(IMAGE)
    expect(new Headers(put.init?.headers).get("content-length")).toBe("3")
    // The key never goes to the upload URL.
    expect(new Headers(put.init?.headers).get("authorization")).toBeNull()
    expect(JSON.parse(String(run.init?.body))).toEqual({
      src_file_id: "file-1",
      version: "1.0",
      effects: makeup.tool === "makeup" ? makeup.effects : [],
    })
  })

  it("starts a hair task with its pattern and palettes", async () => {
    const { fetcher, calls } = youcam({
      [`${API}/s2s/v2.0/file`]: uploadAnswer,
      "https://upload.example/put": () => new Response(null),
      [`${API}/s2s/v2.0/task/hair-color`]: () =>
        json({ status: 200, data: { task_id: "task-2" } }),
    })
    expect(
      await youcamProvider(KEY, fetcher).start(hair, { source: IMAGE })
    ).toBe("task-2")
    expect(JSON.parse(String(calls[2].init?.body))).toEqual({
      src_file_id: "file-1",
      pattern: { name: "full" },
      palettes: [
        { color: "#151515", color_intensity: 85, shine_intensity: 20 },
      ],
    })
  })

  it("uploads the body photo and the garment, then tries the outfit on", async () => {
    let uploads = 0
    const { fetcher, calls } = youcam({
      [`${API}/s2s/v2.0/file`]: () => {
        uploads += 1
        return json({
          data: {
            files: [
              {
                file_id: `file-${uploads}`,
                requests: [
                  {
                    url: `https://upload.example/${uploads}`,
                    method: "PUT",
                    headers: {},
                  },
                ],
              },
            ],
          },
        })
      },
      "https://upload.example/": () => new Response(null),
      [`${API}/s2s/v2.0/task/cloth-v4`]: () =>
        json({ status: 200, data: { task_id: "task-3" } }),
    })
    const task = await youcamProvider(KEY, fetcher).start(outfit, {
      source: IMAGE,
      garment: GARMENT,
    })
    expect(task).toBe("task-3")
    const puts = calls.filter((call) =>
      call.url.startsWith("https://upload.example/")
    )
    expect(puts.map((call) => call.init?.body)).toEqual([IMAGE, GARMENT])
    expect(JSON.parse(String(calls.at(-1)?.init?.body))).toEqual({
      src_file_id: "file-1",
      ref_file_id: "file-2",
      garment_category: "full_body",
      change_shoes: true,
      filter_multi_person: "off",
    })
  })

  it("never starts an outfit without its garment", async () => {
    const { fetcher } = youcam({})
    await expect(
      youcamProvider(KEY, fetcher).start(outfit, { source: IMAGE })
    ).rejects.toMatchObject({ reason: "failed", retry: false })
  })

  it.each([
    [401, "InvalidApiKey", "unavailable", false],
    [400, "CreditInsufficiency", "unavailable", false],
    [429, "", "failed", true],
    [503, "", "failed", true],
    [400, "InvalidParameters", "failed", false],
  ])(
    "turns HTTP %i %s into %s (retry: %s)",
    async (status, code, reason, retry) => {
      const { fetcher } = youcam({
        [`${API}/s2s/v2.0/file`]: () =>
          json({ status, error_code: code }, status),
      })
      const error = await youcamProvider(KEY, fetcher)
        .start(makeup, { source: IMAGE })
        .catch((caught: unknown) => caught)
      expect(error).toBeInstanceOf(ProviderError)
      expect(error).toMatchObject({ reason, retry })
    }
  )

  it("tries again later when YouCam can't be reached", async () => {
    const fetcher = vi.fn(async () => {
      throw new TypeError("fetch failed")
    }) as unknown as typeof fetch
    await expect(
      youcamProvider(KEY, fetcher).start(makeup, { source: IMAGE })
    ).rejects.toMatchObject({ reason: "failed", retry: true })
  })

  it("tries again later when the upload fails", async () => {
    const { fetcher } = youcam({
      [`${API}/s2s/v2.0/file`]: uploadAnswer,
      "https://upload.example/put": () => new Response(null, { status: 500 }),
    })
    await expect(
      youcamProvider(KEY, fetcher).start(makeup, { source: IMAGE })
    ).rejects.toMatchObject({ reason: "failed", retry: true })
  })
})

describe("youcamProvider.check", () => {
  it("is running while YouCam works", async () => {
    const { fetcher, calls } = youcam({
      [`${API}/s2s/v2.0/task/makeup-vto/task-1`]: () =>
        json({ status: 200, data: { task_status: "running" } }),
    })
    expect(await youcamProvider(KEY, fetcher).check("task-1", makeup)).toEqual({
      status: "running",
    })
    expect(calls[0].init?.method ?? "GET").toBe("GET")
  })

  it("downloads the result when done", async () => {
    const { fetcher } = youcam({
      [`${API}/s2s/v2.0/task/hair-color/task-2`]: () =>
        json({
          status: 200,
          data: {
            task_status: "success",
            results: { url: "https://results.example/r.jpg" },
          },
        }),
      "https://results.example/r.jpg": () => new Response(RESULT),
    })
    const state = await youcamProvider(KEY, fetcher).check("task-2", hair)
    if (state.status !== "done") throw new Error("done expected")
    // Kept as a JPEG on white, whatever YouCam sent.
    const kept = await sharp(state.image).metadata()
    expect(kept).toMatchObject({ format: "jpeg", width: 8, height: 8 })
    expect(kept.hasAlpha).toBe(false)
  })

  it("tries again when the result isn't a picture", async () => {
    const { fetcher } = youcam({
      [`${API}/s2s/v2.0/task/makeup-vto/t`]: () =>
        json({
          data: {
            task_status: "success",
            results: { url: "https://results.example/x" },
          },
        }),
      "https://results.example/x": () => new Response("<html>"),
    })
    await expect(
      youcamProvider(KEY, fetcher).check("t", makeup)
    ).rejects.toMatchObject({ reason: "failed", retry: true })
  })

  it("reads a result listed as download_url too", async () => {
    const { fetcher } = youcam({
      [`${API}/s2s/v2.0/task/makeup-vto/t`]: () =>
        json({
          data: {
            task_status: "success",
            results: [{ download_url: "https://results.example/r.jpg" }],
          },
        }),
      "https://results.example/r.jpg": () => new Response(RESULT),
    })
    expect(await youcamProvider(KEY, fetcher).check("t", makeup)).toMatchObject(
      {
        status: "done",
      }
    )
  })

  it("finds a result listed deeper, and brings it to the face photo's size", async () => {
    const { fetcher } = youcam({
      [`${API}/s2s/v2.0/task/makeup-vto/t`]: () =>
        json({
          data: {
            task_status: "success",
            results: { images: [{ url: "https://results.example/r.jpg" }] },
          },
        }),
      "https://results.example/r.jpg": () => new Response(RESULT),
    })
    const state = await youcamProvider(KEY, fetcher).check("t", {
      ...makeup,
      size: [4, 6],
    } as Render)
    if (state.status !== "done") throw new Error("done expected")
    expect(await sharp(state.image).metadata()).toMatchObject({
      width: 4,
      height: 6,
    })
  })

  it.each([
    ["makeup", "error_face_angle_invalid", "face_photo", false],
    ["makeup", "error_face_position_too_small", "face_photo", false],
    ["hair", "error_no_face", "face_photo", false],
    ["clothes", "error_pose", "body_photo", false],
    ["clothes", "error_no_face", "body_photo", false],
    ["clothes", "error_multi_person", "body_photo", false],
    ["clothes", "error_invalid_ref", "failed", false],
    ["clothes", "error_editing_failed", "failed", false],
    ["makeup", "error_nsfw_content_detected", "photo_rejected", false],
    ["makeup", "error_below_min_image_size", "photo_rejected", false],
    ["makeup", "unknown_internal_error", "failed", true],
    ["clothes", "error_download_image", "failed", true],
    ["makeup", "invalid_parameter", "failed", false],
  ] as const)("turns %s's %s into %s", async (tool, code, reason, retry) => {
    const path = {
      clothes: "cloth-v4",
      makeup: "makeup-vto",
      hair: "hair-color",
    }[tool]
    const { fetcher } = youcam({
      [`${API}/s2s/v2.0/task/${path}/t`]: () =>
        json({
          data: { task_status: "error", error: code, error_message: "x" },
        }),
    })
    const render = { clothes: outfit, makeup, hair }[tool]
    expect(await youcamProvider(KEY, fetcher).check("t", render)).toMatchObject(
      {
        status: "error",
        reason,
        retry,
      }
    )
  })
})

describe("youcamProvider.discard", () => {
  it("deletes the task, and never fails the visitor if it can't", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const { fetcher, calls } = youcam({
      [`${API}/s2s/v2.0/task/delete`]: () =>
        json({ status: 400, error_code: "InvalidTaskId" }, 400),
    })
    await youcamProvider(KEY, fetcher).discard("task-1")
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      task_id: "task-1",
    })
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
