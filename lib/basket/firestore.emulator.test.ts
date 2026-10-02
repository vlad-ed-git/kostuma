// @vitest-environment node
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing"
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Firestore,
} from "firebase/firestore"
import { readFileSync } from "node:fs"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { MemoryStorage } from "@/test/memory-storage"

import {
  ACCOUNT_KEY,
  GUEST_KEY,
  readAccount,
  writeAccount,
  writeGuest,
} from "./codec"
import { firestoreBasket } from "./firestore"
import type { RemoteState } from "./remote"
import { createBasketStore, type BasketStore } from "./store"

// The real rules and the real SDK, against the Firestore emulator
// (`npm run test:firestore`).

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-kostuma",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8085,
    },
  })
})

afterAll(() => env?.cleanup())

beforeEach(() => env.clearFirestore())

/** A browser signed in as `uid` (or not signed in): its own Firestore. */
const browser = (uid?: string) =>
  (uid
    ? env.authenticatedContext(uid)
    : env.unauthenticatedContext()
  ).firestore() as unknown as Firestore

const basketOf = (db: Firestore, uid: string) => doc(db, "baskets", uid)

const fresh = (slugs: string[]) => ({ slugs, updatedAt: serverTimestamp() })

/** Puts a basket in place as the server would, past the rules. */
async function seed(uid: string, slugs: string[]) {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      basketOf(context.firestore() as unknown as Firestore, uid),
      fresh(slugs)
    )
  })
}

/** What the server holds, past the rules. */
async function stored(uid: string) {
  let slugs: unknown
  await env.withSecurityRulesDisabled(async (context) => {
    const snapshot = await getDoc(
      basketOf(context.firestore() as unknown as Firestore, uid)
    )
    slugs = snapshot.get("slugs")
  })
  return slugs
}

describe("firestore.rules: baskets", () => {
  describe("reading", () => {
    it("lets an account read its own basket", async () => {
      await seed("alice", ["ghostface"])
      await assertSucceeds(getDoc(basketOf(browser("alice"), "alice")))
    })

    it("keeps it from every other account and from visitors", async () => {
      await seed("alice", ["ghostface"])
      await assertFails(getDoc(basketOf(browser("bob"), "alice")))
      await assertFails(getDoc(basketOf(browser(), "alice")))
    })

    it("never lists the baskets", async () => {
      await seed("alice", ["ghostface"])
      await assertFails(getDocs(collection(browser("alice"), "baskets")))
    })
  })

  describe("creating", () => {
    it("starts a basket with one costume, or none", async () => {
      await assertSucceeds(
        setDoc(basketOf(browser("alice"), "alice"), fresh(["ghostface"]))
      )
      await assertSucceeds(setDoc(basketOf(browser("bob"), "bob"), fresh([])))
    })

    it("never in another account's name, nor without one", async () => {
      await assertFails(
        setDoc(basketOf(browser("bob"), "alice"), fresh(["ghostface"]))
      )
      await assertFails(
        setDoc(basketOf(browser(), "alice"), fresh(["ghostface"]))
      )
    })

    it("refuses two costumes at once", async () => {
      await assertFails(
        setDoc(
          basketOf(browser("alice"), "alice"),
          fresh(["ghostface", "michael-myers"])
        )
      )
    })

    it("refuses anything that is not a costume's slug", async () => {
      for (const slug of [
        "Ghostface",
        "ghost face",
        "-ghostface",
        "ghostface-",
        "a".repeat(65),
        "",
        42,
        { slug: "ghostface" },
      ]) {
        await assertFails(
          setDoc(basketOf(browser("alice"), "alice"), fresh([slug as string]))
        )
      }
    })

    it("refuses other fields, a missing field, and the browser's clock", async () => {
      const alice = basketOf(browser("alice"), "alice")
      await assertFails(setDoc(alice, { ...fresh(["ghostface"]), note: "hi" }))
      await assertFails(setDoc(alice, { slugs: ["ghostface"] }))
      await assertFails(
        setDoc(alice, { slugs: "ghostface", updatedAt: serverTimestamp() })
      )
      await assertFails(
        setDoc(alice, { slugs: ["ghostface"], updatedAt: Timestamp.now() })
      )
    })
  })

  describe("changing", () => {
    beforeEach(() => seed("alice", ["ghostface", "michael-myers"]))

    const alice = () => basketOf(browser("alice"), "alice")
    const change = (data: object) =>
      setDoc(
        alice(),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      )

    it("adds one costume at the end", async () => {
      await assertSucceeds(change({ slugs: arrayUnion("pearl") }))
      expect(await stored("alice")).toEqual([
        "ghostface",
        "michael-myers",
        "pearl",
      ])
    })

    it("lets adding what is already there change nothing", async () => {
      await assertSucceeds(change({ slugs: arrayUnion("ghostface") }))
      expect(await stored("alice")).toEqual(["ghostface", "michael-myers"])
    })

    it("removes a costume, and clears them all", async () => {
      await assertSucceeds(change({ slugs: arrayRemove("ghostface") }))
      expect(await stored("alice")).toEqual(["michael-myers"])
      await assertSucceeds(change({ slugs: [] }))
      expect(await stored("alice")).toEqual([])
    })

    it("refuses two costumes in one write", async () => {
      await assertFails(change({ slugs: arrayUnion("pearl", "carrie-white") }))
    })

    it("refuses a costume slipped in anywhere but the end", async () => {
      await assertFails(
        change({ slugs: ["pearl", "ghostface", "michael-myers"] })
      )
    })

    it("refuses swapping one costume for another", async () => {
      await assertFails(change({ slugs: ["ghostface", "pearl"] }))
    })

    it("refuses a malformed costume, even alone at the end", async () => {
      await assertFails(change({ slugs: arrayUnion("Pearl") }))
    })

    it("never lets another account change it", async () => {
      await assertFails(
        setDoc(
          basketOf(browser("bob"), "alice"),
          { slugs: arrayRemove("ghostface"), updatedAt: serverTimestamp() },
          { merge: true }
        )
      )
    })

    it("never deletes it", async () => {
      await assertFails(deleteDoc(alice()))
    })

    it("stops at 200 costumes", async () => {
      const full = Array.from({ length: 200 }, (_, i) => `costume-${i}`)
      await seed("alice", full)
      await assertFails(change({ slugs: arrayUnion("one-more") }))
      await assertSucceeds(change({ slugs: arrayRemove("costume-0") }))
    })
  })

  it("keeps every other collection closed", async () => {
    const alice = browser("alice")
    await assertFails(getDoc(doc(alice, "users", "alice")))
    await assertFails(setDoc(doc(alice, "users", "alice"), { credits: 99 }))
    await assertFails(setDoc(doc(alice, "feedback", "x"), { message: "hi" }))
    await assertFails(
      setDoc(doc(alice, "baskets", "alice", "items", "x"), { a: 1 })
    )
  })
})

/** The next state a watcher hears that passes `check`. */
function hear(
  watch: (next: (state: RemoteState) => void) => () => void,
  check: (state: RemoteState) => boolean
) {
  return new Promise<RemoteState>((resolve) => {
    const stop = watch((state) => {
      if (!check(state)) return
      queueMicrotask(() => stop())
      resolve(state)
    })
  })
}

describe("firestoreBasket: live, across devices", () => {
  it("hears a change made on another device", async () => {
    const phone = firestoreBasket(browser("alice"), "alice")
    const laptop = firestoreBasket(browser("alice"), "alice")
    const heard = hear(
      (next) => phone.watch(next, (error) => expect.fail(String(error))),
      (state) => state.confirmed && (state.slugs as string[]).length === 1
    )
    await laptop.apply({ type: "add", slugs: ["ghostface"] })
    expect((await heard).slugs).toEqual(["ghostface"])

    const removed = hear(
      (next) => phone.watch(next, () => {}),
      (state) => state.confirmed && (state.slugs as string[]).length === 0
    )
    await laptop.apply({ type: "remove", slug: "ghostface" })
    expect((await removed).slugs).toEqual([])
  })

  it("adds a whole guest basket, in its order, within the rules", async () => {
    const basket = firestoreBasket(browser("alice"), "alice")
    await basket.apply({
      type: "add",
      slugs: ["pearl", "ghostface", "carrie-white"],
    })
    expect(await stored("alice")).toEqual([
      "pearl",
      "ghostface",
      "carrie-white",
    ])
  })

  it("keeps both of two changes made at the same time on two devices", async () => {
    const phone = firestoreBasket(browser("alice"), "alice")
    const laptop = firestoreBasket(browser("alice"), "alice")
    await phone.apply({ type: "add", slugs: ["ghostface"] })
    await Promise.all([
      phone.apply({ type: "add", slugs: ["pearl"] }),
      laptop.apply({ type: "remove", slug: "ghostface" }),
      laptop.apply({ type: "add", slugs: ["carrie-white"] }),
    ])
    expect(new Set((await stored("alice")) as string[])).toEqual(
      new Set(["pearl", "carrie-white"])
    )
  })

  it("is refused another account's basket", async () => {
    await seed("alice", ["ghostface"])
    const intruder = firestoreBasket(browser("bob"), "alice")
    const error = await new Promise((resolve) =>
      intruder.watch(() => {}, resolve)
    )
    expect(error).toMatchObject({ code: "permission-denied" })
    await expect(intruder.apply({ type: "clear" })).rejects.toMatchObject({
      code: "permission-denied",
    })
    expect(await stored("alice")).toEqual(["ghostface"])
  })
})

describe("the basket store, signed in, on Firestore", () => {
  const known = ["ghostface", "michael-myers", "pearl", "carrie-white"]

  /** A tab of a browser, signed in to Firebase as `uid`. */
  function tab(storage: Storage, uid: string) {
    return createBasketStore({
      known,
      storage: () => storage,
      events: new EventTarget(),
      openRemote: async (account) => firestoreBasket(browser(uid), account),
      report: () => {},
    })
  }

  const shows = (store: BasketStore, slugs: string[]) =>
    expect
      .poll(() => store.getSnapshot().slugs, { timeout: 10_000 })
      .toEqual(slugs)

  it("brings the guest basket into the account once, then empties it", async () => {
    await seed("alice", ["michael-myers"])
    const device = new MemoryStorage()
    device.setItem(GUEST_KEY, writeGuest(["pearl", "michael-myers"]))
    const store = tab(device, "alice")
    const disconnect = store.connect("alice")

    await shows(store, ["michael-myers", "pearl"])
    await expect.poll(() => device.getItem(GUEST_KEY)).toBeNull()
    expect(await stored("alice")).toEqual(["michael-myers", "pearl"])
    // The device keeps a copy of the account's basket to show next time.
    await expect
      .poll(() => readAccount(device.getItem(ACCOUNT_KEY), new Set(known)))
      .toEqual({ uid: "alice", slugs: ["michael-myers", "pearl"] })
    disconnect()
  })

  it("follows another device live: adding and removing", async () => {
    const phone = tab(new MemoryStorage(), "alice")
    const laptop = tab(new MemoryStorage(), "alice")
    const off = [phone.connect("alice"), laptop.connect("alice")]

    laptop.add("ghostface")
    await shows(phone, ["ghostface"])
    phone.add("pearl")
    await shows(laptop, ["ghostface", "pearl"])
    laptop.remove("ghostface")
    await shows(phone, ["pearl"])
    phone.clear()
    await shows(laptop, [])
    off.forEach((disconnect) => disconnect())
  })

  it("never brings back a costume removed elsewhere from its own copy", async () => {
    // This device last saw ghostface; another device removed it since.
    await seed("alice", ["pearl"])
    const device = new MemoryStorage()
    device.setItem(ACCOUNT_KEY, writeAccount("alice", ["ghostface", "pearl"]))
    const store = tab(device, "alice")
    const disconnect = store.connect("alice")

    // The copy shows at once, then the account corrects it.
    expect(store.getSnapshot().slugs).toEqual(["ghostface", "pearl"])
    await shows(store, ["pearl"])
    expect(await stored("alice")).toEqual(["pearl"])
    disconnect()
  })

  it("signing out leaves the basket in the account and the device empty", async () => {
    const device = new MemoryStorage()
    const store = tab(device, "alice")
    const signedIn = store.connect("alice")
    store.add("ghostface")
    await expect.poll(() => stored("alice")).toEqual(["ghostface"])
    signedIn()

    const signedOut = store.connect(null)
    expect(store.getSnapshot().slugs).toEqual([])
    expect(device.getItem(ACCOUNT_KEY)).toBeNull()
    expect(await stored("alice")).toEqual(["ghostface"])
    signedOut()
  })

  it("never shows one account's basket to another", async () => {
    await seed("bob", ["carrie-white"])
    const device = new MemoryStorage()
    device.setItem(ACCOUNT_KEY, writeAccount("alice", ["ghostface"]))
    const store = tab(device, "bob")
    const disconnect = store.connect("bob")

    expect(store.getSnapshot().slugs).toEqual([])
    await shows(store, ["carrie-white"])
    expect(await stored("bob")).toEqual(["carrie-white"])
    disconnect()
  })
})
