// @vitest-environment node
import { Webhook } from "standardwebhooks"
import { describe, expect, it } from "vitest"

import { readNotice } from "./webhook"

const secretOf = (words: string) =>
  `whsec_${Buffer.from(words).toString("base64")}`
const SECRET = secretOf("a test secret, 32 bytes long....")

/** A delivery as YouCam signs it (docs, "Webhook"). */
function delivery(
  data: unknown,
  { secret = SECRET, sent = new Date(), id = "msg_1:1761112848" } = {}
) {
  const body = JSON.stringify({ created_at: 1761112848, data })
  const headers = new Headers({
    "webhook-id": id,
    "webhook-timestamp": String(Math.floor(sent.getTime() / 1000)),
    "webhook-signature": new Webhook(secret).sign(id, sent, body),
  })
  return { body, headers }
}

describe("readNotice", () => {
  it("reads a task's end from a signed delivery", () => {
    const { body, headers } = delivery({
      task_id: "task-1",
      task_status: "success",
    })
    expect(readNotice(body, headers, SECRET)).toEqual({
      delivery: "msg_1:1761112848",
      task: "task-1",
      status: "success",
    })
  })

  it("refuses a delivery signed with another secret, or changed on the way", () => {
    const data = { task_id: "task-1", task_status: "error" }
    const forged = delivery(data, {
      secret: secretOf("another secret, 32 bytes long..."),
    })
    expect(readNotice(forged.body, forged.headers, SECRET)).toBeNull()
    const changed = delivery(data)
    expect(
      readNotice(
        changed.body.replace("task-1", "task-2"),
        changed.headers,
        SECRET
      )
    ).toBeNull()
  })

  it("refuses a delivery older than five minutes, or unsigned", () => {
    const old = delivery(
      { task_id: "task-1", task_status: "success" },
      { sent: new Date(Date.now() - 6 * 60_000) }
    )
    expect(readNotice(old.body, old.headers, SECRET)).toBeNull()
    expect(readNotice(old.body, new Headers(), SECRET)).toBeNull()
  })

  it("refuses a notice without a task or a final status", () => {
    for (const data of [
      { task_status: "success" },
      { task_id: "", task_status: "success" },
      { task_id: "task-1", task_status: "running" },
      null,
    ]) {
      const { body, headers } = delivery(data)
      expect(readNotice(body, headers, SECRET)).toBeNull()
    }
  })
})
