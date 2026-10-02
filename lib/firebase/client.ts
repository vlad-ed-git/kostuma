import { getApps, initializeApp, type FirebaseApp } from "firebase/app"
import {
  browserPopupRedirectResolver,
  connectAuthEmulator,
  inMemoryPersistence,
  initializeAuth,
  signOut,
  type Auth,
} from "firebase/auth"
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore"

import { onSignOut } from "./signed-in"

/**
 * Firebase in the browser. Import it only with `import()`, from code that
 * runs when someone signs in or is signed in: other visitors never download
 * it.
 *
 * The values are written out in full so Next.js inlines them into the
 * browser bundle (they are public: the Firebase web app's settings).
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId,
}

/** The local emulators' host, for the emulator e2e tests only. */
const emulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST

const required = ["apiKey", "authDomain", "projectId", "appId"] as const

function clientApp(): FirebaseApp {
  const missing = required.filter((name) => !config[name])
  if (missing.length > 0) {
    // For developers: visitors only ever read translated messages.
    throw new Error(
      `Firebase is not configured: set ${missing
        .map((name) => `NEXT_PUBLIC_${name}`)
        .join(", ")} (see .env.example).`
    )
  }
  return getApps()[0] ?? initializeApp(config)
}

let auth: Auth | undefined
let db: Firestore | undefined

/**
 * Firebase Auth in the browser. The session itself is the server's cookie,
 * so nothing is kept in browser storage: this page forgets the sign-in when
 * it closes, and signs in again with a token from the session when it
 * needs Firebase (lib/basket/firestore.ts).
 *
 * `popups`: the sign-in pages ask for Google's window to be ready ahead, so
 * a click opens it at once (a window opened later is blocked).
 */
export function clientAuth({ popups = false } = {}) {
  if (auth) return auth
  auth = initializeAuth(clientApp(), {
    persistence: inMemoryPersistence,
    ...(popups && { popupRedirectResolver: browserPopupRedirectResolver }),
  })
  if (emulators) {
    connectAuthEmulator(auth, `http://${emulators}:9099`, {
      disableWarnings: true,
    })
  }
  const signedIn = auth
  onSignOut(() => signOut(signedIn))
  return auth
}

export function clientDb() {
  if (db) return db
  db = getFirestore(clientApp())
  if (emulators) connectFirestoreEmulator(db, emulators, 8085)
  return db
}
