import "server-only"

import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

// These errors are for developers (the server's log): a visitor only ever
// reads a translated message.
function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. See .env.example.`)
  return value
}

/**
 * The Admin SDK's app, made once. Credentials: the service account's
 * FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (Vercel), else the file at
 * GOOGLE_APPLICATION_CREDENTIALS (local). Against the emulators
 * (FIREBASE_AUTH_EMULATOR_HOST) none is needed.
 */
function adminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const projectId = required("NEXT_PUBLIC_projectId")
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST)
    return initializeApp({ projectId })

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (clientEmail && privateKey) {
    return initializeApp({
      projectId,
      credential: cert({
        projectId,
        clientEmail,
        // Hosts often store the key's line breaks as the two characters "\n".
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    })
  }
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (keyFile) {
    // Read as a service account, so tokens are signed here. Through
    // applicationDefault(), custom tokens (the basket's sign-in) would be
    // signed by Google's IAM API, which needs another API and role.
    return initializeApp({ projectId, credential: cert(keyFile) })
  }
  throw new Error(
    "Firebase Admin has no credentials: set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS). See .env.example."
  )
}

/** Firebase Auth with admin rights: accounts, session cookies, tokens. */
export function adminAuth() {
  return getAuth(adminApp())
}

/** Firestore with admin rights: the security rules do not apply. */
export function adminDb() {
  return getFirestore(adminApp())
}

/**
 * The project's Cloud Storage bucket with admin rights: storage.rules do not
 * apply (they keep everything but the costume photos closed to browsers).
 */
export function adminBucket() {
  return getStorage(adminApp()).bucket(required("NEXT_PUBLIC_storageBucket"))
}
