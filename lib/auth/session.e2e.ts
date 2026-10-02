import "server-only"

import { cookies, headers } from "next/headers"
import { cache } from "react"

import type * as Session from "./session"

/**
 * The session of the e2e test build only (E2E=1: next.config.ts loads this
 * file in place of session.ts; a normal build never contains it). A browser
 * with the `e2e-session` cookie counts as signed in, on localhost only, so
 * the tests see signed-in pages without Firebase. Its value "1" is Wednesday
 * Addams; any other name (`[a-z0-9-]`) is a visitor of their own, so tests
 * running side by side never share an account's Fitting Room.
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
  const value = (await cookies()).get(cookieName)?.value
  if (value === undefined) return null
  if (value === "1" || !/^[a-z0-9-]{1,40}$/.test(value)) return e2eUser
  return { ...e2eUser, uid: `${e2eUser.uid}-${value}` }
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
