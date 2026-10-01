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

/**
 * The costume's photos, by file name with its extension, in the order to
 * show them. Some costumes have more than one (The Strangers, The Purge).
 * `og[i]` and `noBg[i]` are the same photo: `og` is the original (in the
 * owner's photos/original folder), `noBg` its cut-out on a transparent
 * background (photos/no_bg, always PNG). Empty when the costume has no photo
 * yet.
 */
export type Images = { og: string[]; noBg: string[] }

/** One costume of the collection, as curated in content/costumes.ts. */
export type Costume = {
  /** 1–100: the editorial ranking. */
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
  images: Images
  stores: Store[]
}

/** What a list shows of a costume, and nothing more. */
export type CostumeSummary = Pick<Costume, "slug" | "name" | "films">
