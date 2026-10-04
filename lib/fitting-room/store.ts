import "server-only"

import { createHash } from "node:crypto"

import { type DocumentReference, FieldValue } from "firebase-admin/firestore"

import { adminBucket, adminDb } from "@/lib/firebase/admin"

import {
  admits,
  afterBalance,
  controlsOf,
  dayOf,
  DEFAULT_CONTROLS,
  unitsOfPlan,
  unspentUnits,
} from "./budget"
import { bucketOf, take } from "./calls"
import { allowanceOf, countsAsFailedTry } from "./free-costume"
import type {
  Begun,
  FacePhoto,
  FittingRoomStore,
  Photo,
  PhotoKind,
  TryOn,
} from "./try-on"

/**
 * The Fitting Room in Firestore and Cloud Storage, through the Admin SDK
 * only (firestore.rules and storage.rules close both to browsers):
 * - `fittingRooms/{uid}`: the photos the account used last, `{ face, body }`,
 *   and its try-ons that failed after pictures were made, `failedTries`;
 * - `fittingRooms/{uid}/tryOns/{id}`: each try-on (lib/fitting-room/try-on.ts);
 * - Storage `fitting-room/{uid}/photos/{face|body}/{id}.jpg`: the photos, as
 *   prepared (lib/fitting-room/photo.ts);
 * - Storage `fitting-room/{uid}/try-ons/{id}/{step}.jpg`: the pictures;
 * - `config/fittingRoom`: the switch and the daily budget (budget.ts),
 *   made with its defaults by the first start, for the owner to change in
 *   the Firebase console; `usage/{YYYY-MM-DD}`: the units the day's
 *   try-ons reserved, `{ units }`;
 * - `limits/youcam`: YouCam's site-wide call budget (calls.ts),
 *   `{ tokens, at }`;
 * - `youcamTasks/{sha256 of the task id}`: the step a YouCam task renders,
 *   `{ uid, id, index, at }`, for its webhook; `webhooks/{sha256 of the
 *   webhook-id}`: the deliveries handled, `{ at }`; both swept daily;
 * - `runningTryOns/{uid}_{id}`: the try-ons running, `{ uid, id,
 *   startedAt }`, for the daily check to end those stuck.
 * The visitor sees them only through the server (app/api/fitting-room).
 */

const rooms = "fittingRooms"
const tryOnsOf = "tryOns"

const roomRef = (uid: string) => adminDb().collection(rooms).doc(uid)
const tryOnRef = (uid: string, id: string) =>
  roomRef(uid).collection(tryOnsOf).doc(id) as DocumentReference<TryOn>

const configRef = () => adminDb().collection("config").doc("fittingRoom")
const usageRef = (day: string) => adminDb().collection("usage").doc(day)

const callsRef = () => adminDb().collection("limits").doc("youcam")
const hashed = (value: string) =>
  createHash("sha256").update(value).digest("hex")
const taskRef = (task: string) =>
  adminDb().collection("youcamTasks").doc(hashed(task))
const deliveryRef = (id: string) =>
  adminDb().collection("webhooks").doc(hashed(id))
const runningRef = (uid: string, id: string) =>
  adminDb().collection("runningTryOns").doc(`${uid}_${id}`)

const reservedOf = (data: Record<string, unknown> | undefined) => {
  const units = data?.units
  return typeof units === "number" && units > 0 ? units : 0
}

const photoPath = (uid: string, kind: PhotoKind, id: string) =>
  `fitting-room/${uid}/photos/${kind}/${id}.jpg`
const stepPath = (uid: string, id: string, index: number) =>
  `fitting-room/${uid}/try-ons/${id}/${index}.jpg`

async function save(path: string, image: Uint8Array) {
  await adminBucket()
    .file(path)
    .save(Buffer.from(image), {
      resumable: false,
      contentType: "image/jpeg",
      metadata: { cacheControl: "private, max-age=31536000" },
    })
}

async function load(path: string): Promise<Uint8Array | null> {
  try {
    const [content] = await adminBucket().file(path).download()
    return new Uint8Array(content)
  } catch (error) {
    if ((error as { code?: unknown }).code === 404) return null
    throw error
  }
}

function photoOf(value: unknown): Photo | null {
  if (typeof value !== "object" || value === null) return null
  const { id, width, height } = value as Record<string, unknown>
  if (typeof id !== "string" || typeof width !== "number") return null
  return { id, width, height: typeof height === "number" ? height : 0 }
}

function facePhotoOf(value: unknown): FacePhoto | null {
  const photo = photoOf(value)
  const skin = (value as { skin?: unknown } | null)?.skin
  if (!photo || typeof skin !== "string" || !skin.startsWith("#")) return null
  return { ...photo, skin: skin as FacePhoto["skin"] }
}

function failedTriesOf(data: Record<string, unknown> | undefined) {
  const count = data?.failedTries
  return typeof count === "number" && count > 0 ? count : 0
}

export function fittingRoomStore(): FittingRoomStore {
  return {
    async room(uid) {
      const data = (await roomRef(uid).get()).data() ?? {}
      return {
        face: facePhotoOf(data.face),
        body: photoOf(data.body),
        failedTries: failedTriesOf(data),
      }
    },

    async savePhotos(uid, { face, body }) {
      // The pictures first: the room never names a photo that isn't kept.
      await Promise.all([
        face && save(photoPath(uid, "face", face[0].id), face[1]),
        body && save(photoPath(uid, "body", body[0].id), body[1]),
      ])
      await roomRef(uid).set(
        {
          ...(face && { face: face[0] }),
          ...(body && { body: body[0] }),
          updatedAt: Date.now(),
        },
        { merge: true }
      )
    },

    photo(uid, kind, id) {
      return load(photoPath(uid, kind, id))
    },

    async tryOn(uid, id) {
      return (await tryOnRef(uid, id).get()).data() ?? null
    },

    async tryOns(uid) {
      const snapshot = await roomRef(uid)
        .collection(tryOnsOf)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get()
      return snapshot.docs.map((doc) => doc.data() as TryOn)
    },

    begin(uid, fresh) {
      const ref = tryOnRef(uid, fresh.id)
      const room = roomRef(uid)
      const day = dayOf(fresh.createdAt)
      const units = unitsOfPlan(fresh.steps.map((step) => step.render))
      return adminDb().runTransaction<Begun>(async (transaction) => {
        const existing = (await transaction.get(ref)).data()
        if (existing && existing.status !== "failed")
          return { outcome: "existing", tryOn: existing }
        // The try-ons holding the free costume: filtered on one field, which
        // its automatic index serves.
        const [kept, holding, config, usage] = await Promise.all([
          transaction.get(room),
          transaction.get(
            room.collection(tryOnsOf).where("status", "in", ["running", "done"])
          ),
          transaction.get(configRef()),
          transaction.get(usageRef(day)),
        ])
        const allowance = allowanceOf(
          holding.docs.map((doc) => doc.data() as TryOn),
          failedTriesOf(kept.data()),
          fresh.renderer
        )
        if (!allowance.free) return { outcome: "out_of_units" }
        // The owner's switch, made with its defaults the first time.
        if (!config.exists) transaction.set(configRef(), DEFAULT_CONTROLS)
        if (!admits(controlsOf(config.data()), reservedOf(usage.data()), units))
          return { outcome: "closed" }
        const started: TryOn = { ...fresh, reserved: { day, units } }
        transaction.set(ref, started)
        transaction.set(runningRef(uid, fresh.id), {
          uid,
          id: fresh.id,
          startedAt: fresh.createdAt,
        })
        transaction.set(
          usageRef(day),
          { units: FieldValue.increment(units), updatedAt: Date.now() },
          { merge: true }
        )
        // Every start writes the room: of two at once, one is retried, and
        // then finds the other holding the free costume.
        transaction.set(room, { updatedAt: Date.now() }, { merge: true })
        return { outcome: "started", tryOn: started }
      })
    },

    updateStep(uid, id, index, when, change) {
      const ref = tryOnRef(uid, id)
      return adminDb().runTransaction(async (transaction) => {
        const tryOn = (await transaction.get(ref)).data()
        const step = tryOn?.steps[index]
        if (!tryOn || !step || !when(step)) return false
        const steps = tryOn.steps.map((each, at) =>
          at === index ? { ...each, ...change } : each
        )
        transaction.update(ref, { steps, updatedAt: Date.now() })
        return true
      })
    },

    finish(uid, id, status, failure) {
      const ref = tryOnRef(uid, id)
      return adminDb().runTransaction(async (transaction) => {
        const tryOn = (await transaction.get(ref)).data()
        transaction.delete(runningRef(uid, id))
        if (!tryOn || tryOn.status !== "running") return false
        transaction.update(ref, { status, failure, updatedAt: Date.now() })
        if (status === "failed" && countsAsFailedTry(tryOn, failure)) {
          transaction.set(
            roomRef(uid),
            { failedTries: FieldValue.increment(1) },
            { merge: true }
          )
        }
        // What was never rendered goes back to its day's budget.
        const unspent = unspentUnits(tryOn)
        if (unspent > 0 && tryOn.reserved) {
          transaction.set(
            usageRef(tryOn.reserved.day),
            { units: FieldValue.increment(-unspent), updatedAt: Date.now() },
            { merge: true }
          )
        }
        return true
      })
    },

    saveStepImage(uid, id, index, image) {
      return save(stepPath(uid, id, index), image)
    },

    stepImage(uid, id, index) {
      return load(stepPath(uid, id, index))
    },

    async capacity(now = Date.now()) {
      const [config, usage] = await Promise.all([
        configRef().get(),
        usageRef(dayOf(now)).get(),
      ])
      return {
        controls: controlsOf(config.data()),
        reserved: reservedOf(usage.data()),
      }
    },

    close(reason) {
      return adminDb().runTransaction(async (transaction) => {
        const controls = controlsOf((await transaction.get(configRef())).data())
        // Closed already (by the owner, or before): left as it is.
        if (!controls.open) return
        transaction.set(
          configRef(),
          { ...controls, open: false, closedFor: reason },
          { merge: true }
        )
      })
    },

    recordBalance(balance, now) {
      return adminDb().runTransaction(async (transaction) => {
        const controls = controlsOf((await transaction.get(configRef())).data())
        const next = {
          ...controls,
          ...afterBalance(controls, balance),
          balance,
          balanceAt: now,
        }
        transaction.set(configRef(), next, { merge: true })
        return next
      })
    },

    takeCalls(calls, now, debt = false) {
      return adminDb().runTransaction(async (transaction) => {
        const next = take(
          bucketOf((await transaction.get(callsRef())).data()),
          calls,
          now,
          debt
        )
        if (next) transaction.set(callsRef(), next)
        return next !== null
      })
    },

    async trackTask(task, { uid, id, index }, now) {
      await taskRef(task).set({ uid, id, index, at: now })
    },

    async taskStep(task) {
      const data = (await taskRef(task).get()).data()
      const { uid, id, index } = data ?? {}
      return typeof uid === "string" &&
        typeof id === "string" &&
        typeof index === "number"
        ? { uid, id, index }
        : null
    },

    async forgetTask(task) {
      await taskRef(task).delete()
    },

    async firstDelivery(id, now) {
      try {
        await deliveryRef(id).create({ at: now })
        return true
      } catch (error) {
        // ALREADY_EXISTS: handled before.
        if ((error as { code?: unknown }).code === 6) return false
        throw error
      }
    },

    async runningSince(before, limit) {
      const snapshot = await adminDb()
        .collection("runningTryOns")
        .where("startedAt", "<", before)
        .orderBy("startedAt")
        .limit(limit)
        .get()
      return snapshot.docs.flatMap((doc) => {
        const { uid, id } = doc.data()
        return typeof uid === "string" && typeof id === "string"
          ? [{ uid, id }]
          : []
      })
    },

    async sweep(before) {
      for (const name of ["youcamTasks", "webhooks"]) {
        const old = await adminDb()
          .collection(name)
          .where("at", "<", before)
          .limit(400)
          .get()
        if (old.empty) continue
        const batch = adminDb().batch()
        for (const doc of old.docs) batch.delete(doc.ref)
        await batch.commit()
      }
    },
  }
}
