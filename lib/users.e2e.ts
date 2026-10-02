import "server-only"

import type * as Users from "./users"

/**
 * The profiles of the e2e test build only (E2E=1, see next.config.ts): the
 * mock session's visitor has one, made on a fixed day. Nothing reaches
 * Firestore.
 */

export const FREE_TRY_ONS: typeof Users.FREE_TRY_ONS = 2

export type NewProfile = Users.NewProfile
export type Profile = Users.Profile

export const createProfile: typeof Users.createProfile = async () => {
  throw new Error("The e2e build has no Firestore.")
}

export const recordSignIn: typeof Users.recordSignIn = async () => {}

export const getProfile: typeof Users.getProfile = async (uid) =>
  uid === "e2e-visitor"
    ? {
        name: "Wednesday Addams",
        email: "wednesday@example.com",
        credits: 2,
        createdAt: new Date("2026-09-13T12:00:00Z"),
      }
    : null

export const hasProfile: typeof Users.hasProfile = async (uid) =>
  uid === "e2e-visitor"
