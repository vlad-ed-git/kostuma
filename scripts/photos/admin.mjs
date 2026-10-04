// The Admin SDK for the photo scripts (upload.mjs, upload-samples.mjs):
// the app with the project's credentials, and storing an object once.
//
// Credentials: the service account key in secrets/ (gitignored), or
// GOOGLE_APPLICATION_CREDENTIALS. Its contents are never printed.
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { applicationDefault, cert, initializeApp } from "firebase-admin/app"

import { CACHE_CONTROL } from "./storage.mjs"

export const PROJECT = "kostuma-73f77"
export const BUCKET = `${PROJECT}.firebasestorage.app`

const KEY = fileURLToPath(
  new URL("../../secrets/kostuma_service_account.json", import.meta.url)
)

/** The Admin app, or the process ends with what is missing. */
export async function adminApp() {
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? applicationDefault()
    : existsSync(KEY)
      ? cert(JSON.parse(await readFile(KEY, "utf8")))
      : null
  if (!credential) {
    console.error(
      "No credentials: put the service account key in secrets/kostuma_service_account.json or set GOOGLE_APPLICATION_CREDENTIALS."
    )
    process.exit(1)
  }
  return initializeApp({
    credential,
    projectId: PROJECT,
    storageBucket: BUCKET,
  })
}

/**
 * Stores the content under its path unless it is there (the names change
 * with the content, so what is there is the same); true if stored.
 * @param {import("@google-cloud/storage").Bucket} bucket
 * @param {string} path
 * @param {Uint8Array} content
 * @param {string} contentType
 * @returns {Promise<boolean>}
 */
export async function storeOnce(bucket, path, content, contentType) {
  const object = bucket.file(path)
  const [exists] = await object.exists()
  if (!exists) {
    await object.save(content, {
      resumable: false,
      metadata: { contentType, cacheControl: CACHE_CONTROL },
    })
  }
  return !exists
}
