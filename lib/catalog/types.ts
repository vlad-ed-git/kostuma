/** A film a character comes from. */
export type Film = { title: string; year: number }

/**
 * What the costume takes: the pieces of the main outfit, and sometimes
 * another way to wear it ("Or the red wedding dress.").
 */
export type Look = { pieces: string[]; alternative?: string }

/** A shop that sells the costume: where "Buy" in the basket leads. */
export type Store = {
  name: string
  url: string
  /** Marks the link `sponsored` (spec §10.3). */
  affiliate?: boolean
}

/** A costume photo: a cut-out on a transparent background. */
export type Photo = {
  /** The master's file name, as in photos/masters (`npm run photos:masters`). */
  file: string
  /**
   * Where the site loads it: the master's web copy (WebP) on Firebase
   * Storage, public and read-only (`npm run photos:upload`).
   */
  url: string
  /** The web copy's size in pixels: the long side is at most 1400. */
  width: number
  height: number
}

/** One costume of the collection, as curated in content/costumes.ts. */
export type Costume = {
  /** 1–82: the editorial ranking, in the owner's order. */
  rank: number
  /** The URL segment: lowercase words and hyphens, never a dot. */
  slug: string
  name: string
  /** A 2024–2026 breakout (🔥 in the owner's list). Not shown for now. */
  trending: boolean
  /** The first film is the one the character is known from. */
  films: Film[]
  createdBy: string[]
  broughtToLifeBy: string[]
  lore: string
  funFact: string
  look: Look
  /**
   * The costume's photos, in the order to show them. Usually one; The
   * Strangers has three, The Purge two. Set by `npm run photos:upload`.
   */
  images: Photo[]
  stores: Store[]
}

/** What a list shows of a costume, and nothing more: its first photo. */
export type CostumeSummary = Pick<Costume, "slug" | "name" | "films"> & {
  photo?: Photo
}
