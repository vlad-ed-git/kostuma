import {
  admits,
  afterBalance,
  type Controls,
  dayOf,
  DEFAULT_CONTROLS,
  unitsOfPlan,
  unspentUnits,
} from "./budget"
import { type Bucket, take } from "./calls"
import {
  type AllowanceRecord,
  allowanceFrom,
  ended,
  erased,
  holding,
  NO_RECORD,
} from "./free-costume"
import type {
  FacePhoto,
  FittingRoomStore,
  Photo,
  PhotoKind,
  StoredStep,
  TaskRef,
  TryOn,
  TryOnRef,
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
  /** The photos, and when each was kept. */
  photos: Map<string, { image: Uint8Array; at: number }>
  tryOns: Map<string, TryOn>
  images: Map<string, Uint8Array>
}

export function memoryStore({
  controls: initial = {},
}: { controls?: Partial<Controls> } = {}): FittingRoomStore {
  const accounts = new Map<string, Account>()
  // Apart from the photos and try-ons: deleting them never touches it.
  const allowances = new Map<string, AllowanceRecord>()
  let controls: Controls = { ...DEFAULT_CONTROLS, ...initial }
  // Units reserved per day.
  const usage = new Map<string, number>()
  let calls: Bucket | null = null
  const tasks = new Map<string, TaskRef & { at: number }>()
  const deliveries = new Map<string, number>()
  const running = new Map<string, TryOnRef & { startedAt: number }>()

  function account(uid: string): Account {
    let found = accounts.get(uid)
    if (!found) {
      found = {
        face: null,
        body: null,
        photos: new Map(),
        tryOns: new Map(),
        images: new Map(),
      }
      accounts.set(uid, found)
    }
    return found
  }

  const recordOf = (uid: string) => allowances.get(uid) ?? NO_RECORD
  const copy = <T>(value: T): T => structuredClone(value)
  const photoKey = (kind: PhotoKind, id: string) => `${kind}/${id}`

  /** Deletes a try-on with its pictures. */
  function drop(found: Account, id: string) {
    const tryOn = found.tryOns.get(id)
    found.tryOns.delete(id)
    tryOn?.steps.forEach((_, index) => found.images.delete(`${id}/${index}`))
  }

  return {
    async room(uid) {
      const { face, body } = account(uid)
      return { face: face && copy(face), body: body && copy(body) }
    },

    async savePhotos(uid, { face, body }) {
      const found = account(uid)
      const at = Date.now()
      if (face) {
        found.photos.set(photoKey("face", face[0].id), { image: face[1], at })
        found.face = copy(face[0])
      }
      if (body) {
        found.photos.set(photoKey("body", body[0].id), { image: body[1], at })
        found.body = copy(body[0])
      }
    },

    async photo(uid, kind, id) {
      return account(uid).photos.get(photoKey(kind, id))?.image ?? null
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

    async allowance(uid, renderer) {
      return allowanceFrom(recordOf(uid), renderer)
    },

    async begin(uid, fresh) {
      const found = account(uid)
      const existing = found.tryOns.get(fresh.id)
      if (existing && existing.status !== "failed")
        return { outcome: "existing", tryOn: copy(existing) }
      const record = recordOf(uid)
      if (!allowanceFrom(record, fresh.renderer).free)
        return { outcome: "out_of_units" }
      const day = dayOf(fresh.createdAt)
      const units = unitsOfPlan(fresh.steps.map((step) => step.render))
      if (!admits(controls, usage.get(day) ?? 0, units))
        return { outcome: "closed" }
      usage.set(day, (usage.get(day) ?? 0) + units)
      const started: TryOn = { ...copy(fresh), reserved: { day, units } }
      found.tryOns.set(fresh.id, started)
      allowances.set(uid, holding(record, fresh))
      running.set(`${uid}/${fresh.id}`, {
        uid,
        id: fresh.id,
        startedAt: fresh.createdAt,
      })
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
      running.delete(`${uid}/${id}`)
      if (!tryOn || tryOn.status !== "running") return false
      tryOn.status = status
      tryOn.failure = failure
      tryOn.updatedAt = Date.now()
      allowances.set(uid, ended(recordOf(uid), tryOn, status, failure))
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

    async erase(uid, { account: everything = false } = {}) {
      const found = accounts.get(uid)
      const tryOns = found ? [...found.tryOns.values()] : []
      if (everything) allowances.delete(uid)
      else if (allowances.has(uid))
        allowances.set(uid, erased(recordOf(uid), tryOns))
      for (const tryOn of tryOns) running.delete(`${uid}/${tryOn.id}`)
      accounts.delete(uid)
      return tryOns.flatMap((tryOn) =>
        tryOn.steps.flatMap((step) => (step.task ? [step.task] : []))
      )
    },

    async expire(before, limit) {
      let rooms = 0
      for (const found of accounts.values()) {
        if (rooms >= limit) break
        let touched = false
        for (const tryOn of [...found.tryOns.values()]) {
          if (tryOn.status === "running" || tryOn.createdAt >= before) continue
          drop(found, tryOn.id)
          touched = true
        }
        for (const [key, { at }] of [...found.photos]) {
          if (at >= before) continue
          found.photos.delete(key)
          touched = true
          if (found.face && key === photoKey("face", found.face.id))
            found.face = null
          if (found.body && key === photoKey("body", found.body.id))
            found.body = null
        }
        if (touched) rooms += 1
      }
      return rooms
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

    async takeCalls(count, now, debt = false) {
      const next = take(calls, count, now, debt)
      if (next) calls = next
      return next !== null
    },

    async trackTask(task, { uid, id, index }, now) {
      tasks.set(task, { uid, id, index, at: now })
    },

    async taskStep(task) {
      const found = tasks.get(task)
      return found ? { uid: found.uid, id: found.id, index: found.index } : null
    },

    async forgetTask(task) {
      tasks.delete(task)
    },

    async firstDelivery(id, now) {
      if (deliveries.has(id)) return false
      deliveries.set(id, now)
      return true
    },

    async runningSince(before, limit) {
      return [...running.values()]
        .filter((each) => each.startedAt < before)
        .sort((a, b) => a.startedAt - b.startedAt)
        .slice(0, limit)
        .map(({ uid, id }) => ({ uid, id }))
    },

    async sweep(before) {
      for (const [task, { at }] of tasks) if (at < before) tasks.delete(task)
      for (const [id, at] of deliveries) if (at < before) deliveries.delete(id)
    },
  }
}
