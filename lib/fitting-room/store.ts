import "server-only"

import { type DocumentReference, FieldValue } from "firebase-admin/firestore"

import { adminBucket, adminDb } from "@/lib/firebase/admin"

import { allowanceOf, madePictures } from "./free-costume"
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
 * - Storage `fitting-room/{uid}/try-ons/{id}/{step}.jpg`: the pictures.
 * The visitor sees them only through the server (app/api/fitting-room).
 */

const rooms = "fittingRooms"
const tryOnsOf = "tryOns"

const roomRef = (uid: string) => adminDb().collection(rooms).doc(uid)
const tryOnRef = (uid: string, id: string) =>
  roomRef(uid).collection(tryOnsOf).doc(id) as DocumentReference<TryOn>

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
      return adminDb().runTransaction<Begun>(async (transaction) => {
        const existing = (await transaction.get(ref)).data()
        if (existing && existing.status !== "failed")
          return { outcome: "existing", tryOn: existing }
        // The try-ons holding the free costume: filtered on one field, which
        // its automatic index serves.
        const [kept, holding] = await Promise.all([
          transaction.get(room),
          transaction.get(
            room.collection(tryOnsOf).where("status", "in", ["running", "done"])
          ),
        ])
        const allowance = allowanceOf(
          holding.docs.map((doc) => doc.data() as TryOn),
          failedTriesOf(kept.data()),
          fresh.renderer
        )
        if (!allowance.free) return { outcome: "out_of_units" }
        transaction.set(ref, fresh)
        // Every start writes the room: of two at once, one is retried, and
        // then finds the other holding the free costume.
        transaction.set(room, { updatedAt: Date.now() }, { merge: true })
        return { outcome: "started", tryOn: fresh }
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
        if (!tryOn || tryOn.status !== "running") return false
        transaction.update(ref, { status, failure, updatedAt: Date.now() })
        if (status === "failed" && madePictures(tryOn)) {
          transaction.set(
            roomRef(uid),
            { failedTries: FieldValue.increment(1) },
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
  }
}
