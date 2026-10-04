// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MemoryStorage } from "@/test/memory-storage"

import {
  ACCOUNT_KEY,
  GUEST_KEY,
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
import { createBasketStore, type BasketEvent } from "./store"

const known = ["ghostface", "michael-myers", "pearl", "carrie-white"]

/** Another tab of the same browser changing the storage. */
function otherTab(events: EventTarget, key: string | null) {
  events.dispatchEvent(new StorageEvent("storage", { key }))
}

function setup({
  storage = new MemoryStorage() as Storage,
  account,
}: {
  storage?: Storage | (() => Storage | null)
  account?: FakeAccount
} = {}) {
  const events = new EventTarget()
  const report = vi.fn()
  const store = createBasketStore({
    known,
    storage: typeof storage === "function" ? storage : () => storage,
    events,
    report,
    openRemote: account
      ? (uid) => account.open(uid)
      : () => Promise.reject(new Error("no account in this test")),
    retryDelays: [1_000, 5_000],
    readyAfter: 3_000,
  })
  const heard: BasketEvent[] = []
  store.onEvent((event) => heard.push(event))
  return { store, events, report, heard, storage }
}

const slugs = (store: { getSnapshot(): { slugs: readonly string[] } }) =>
  store.getSnapshot().slugs

describe("before it is read", () => {
  it("is empty and not ready, like the server's", () => {
    const { store } = setup()
    expect(store.getSnapshot()).toEqual({
      ready: false,
      slugs: [],
      unreachable: false,
    })
    expect(store.getServerSnapshot()).toBe(store.getSnapshot())
  })

  it("does nothing until it knows whose basket it is", () => {
    const { store, storage } = setup()
    store.add("pearl")
    expect(slugs(store)).toEqual([])
    expect((storage as Storage).length).toBe(0)
  })
})

describe("a guest's basket", () => {
  it("is empty on a device that never kept one", () => {
    const { store } = setup()
    store.connect(null)
    expect(store.getSnapshot()).toEqual({
      ready: true,
      slugs: [],
      unreachable: false,
    })
  })

  it("reads what this device kept, dropping costumes that are gone", () => {
    const storage = new MemoryStorage()
    storage.setItem(
      GUEST_KEY,
      JSON.stringify({ v: 1, slugs: ["pearl", "the-wolf-man", "ghostface"] })
    )
    const { store } = setup({ storage })
    store.connect(null)
    expect(slugs(store)).toEqual(["pearl", "ghostface"])
  })

  it.each([
    ["corrupted", "{not json"],
    ["outdated", JSON.stringify({ v: 0, items: ["pearl"] })],
    ["oversized", "x".repeat(100_000)],
  ])("survives %s data: an empty basket that works", (_, raw) => {
    const storage = new MemoryStorage()
    storage.setItem(GUEST_KEY, raw)
    const { store } = setup({ storage })
    store.connect(null)
    expect(slugs(store)).toEqual([])
    store.add("pearl")
    expect(readGuest(storage.getItem(GUEST_KEY), new Set(known))).toEqual([
      "pearl",
    ])
  })

  it("keeps each change on the device", () => {
    const { store, storage } = setup()
    store.connect(null)
    store.add("pearl")
    store.add("ghostface")
    expect(JSON.parse((storage as Storage).getItem(GUEST_KEY)!)).toEqual({
      v: 1,
      slugs: ["pearl", "ghostface"],
    })
    store.remove("pearl")
    expect(slugs(store)).toEqual(["ghostface"])
    store.clear()
    expect(slugs(store)).toEqual([])
    expect((storage as Storage).getItem(GUEST_KEY)).toBeNull()
  })

  it("tells of the visitor's changes, and only of real ones", () => {
    const { store, heard } = setup()
    store.connect(null)
    store.add("pearl")
    store.add("pearl")
    store.add("the-wolf-man")
    store.remove("ghostface")
    store.remove("pearl")
    store.clear()
    store.add("ghostface")
    store.clear()
    expect(heard).toEqual([
      { type: "add", slug: "pearl" },
      { type: "remove", slug: "pearl" },
      { type: "add", slug: "ghostface" },
      { type: "clear" },
    ])
  })

  it("keeps the same snapshot while nothing changes", () => {
    const { store } = setup()
    store.connect(null)
    const before = store.getSnapshot()
    store.remove("pearl")
    expect(store.getSnapshot()).toBe(before)
  })

  it("follows other tabs, without writing back or telling of it", () => {
    const { store, events, storage, heard } = setup()
    const listener = vi.fn()
    store.subscribe(listener)
    store.connect(null)
    const setItem = vi.spyOn(storage as Storage, "setItem")

    ;(storage as Storage).setItem(GUEST_KEY, writeGuest(["pearl"]))
    setItem.mockClear()
    otherTab(events, GUEST_KEY)
    expect(slugs(store)).toEqual(["pearl"])
    expect(listener).toHaveBeenCalled()

    // localStorage.clear() in another tab: the key is null.
    ;(storage as Storage).clear()
    otherTab(events, null)
    expect(slugs(store)).toEqual([])
    expect(setItem).not.toHaveBeenCalled()
    expect(heard).toEqual([])
  })

  it("ignores other keys in the storage", () => {
    const { store, events, storage } = setup()
    store.connect(null)
    ;(storage as Storage).setItem(GUEST_KEY, writeGuest(["pearl"]))
    otherTab(events, "something-else")
    expect(slugs(store)).toEqual([])
  })

  it("adds to what another tab stored a moment ago, not over it", () => {
    const { store, storage } = setup()
    store.connect(null)
    // Another tab wrote; its storage event hasn't arrived yet.
    ;(storage as Storage).setItem(GUEST_KEY, writeGuest(["pearl"]))
    store.add("ghostface")
    expect(slugs(store)).toEqual(["pearl", "ghostface"])
  })

  it("stops following other tabs once let go", () => {
    const { store, events, storage } = setup()
    const disconnect = store.connect(null)
    disconnect()
    ;(storage as Storage).setItem(GUEST_KEY, writeGuest(["pearl"]))
    otherTab(events, GUEST_KEY)
    expect(slugs(store)).toEqual([])
  })

  it("works in memory where storage throws (blocked, private mode)", () => {
    const { store } = setup({
      storage: () => {
        throw new DOMException("The operation is insecure.", "SecurityError")
      },
    })
    store.connect(null)
    store.add("pearl")
    store.add("ghostface")
    store.remove("pearl")
    expect(store.getSnapshot()).toMatchObject({
      ready: true,
      slugs: ["ghostface"],
    })
  })

  it("works in memory where storage is missing", () => {
    const { store } = setup({ storage: () => null })
    store.connect(null)
    store.add("pearl")
    expect(slugs(store)).toEqual(["pearl"])
  })

  it("keeps every costume when storage refuses to save (full)", () => {
    const storage = new MemoryStorage()
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError")
    })
    const { store } = setup({ storage })
    store.connect(null)
    store.add("pearl")
    store.add("ghostface")
    expect(slugs(store)).toEqual(["pearl", "ghostface"])
  })

  it("forgets an account's copy: a guest never sees it", () => {
    const storage = new MemoryStorage()
    storage.setItem(ACCOUNT_KEY, writeAccount("alice", ["pearl"]))
    const { store } = setup({ storage })
    store.connect(null)
    expect(slugs(store)).toEqual([])
    expect(storage.getItem(ACCOUNT_KEY)).toBeNull()
  })
})

/** An account's basket that a test controls, like Firestore would answer. */
class FakeAccount {
  slugs: string[]
  applied: Change[] = []
  opened: string[] = []
  refuse = false
  /** While set, the account doesn't answer changes. */
  hold = false
  failToOpen = 0
  #watchers = new Set<{
    next: (state: RemoteState) => void
    fail: (error: unknown) => void
  }>()

  constructor(slugs: string[] = []) {
    this.slugs = slugs
  }

  get watching() {
    return this.#watchers.size
  }

  /** The account changed elsewhere (another device). */
  set(slugs: unknown[]) {
    this.slugs = slugs as string[]
    this.#tell(true)
  }

  failWatch(error: unknown) {
    for (const watcher of [...this.#watchers]) watcher.fail(error)
  }

  #tell(confirmed: boolean) {
    for (const { next } of this.#watchers) {
      next({ slugs: [...this.slugs], confirmed })
    }
  }

  async open(uid: string): Promise<RemoteBasket> {
    this.opened.push(uid)
    if (this.failToOpen > 0) {
      this.failToOpen--
      throw new Error("offline")
    }
    return {
      watch: (next, fail) => {
        const watcher = { next, fail }
        this.#watchers.add(watcher)
        queueMicrotask(() => next({ slugs: [...this.slugs], confirmed: true }))
        return () => this.#watchers.delete(watcher)
      },
      apply: async (change) => {
        this.applied.push(change)
        if (this.refuse) throw new Error("permission-denied")
        // Shown at once, confirmed when the server answers.
        this.slugs = [...applyChange(this.slugs, change)]
        this.#tell(false)
        await Promise.resolve()
        while (this.hold)
          await new Promise((resolve) => setTimeout(resolve, 10))
        this.#tell(true)
      },
    }
  }
}

describe("a signed-in visitor's basket", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  const settle = () => vi.advanceTimersByTimeAsync(0)

  it("shows the account's basket, and keeps a copy on the device", async () => {
    const account = new FakeAccount(["pearl"])
    const { store, storage } = setup({ account })
    store.connect("alice")
    expect(store.getSnapshot().ready).toBe(false)
    await settle()
    expect(store.getSnapshot()).toEqual({
      ready: true,
      slugs: ["pearl"],
      unreachable: false,
    })
    expect(account.opened).toEqual(["alice"])
    expect((storage as Storage).getItem(ACCOUNT_KEY)).toBe(
      writeAccount("alice", ["pearl"])
    )
  })

  it("shows the device's copy at once, then what the account says", async () => {
    const storage = new MemoryStorage()
    storage.setItem(ACCOUNT_KEY, writeAccount("alice", ["ghostface", "pearl"]))
    const account = new FakeAccount(["pearl"])
    const { store } = setup({ storage, account })
    store.connect("alice")
    expect(store.getSnapshot()).toMatchObject({
      ready: true,
      slugs: ["ghostface", "pearl"],
    })
    await settle()
    // Removed on another device: the copy never brings it back.
    expect(slugs(store)).toEqual(["pearl"])
    expect(account.applied).toEqual([])
  })

  it("never shows, nor keeps, another account's copy", async () => {
    const storage = new MemoryStorage()
    storage.setItem(ACCOUNT_KEY, writeAccount("bob", ["ghostface"]))
    const account = new FakeAccount(["pearl"])
    const { store } = setup({ storage, account })
    store.connect("alice")
    expect(store.getSnapshot()).toMatchObject({ ready: false, slugs: [] })
    expect(storage.getItem(ACCOUNT_KEY)).toBeNull()
    await settle()
    expect(slugs(store)).toEqual(["pearl"])
  })

  it("brings the guest basket into the account, once", async () => {
    const storage = new MemoryStorage()
    storage.setItem(GUEST_KEY, writeGuest(["ghostface", "pearl"]))
    const account = new FakeAccount(["pearl", "carrie-white"])
    const { store, heard } = setup({ storage, account })
    store.connect("alice")
    // Shown at once.
    expect(slugs(store)).toEqual(["ghostface", "pearl"])
    await settle()
    expect(account.applied).toEqual([
      { type: "add", slugs: ["ghostface", "pearl"] },
    ])
    expect(slugs(store)).toEqual(["pearl", "carrie-white", "ghostface"])
    // The account has them: the guest basket is empty, so it never joins
    // again, nor another account.
    expect(storage.getItem(GUEST_KEY)).toBeNull()
    expect(heard).toEqual([])
  })

  it("keeps the guest basket when the account refuses it, and says so", async () => {
    const storage = new MemoryStorage()
    storage.setItem(GUEST_KEY, writeGuest(["ghostface"]))
    const account = new FakeAccount()
    account.refuse = true
    const { store, heard, report } = setup({ storage, account })
    store.connect("alice")
    await settle()
    expect(storage.getItem(GUEST_KEY)).toBe(writeGuest(["ghostface"]))
    expect(heard).toEqual([{ type: "refused" }])
    expect(report).toHaveBeenCalled()
    expect(slugs(store)).toEqual([])
  })

  it("shows a change at once, and sends it to the account", async () => {
    const account = new FakeAccount()
    const { store, heard, storage } = setup({ account })
    store.connect("alice")
    await settle()
    account.hold = true
    store.add("pearl")
    expect(slugs(store)).toEqual(["pearl"])
    expect(heard).toEqual([{ type: "add", slug: "pearl" }])
    expect(account.applied).toEqual([{ type: "add", slugs: ["pearl"] }])
    // Not confirmed yet: the device's copy waits.
    expect((storage as Storage).getItem(ACCOUNT_KEY)).toBe(
      writeAccount("alice", [])
    )
    account.hold = false
    await vi.advanceTimersByTimeAsync(20)
    expect((storage as Storage).getItem(ACCOUNT_KEY)).toBe(
      writeAccount("alice", ["pearl"])
    )
    // Never into the guest basket.
    expect((storage as Storage).getItem(GUEST_KEY)).toBeNull()
  })

  it("undoes a change the account refuses, and says so", async () => {
    const account = new FakeAccount(["pearl"])
    const { store, heard } = setup({ account })
    store.connect("alice")
    await settle()
    account.refuse = true
    store.remove("pearl")
    expect(slugs(store)).toEqual([])
    await settle()
    expect(slugs(store)).toEqual(["pearl"])
    expect(heard).toEqual([
      { type: "remove", slug: "pearl" },
      { type: "refused" },
    ])
  })

  it("follows other devices live", async () => {
    const account = new FakeAccount()
    const { store } = setup({ account })
    store.connect("alice")
    await settle()
    account.set(["carrie-white", "pearl"])
    expect(slugs(store)).toEqual(["carrie-white", "pearl"])
    account.set([])
    expect(slugs(store)).toEqual([])
  })

  it("drops what the account holds that is not a costume", async () => {
    const account = new FakeAccount()
    const { store } = setup({ account })
    store.connect("alice")
    await settle()
    account.set(["pearl", "the-wolf-man", 3, "pearl", "Pearl"])
    expect(slugs(store)).toEqual(["pearl"])
  })

  it("keeps a change shown while another device's news arrives", async () => {
    const account = new FakeAccount()
    const { store } = setup({ account })
    store.connect("alice")
    await settle()
    account.hold = true
    account.refuse = false
    store.add("pearl")
    // News from before the change reached the server.
    account.set(["carrie-white"])
    expect(slugs(store)).toEqual(["carrie-white", "pearl"])
  })

  it("sends changes made before the account answered, in order", async () => {
    const account = new FakeAccount()
    account.failToOpen = 1
    const { store } = setup({ account })
    store.connect("alice")
    store.add("pearl")
    store.add("ghostface")
    store.remove("pearl")
    await settle()
    expect(account.applied).toEqual([])
    expect(slugs(store)).toEqual(["ghostface"])
    await vi.advanceTimersByTimeAsync(1_000)
    expect(account.applied).toEqual([
      { type: "add", slugs: ["pearl"] },
      { type: "add", slugs: ["ghostface"] },
      { type: "remove", slug: "pearl" },
    ])
    expect(account.slugs).toEqual(["ghostface"])
  })

  it("says when the account can't be reached, and asks again", async () => {
    const account = new FakeAccount(["pearl"])
    account.failToOpen = 1
    const { store, report } = setup({ account })
    store.connect("alice")
    await settle()
    expect(store.getSnapshot()).toEqual({
      ready: true,
      slugs: [],
      unreachable: true,
    })
    expect(report).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(store.getSnapshot()).toEqual({
      ready: true,
      slugs: ["pearl"],
      unreachable: false,
    })
  })

  it("asks again when the account stops answering, then gives up", async () => {
    const account = new FakeAccount(["pearl"])
    const { store, report } = setup({ account })
    store.connect("alice")
    await settle()
    account.failToOpen = 5
    account.failWatch(new Error("permission-denied"))
    expect(store.getSnapshot()).toMatchObject({
      slugs: ["pearl"],
      unreachable: true,
    })
    expect(account.watching).toBe(0)
    await vi.advanceTimersByTimeAsync(60_000)
    // Two more tries (the test's delays), then no more.
    expect(account.opened).toEqual(["alice", "alice", "alice"])
    expect(report).toHaveBeenCalledTimes(3)
  })

  it("shows what there is when the account is slow to answer", async () => {
    const account = new FakeAccount()
    let open!: () => void
    const { store } = setup({
      account: Object.assign(account, {
        open: () =>
          new Promise<RemoteBasket>((resolve) => {
            open = () =>
              resolve(
                FakeAccount.prototype.open.call(account, "alice") as never
              )
          }),
      }),
    })
    store.connect("alice")
    await vi.advanceTimersByTimeAsync(2_999)
    expect(store.getSnapshot().ready).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(store.getSnapshot()).toMatchObject({ ready: true, slugs: [] })
    open()
  })

  it("signing out: the account keeps its basket, the device forgets it", async () => {
    const account = new FakeAccount(["pearl"])
    const { store, storage } = setup({ account })
    const signedIn = store.connect("alice")
    await settle()
    signedIn()
    expect(account.watching).toBe(0)

    store.connect(null)
    expect(slugs(store)).toEqual([])
    expect((storage as Storage).getItem(ACCOUNT_KEY)).toBeNull()
    expect(account.slugs).toEqual(["pearl"])
    store.add("ghostface")
    expect(account.applied).toEqual([])
  })

  it("another account in the same tab starts from its own basket", async () => {
    const account = new FakeAccount(["pearl"])
    const { store } = setup({ account })
    const alice = store.connect("alice")
    await settle()
    alice()
    account.slugs = ["carrie-white"]
    store.connect("bob")
    expect(slugs(store)).toEqual([])
    await settle()
    expect(slugs(store)).toEqual(["carrie-white"])
  })

  it("never merges what other tabs do to the guest basket", async () => {
    const account = new FakeAccount()
    const { store, events, storage } = setup({ account })
    store.connect("alice")
    await settle()
    ;(storage as Storage).setItem(GUEST_KEY, writeGuest(["pearl"]))
    otherTab(events, GUEST_KEY)
    await settle()
    expect(account.applied).toEqual([])
    expect(slugs(store)).toEqual([])
  })

  it("takes another tab's copy of this account while it can't reach it", async () => {
    const account = new FakeAccount()
    account.failToOpen = 1
    const { store, events, storage } = setup({ account })
    store.connect("alice")
    await settle()
    ;(storage as Storage).setItem(ACCOUNT_KEY, writeAccount("alice", ["pearl"]))
    otherTab(events, ACCOUNT_KEY)
    expect(slugs(store)).toEqual(["pearl"])
    ;(storage as Storage).setItem(
      ACCOUNT_KEY,
      writeAccount("bob", ["ghostface"])
    )
    otherTab(events, ACCOUNT_KEY)
    expect(slugs(store)).toEqual(["pearl"])
  })

  it("stops listening to the account once let go", async () => {
    const account = new FakeAccount()
    const { store } = setup({ account })
    const disconnect = store.connect("alice")
    await settle()
    disconnect()
    account.set(["pearl"])
    expect(slugs(store)).toEqual([])
  })
})
