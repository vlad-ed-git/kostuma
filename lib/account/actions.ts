"use server"

import { hasLocale } from "next-intl"

import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
// By their @/ names: the e2e build swaps these for its stand-ins.
import { eraseAccount, erasePhotos } from "@/lib/account/erase"
import { deleteSession, getUser } from "@/lib/auth/session"

/** What deleting came to: codes the account page translates. */
export type EraseResult = { ok: true } | { ok: false; error: EraseError }

export type EraseError = "signed_out" | "failed"

/** Deletes the signed-in account's photos and pictures (lib/account/erase.ts). */
export async function deletePhotos(): Promise<EraseResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "signed_out" }
  try {
    await erasePhotos(user.uid)
    return { ok: true }
  } catch (error) {
    console.error("Could not delete an account's photos.", error)
    return { ok: false, error: "failed" }
  }
}

/**
 * Deletes the signed-in account and everything kept with it, then signs
 * out and goes home.
 */
export async function deleteAccount(locale: string): Promise<EraseResult> {
  const user = await getUser()
  if (!user) return { ok: false, error: "signed_out" }
  try {
    await eraseAccount(user.uid)
  } catch (error) {
    console.error("Could not delete an account.", error)
    return { ok: false, error: "failed" }
  }
  await deleteSession()
  redirect({
    href: "/",
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  })
  // Not reached: redirect() ends the action.
  return { ok: true }
}
