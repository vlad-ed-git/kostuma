/**
 * Signing out of Firebase in this page, without downloading Firebase to do
 * it: lib/firebase/client.ts leaves its sign-out here once it has loaded.
 * Nothing to do when it never loaded.
 */
let signOut: (() => Promise<void>) | undefined

export function onSignOut(handler: () => Promise<void>) {
  signOut = handler
}

export async function signOutOfFirebase() {
  await signOut?.()
}
