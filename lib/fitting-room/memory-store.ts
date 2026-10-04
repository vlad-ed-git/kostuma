import {
  admits,
  afterBalance,
  type Controls,
  dayOf,
  DEFAULT_CONTROLS,
  unitsOfPlan,
  unspentUnits,
} from "./budget"
import { allowanceOf, countsAsFailedTry } from "./free-costume"
import type {
  FacePhoto,
  FittingRoomStore,
  Photo,
  PhotoKind,
  StoredStep,
  TryOn,
} from "./try-on"

/**
 * The Fitting Room kept in memory: the unit tests, and the e2e build
 * (store.e2e.ts). Reads and writes copies, as a database would; each call
 * runs alone, as a transaction would. `controls`: the switch and budget it
 * starts with (budget.ts).
 */

type Account = {
  face: FacePhoto | null
  body: Photo | null
  failedTries: number
  photos: Map<string, Uint8Array>
  tryOns: Map<string, TryOn>
  images: Map<string, Uint8Array>
}

export function memoryStore({
  controls: initial = {},
}: { controls?: Partial<Controls> } = {}): FittingRoomStore {
  const accounts = new Map<string, Account>()
  let controls: Controls = { ...DEFAULT_CONTROLS, ...initial }
  // Units reserved per day.
  const usage = new Map<string, number>()

  function account(uid: string): Account {
    let found = accounts.get(uid)
    if (!found) {
      found = {
        face: null,
        body: null,
        failedTries: 0,
        photos: new Map(),
        tryOns: new Map(),
        images: new Map(),
      }
      accounts.set(uid, found)
    }
    return found
  }

  const copy = <T>(value: T): T => structuredClone(value)
  const photoKey = (kind: PhotoKind, id: string) => `${kind}/${id}`

  return {
    async room(uid) {
      const { face, body, failedTries } = account(uid)
      return { face: face && copy(face), body: body && copy(body), failedTries }
    },

    async savePhotos(uid, { face, body }) {
      const found = account(uid)
      if (face) {
        found.photos.set(photoKey("face", face[0].id), face[1])
        found.face = copy(face[0])
      }
      if (body) {
        found.photos.set(photoKey("body", body[0].id), body[1])
        found.body = copy(body[0])
      }
    },

    async photo(uid, kind, id) {
      return account(uid).photos.get(photoKey(kind, id)) ?? null
    },

    async tryOn(uid, id) {
      const found = account(uid).tryOns.get(id)
      return found ? copy(found) : null
    },

    async tryOns(uid) {
      return [...account(uid).tryOns.values()]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(copy)
    },

    async begin(uid, fresh) {
      const found = account(uid)
      const existing = found.tryOns.get(fresh.id)
      if (existing && existing.status !== "failed")
        return { outcome: "existing", tryOn: copy(existing) }
      const allowance = allowanceOf(
        [...found.tryOns.values()],
        found.failedTries,
        fresh.renderer
      )
      if (!allowance.free) return { outcome: "out_of_units" }
      const day = dayOf(fresh.createdAt)
      const units = unitsOfPlan(fresh.steps.map((step) => step.render))
      if (!admits(controls, usage.get(day) ?? 0, units))
        return { outcome: "closed" }
      usage.set(day, (usage.get(day) ?? 0) + units)
      const started: TryOn = { ...copy(fresh), reserved: { day, units } }
      found.tryOns.set(fresh.id, started)
      return { outcome: "started", tryOn: copy(started) }
    },

    async updateStep(uid, id, index, when, change) {
      const tryOn = account(uid).tryOns.get(id)
      const step: StoredStep | undefined = tryOn?.steps[index]
      if (!tryOn || !step || !when(copy(step))) return false
      tryOn.steps[index] = { ...step, ...copy(change) }
      tryOn.updatedAt = Date.now()
      return true
    },

    async finish(uid, id, status, failure) {
      const found = account(uid)
      const tryOn = found.tryOns.get(id)
      if (!tryOn || tryOn.status !== "running") return false
      tryOn.status = status
      tryOn.failure = failure
      tryOn.updatedAt = Date.now()
      if (status === "failed" && countsAsFailedTry(tryOn, failure))
        found.failedTries += 1
      const unspent = unspentUnits(tryOn)
      if (unspent > 0 && tryOn.reserved) {
        const { day } = tryOn.reserved
        usage.set(day, Math.max(0, (usage.get(day) ?? 0) - unspent))
      }
      return true
    },

    async saveStepImage(uid, id, index, image) {
      account(uid).images.set(`${id}/${index}`, image)
    },

    async stepImage(uid, id, index) {
      return account(uid).images.get(`${id}/${index}`) ?? null
    },

    async capacity(now = Date.now()) {
      return { controls: { ...controls }, reserved: usage.get(dayOf(now)) ?? 0 }
    },

    async close(reason) {
      // Closed already (by the owner, or before): left as it is.
      if (controls.open)
        controls = { ...controls, open: false, closedFor: reason }
    },

    async recordBalance(balance, now) {
      controls = {
        ...controls,
        ...afterBalance(controls, balance),
        balance,
        balanceAt: now,
      }
      return { ...controls }
    },
  }
}
