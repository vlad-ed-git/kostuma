import "server-only"

import { cookies, headers } from "next/headers"
import { cache } from "react"

import type * as Session from "./session"

/**
 * The session of the e2e test build only (E2E=1: next.config.ts loads this
 * file in place of session.ts; a normal build never contains it). A browser
 * with the `e2e-session` cookie counts as signed in, on localhost only, so
 * the tests see signed-in pages without Firebase.
 */

const cookieName = "e2e-session"

export const e2eUser: Session.User = {
  uid: "e2e-visitor",
  name: "Wednesday Addams",
  email: "wednesday@example.com",
}

export type User = Session.User

export const SESSION_SECONDS: typeof Session.SESSION_SECONDS = 14 * 24 * 60 * 60

export const getUser: typeof Session.getUser = cache(async () => {
  const host = (await headers()).get("host") ?? ""
  if (!isLocalhost(host)) return null
  return (await cookies()).has(cookieName) ? e2eUser : null
})

export const saveSession: typeof Session.saveSession = async () => {
  throw new Error("The e2e build signs in with a cookie, not with Firebase.")
}

export const deleteSession: typeof Session.deleteSession = async () => {
  ;(await cookies()).delete(cookieName)
}

function isLocalhost(host: string) {
  const name = host.replace(/:\d+$/, "")
  return name === "localhost" || name === "127.0.0.1"
}
