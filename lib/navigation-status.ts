/**
 * Whether the app is waiting for a page (spec §7.2: the cue mark). Links
 * and the language switch report their pending state here; the cue mark
 * reads it through `useSyncExternalStore`.
 */

type Listener = () => void

const listeners = new Set<Listener>()
let pending = 0

/** Marks a navigation as started. Returns the function that ends it. */
export function beginNavigation() {
  pending += 1
  notify()
  let ended = false
  return () => {
    if (ended) return
    ended = true
    pending -= 1
    notify()
  }
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function isNavigating() {
  return pending > 0
}

/** The server never waits for a navigation. */
export function isNavigatingOnServer() {
  return false
}

function notify() {
  for (const listener of listeners) listener()
}
