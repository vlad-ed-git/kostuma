import {
  ACCOUNT_KEY,
  GUEST_KEY,
  cleanSlugs,
  readAccount,
  readGuest,
  writeAccount,
  writeGuest,
} from "./codec"
import {
  applyChange,
  type Change,
  type RemoteBasket,
  type RemoteState,
} from "./remote"

/**
 * My Pumpkin Basket in one tab (spec §11.4): the costumes the visitor keeps,
 * in the order added.
 *
 * Not signed in, the basket lives in this device's localStorage and follows
 * every other open tab through the `storage` event. Signed in, it lives in
 * the account (`RemoteBasket`, Firestore) and every tab and device follows
 * it live; this device keeps only a copy to show at once next time.
 *
 * - Signing in: the basket gathered as a guest joins the account's, once;
 *   once the account has it, the guest basket is emptied.
 * - Signing out: the account's basket stays with the account. The device
 *   forgets its copy and shows the guest basket, empty.
 * - The device's copy of an account basket is shown only to that account
 *   and is never merged into anything, so a costume removed on another
 *   device cannot come back from it.
 * - A change shows at once and stays shown until the account confirms or
 *   refuses it; the account's own state wins after that.
 */

export type BasketSnapshot = {
  /** False until the basket has been read: the server never knows it. */
  ready: boolean
  slugs: readonly string[]
  /** Signed in, and the account can't be reached: changes may not last. */
  unreachable: boolean
}

/**
 * What the visitor just did here (the pumpkin's ignite, the announcement),
 * or that the account refused one of their changes, which is undone.
 */
export type BasketEvent =
  | { type: "add" | "remove"; slug: string }
  | { type: "clear" }
  | { type: "refused" }

export type BasketStore = {
  subscribe(listener: () => void): () => void
  getSnapshot(): BasketSnapshot
  getServerSnapshot(): BasketSnapshot
  add(slug: string): void
  remove(slug: string): void
  clear(): void
  /**
   * The visitor's own changes in this tab (never those from elsewhere), and
   * the account's refusals of them.
   */
  onEvent(listener: (event: BasketEvent) => void): () => void
  /**
   * Whose basket this tab shows from now on: a signed-in account's uid, or
   * `null` for a guest. Returns the function that lets go of it.
   */
  connect(uid: string | null): () => void
}

type Options = {
  /** The slugs of every costume there is: anything else is dropped. */
  known: Iterable<string>
  /** The device's storage; `null` (or throwing) when there is none. */
  storage?: () => Storage | null
  /** Opens an account's basket (lib/basket/firestore.ts). */
  openRemote?: (uid: string) => Promise<RemoteBasket>
  /** Where errors of the account's basket go. */
  report?: (error: unknown) => void
  /** Where the `storage` events of other tabs arrive. */
  events?: EventTarget
  /** Waits before asking a failing account again; then it stops asking. */
  retryDelays?: readonly number[]
  /** How long a signed-in tab shows "loading" at most, without a copy. */
  readyAfter?: number
}

const NOT_READY: BasketSnapshot = Object.freeze({
  ready: false,
  slugs: Object.freeze([]),
  unreachable: false,
})

/** A change shown before the account has confirmed it. */
type Pending = {
  change: Change
  sent: boolean
  /** The guest basket joining the account: emptied once the account has it. */
  merged?: readonly string[]
}

type Guest = { kind: "guest" }

type Account = {
  kind: "account"
  uid: string
  /** The account's basket as last heard, or this device's copy of it. */
  base: readonly string[]
  ready: boolean
  unreachable: boolean
  pending: Pending[]
  remote?: RemoteBasket
  stop(): void
}

export function createBasketStore({
  known: knownSlugs,
  storage = browserStorage,
  openRemote = openAccountBasket,
  report = reportError,
  events = typeof window === "undefined" ? undefined : window,
  retryDelays = [2_000, 5_000, 15_000, 30_000, 60_000],
  readyAfter = 3_000,
}: Options): BasketStore {
  const known = new Set(knownSlugs)
  const listeners = new Set<() => void>()
  const eventListeners = new Set<(event: BasketEvent) => void>()
  let snapshot = NOT_READY
  let mode: Guest | Account | undefined
  // Once a write fails (storage full, blocked, private mode), the basket
  // lives in this tab's memory only: reading storage again would lose it.
  let memoryOnly = false
  let guestInMemory: readonly string[] = []

  function publish(next: BasketSnapshot) {
    if (
      next.ready === snapshot.ready &&
      next.unreachable === snapshot.unreachable &&
      same(next.slugs, snapshot.slugs)
    ) {
      return
    }
    snapshot = next
    for (const listener of listeners) listener()
  }

  function emit(event: BasketEvent) {
    for (const listener of eventListeners) listener(event)
  }

  /** The stored value; `undefined` when storage can't be used. */
  function read(key: string): string | null | undefined {
    if (memoryOnly) return undefined
    try {
      const area = storage()
      return area ? area.getItem(key) : undefined
    } catch {
      return undefined
    }
  }

  /** Stores a value (`null` removes it); false when storage can't be used. */
  function write(key: string, value: string | null) {
    if (memoryOnly) return false
    try {
      const area = storage()
      if (!area) return false
      if (value === null) area.removeItem(key)
      else area.setItem(key, value)
      return true
    } catch {
      memoryOnly = true
      return false
    }
  }

  function guestSlugs(): readonly string[] {
    const raw = read(GUEST_KEY)
    return raw === undefined ? guestInMemory : readGuest(raw, known)
  }

  function setGuest(slugs: readonly string[]) {
    guestInMemory = slugs
    write(GUEST_KEY, slugs.length > 0 ? writeGuest(slugs) : null)
  }

  // ── Not signed in ────────────────────────────────────────────────────

  function enterGuest() {
    // Signed out, or the session ended: the account's basket is not the
    // guest's to see.
    write(ACCOUNT_KEY, null)
    mode = { kind: "guest" }
    publish({ ready: true, slugs: guestSlugs(), unreachable: false })
  }

  function changeGuest(change: Change) {
    // From storage, not from this tab's snapshot: another tab may have
    // changed it a moment ago.
    const before = guestSlugs()
    const after = applyChange(before, change)
    if (after !== before) setGuest(after)
    const shown = snapshot.slugs
    publish({ ready: true, slugs: after, unreachable: false })
    return !same(shown, after)
  }

  // ── Signed in ────────────────────────────────────────────────────────

  function enterAccount(uid: string) {
    const cached = readAccount(read(ACCOUNT_KEY) ?? null, known)
    // Another account's copy is never shown here.
    if (cached && cached.uid !== uid) write(ACCOUNT_KEY, null)
    const mine = cached?.uid === uid ? cached : undefined

    const account: Account = {
      kind: "account",
      uid,
      base: mine?.slugs ?? [],
      ready: mine !== undefined,
      unreachable: false,
      pending: [],
      stop: () => {},
    }
    // What the visitor gathered before signing in joins the account.
    const gathered = guestSlugs()
    if (gathered.length > 0) {
      account.pending.push({
        change: { type: "add", slugs: gathered },
        sent: false,
        merged: gathered,
      })
    }
    mode = account
    showAccount(account)

    let stopped = false
    let attempt = 0
    let retry: ReturnType<typeof setTimeout> | undefined
    let unwatch: (() => void) | undefined
    // Never stuck loading: after a while, show what there is.
    const ready = setTimeout(() => {
      account.ready = true
      showAccount(account)
    }, readyAfter)

    const heard = (state: RemoteState) => {
      if (stopped) return
      attempt = 0
      account.base = cleanSlugs(state.slugs, known)
      account.ready = true
      account.unreachable = false
      if (state.confirmed) {
        write(ACCOUNT_KEY, writeAccount(uid, account.base))
      }
      showAccount(account)
    }

    const failed = (error: unknown) => {
      if (stopped) return
      report(error)
      unwatch?.()
      unwatch = undefined
      account.remote = undefined
      // Not sent yet: they wait for the account to answer again.
      account.ready = true
      account.unreachable = true
      showAccount(account)
      if (attempt < retryDelays.length) {
        retry = setTimeout(open, retryDelays[attempt++])
      }
    }

    async function open() {
      try {
        const remote = await openRemote(uid)
        if (stopped) return
        account.remote = remote
        unwatch = remote.watch(heard, failed)
        send(account)
      } catch (error) {
        failed(error)
      }
    }

    account.stop = () => {
      stopped = true
      clearTimeout(ready)
      clearTimeout(retry)
      unwatch?.()
      account.remote = undefined
    }
    void open()
  }

  function showAccount(account: Account) {
    if (mode !== account) return
    publish({
      ready: account.ready,
      unreachable: account.unreachable,
      slugs: account.pending.reduce(
        (slugs, { change }) => applyChange(slugs, change),
        account.base
      ),
    })
  }

  /** Hands the changes the account hasn't seen yet over to it, in order. */
  function send(account: Account) {
    const remote = account.remote
    if (!remote) return
    for (const pending of account.pending) {
      if (pending.sent) continue
      pending.sent = true
      remote.apply(pending.change).then(
        () => settle(account, pending, true),
        (error: unknown) => {
          report(error)
          settle(account, pending, false)
        }
      )
    }
  }

  function settle(account: Account, pending: Pending, accepted: boolean) {
    account.pending = account.pending.filter((other) => other !== pending)
    if (accepted && pending.merged) {
      // The account has them now: the guest basket lets them go, even if
      // the visitor has signed out meanwhile (they joined that account).
      const left = guestSlugs().filter(
        (slug) => !pending.merged!.includes(slug)
      )
      setGuest(left)
      if (mode?.kind === "guest") {
        publish({ ready: true, slugs: left, unreachable: false })
      }
    }
    // Refused: the account's own state shows again, and the visitor is told.
    if (!accepted) emit({ type: "refused" })
    showAccount(account)
  }

  function changeAccount(account: Account, change: Change) {
    const shown = snapshot.slugs
    if (applyChange(shown, change) === shown) return false
    account.pending.push({ change, sent: false })
    showAccount(account)
    send(account)
    return true
  }

  // ── Both ─────────────────────────────────────────────────────────────

  function change(next: Change) {
    if (!mode) return false
    return mode.kind === "guest" ? changeGuest(next) : changeAccount(mode, next)
  }

  /** Another tab changed the storage. Nothing is written back from here. */
  function onStorage(event: Event) {
    const { key } = event as StorageEvent
    if (key !== null && key !== GUEST_KEY && key !== ACCOUNT_KEY) return
    if (mode?.kind === "guest") {
      publish({ ready: true, slugs: guestSlugs(), unreachable: false })
    } else if (mode?.kind === "account" && !mode.remote) {
      // Not connected yet: another tab's copy of this account is the best
      // there is. Once connected, the account itself tells this tab.
      const cached = readAccount(read(ACCOUNT_KEY) ?? null, known)
      if (cached?.uid === mode.uid) {
        mode.base = cached.slugs
        mode.ready = true
        showAccount(mode)
      }
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => NOT_READY,
    add(slug) {
      if (!known.has(slug)) return
      if (change({ type: "add", slugs: [slug] })) emit({ type: "add", slug })
    },
    remove(slug) {
      if (change({ type: "remove", slug })) emit({ type: "remove", slug })
    },
    clear() {
      if (change({ type: "clear" })) emit({ type: "clear" })
    },
    onEvent(listener) {
      eventListeners.add(listener)
      return () => eventListeners.delete(listener)
    },
    connect(uid) {
      events?.addEventListener("storage", onStorage)
      if (uid === null) enterGuest()
      else enterAccount(uid)
      const connected = mode
      return () => {
        events?.removeEventListener("storage", onStorage)
        if (connected?.kind === "account") connected.stop()
        if (mode === connected) mode = undefined
      }
    },
  }
}

function same(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((slug, i) => slug === b[i])
}

/** localStorage, or `null` where the browser forbids it (it can throw). */
function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage
}

/** Loaded only for a signed-in visitor: guests never download Firebase. */
async function openAccountBasket(uid: string) {
  // By its alias: the e2e build swaps in a stand-in (firestore.e2e.ts).
  const { openAccountBasket } = await import("@/lib/basket/firestore")
  return openAccountBasket(uid)
}

// For developers, in the console, never on screen: the visitor is told in
// their language (the `unreachable` state, the `refused` event).
function reportError(error: unknown) {
  console.error("My Pumpkin Basket could not reach the account:", error)
}
