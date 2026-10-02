import { getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { inMemoryPersistence, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

/**
 * Firebase in the browser. Import it only with `import()` from code that
 * runs for signed-in visitors: guests never download it.
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

const required = ["apiKey", "authDomain", "projectId", "appId"] as const

function clientApp(): FirebaseApp {
  const missing = required.filter((name) => !config[name])
  if (missing.length > 0) {
    throw new Error(
      `Firebase is not configured: set ${missing
        .map((name) => `NEXT_PUBLIC_${name}`)
        .join(", ")} (see .env.example).`
    )
  }
  return getApps()[0] ?? initializeApp(config)
}

/**
 * Firebase Auth in the browser. The session itself is the server's
 * (feat/auth), so nothing is kept in browser storage.
 */
export function clientAuth() {
  // Returns the existing instance when called again with the same options.
  return initializeAuth(clientApp(), { persistence: inMemoryPersistence })
}

export function clientDb() {
  return getFirestore(clientApp())
}
