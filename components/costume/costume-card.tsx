import { IntentLink } from "@/components/navigation/intent-link"
import type { CostumeCard as Card } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

import { filmLine } from "./format"
import { CostumeImage } from "./costume-image"

type CostumeCardProps = {
  costume: Card
  /** The card's heading level, so a page's outline never skips one. */
  heading?: "h2" | "h3"
  /** Which widths the card's image takes up in its grid. */
  sizes?: string
  className?: string
}

/**
 * A costume in a grid (spec §10.3): a 4:5 poster with the name and the
 * film. The whole card is one link (the name's, stretched over it), so
 * nothing interactive is nested. It prefetches only on intent: grids list
 * many cards (components/navigation/intent-link.tsx).
 */
export function CostumeCard({
  costume,
  heading: Heading = "h2",
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  className,
}: CostumeCardProps) {
  return (
    <article
      className={cn(
        "group/card reveal relative isolate",
        // The stretched link's focus ring goes around the whole card.
        "outline-offset-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus",
        className
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-card">
        <CostumeImage
          sizes={sizes}
          className="object-cover transition-transform duration-1200 ease-dread group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
        />
        {/* Carries the text; a red rim light rises from it on hover. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-background via-background/70 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--blood)_40%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        />
        <div className="absolute inset-x-3 bottom-3 flex flex-col items-start gap-2">
          <Heading className="line-clamp-2 font-heading text-h3 uppercase">
            <IntentLink
              href={`/costumes/${costume.slug}`}
              className="outline-none after:absolute after:inset-0 after:z-10"
            >
              {costume.name}
            </IntentLink>
          </Heading>
          <span
            aria-hidden="true"
            className="block h-px w-full origin-left scale-x-0 bg-blood transition-transform duration-400 ease-dread group-hover/card:scale-x-100 group-has-[a:focus-visible]/card:scale-x-100 motion-reduce:transition-none"
          />
          <p className="font-mono text-micro text-muted-foreground uppercase">
            {filmLine(costume.films)}
          </p>
        </div>
      </div>
    </article>
  )
}
