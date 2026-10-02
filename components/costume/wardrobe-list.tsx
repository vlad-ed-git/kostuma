import type { Look } from "@/lib/catalog/types"

/**
 * "The look" as a wardrobe department checklist (spec §10.3): one line
 * per piece, each with a small square bullet, then any other way to wear
 * it.
 */
export function WardrobeList({ look }: { look: Look }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2.5">
        {look.pieces.map((piece) => (
          <li key={piece} className="flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 translate-y-[-0.2em] border border-blood"
            />
            {piece}
          </li>
        ))}
      </ul>
      {look.alternative && (
        <p className="text-muted-foreground">{look.alternative}</p>
      )}
    </div>
  )
}
