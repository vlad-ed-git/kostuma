/**
 * A change to the basket, as the visitor makes it. Each one is idempotent:
 * applied twice, or on top of a state that already has it, it changes
 * nothing more. That lets a change be shown before the account confirms it.
 */
export type Change =
  | { type: "add"; slugs: readonly string[] }
  | { type: "remove"; slug: string }
  | { type: "clear" }

/** The basket after a change. */
export function applyChange(
  slugs: readonly string[],
  change: Change
): readonly string[] {
  switch (change.type) {
    case "add": {
      const added = change.slugs.filter((slug) => !slugs.includes(slug))
      return added.length === 0 ? slugs : [...slugs, ...new Set(added)]
    }
    case "remove":
      return slugs.includes(change.slug)
        ? slugs.filter((slug) => slug !== change.slug)
        : slugs
    case "clear":
      return slugs.length === 0 ? slugs : []
  }
}

/** The account's basket, as the account last reported it. */
export type RemoteState = {
  /** The costumes, in the order added (not yet checked against the catalog). */
  slugs: unknown
  /**
   * The server's own copy, with nothing of this tab's still on its way:
   * the only state worth caching on the device.
   */
  confirmed: boolean
}

/**
 * A signed-in visitor's basket in their account (lib/basket/firestore.ts),
 * as the basket store uses it.
 */
export type RemoteBasket = {
  /**
   * Reports the account's basket now and after every change, from any tab
   * or device, until the returned function is called. `fail` ends it.
   */
  watch(
    next: (state: RemoteState) => void,
    fail: (error: unknown) => void
  ): () => void
  /** Settles once the account has it, or refused it. */
  apply(change: Change): Promise<void>
}
