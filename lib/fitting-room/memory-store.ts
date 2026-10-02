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
 * runs alone, as a transaction would.
 */

type Account = {
  face: FacePhoto | null
  body: Photo | null
  photos: Map<string, Uint8Array>
  tryOns: Map<string, TryOn>
  images: Map<string, Uint8Array>
}

export function memoryStore(): FittingRoomStore {
  const accounts = new Map<string, Account>()

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

  const copy = <T>(value: T): T => structuredClone(value)
  const photoKey = (kind: PhotoKind, id: string) => `${kind}/${id}`

  return {
    async room(uid) {
      const { face, body } = account(uid)
      return { face: face && copy(face), body: body && copy(body) }
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
      found.tryOns.set(fresh.id, copy(fresh))
      return { outcome: "started", tryOn: copy(fresh) }
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
      const tryOn = account(uid).tryOns.get(id)
      if (!tryOn || tryOn.status !== "running") return false
      tryOn.status = status
      tryOn.failure = failure
      tryOn.updatedAt = Date.now()
      return true
    },

    async saveStepImage(uid, id, index, image) {
      account(uid).images.set(`${id}/${index}`, image)
    },

    async stepImage(uid, id, index) {
      return account(uid).images.get(`${id}/${index}`) ?? null
    },
  }
}
