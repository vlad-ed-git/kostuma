import { useTranslations } from "next-intl"

import { BasketToggle } from "@/components/basket/basket-toggle"
import { IntentLink } from "@/components/navigation/intent-link"
import type { CostumeSummary } from "@/lib/catalog/types"

import { CostumeImage } from "./costume-image"
import { filmLine } from "./format"

/**
 * A costume in a list (spec §10.3): its first photo (114 px wide, 156 px
 * from `lg`: the owner asked for one and a half times), its name in the title
 * face, its film underneath: one link, which turns blood red under the
 * pointer or the keyboard and prefetches on intent only. At the row's end,
 * the pumpkin puts the costume in My Pumpkin Basket or takes it out.
 */
export function CostumeRow({ costume }: { costume: CostumeSummary }) {
  const t = useTranslations("Costume")
  return (
    <div className="flex items-center gap-2">
      <IntentLink
        href={`/costumes/${costume.slug}`}
        className="group/row grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-2.5 outline-offset-4 lg:gap-6"
      >
        {/* Off-screen, its picture isn't rendered (todo ENG-07): the frame
            keeps its size, and its glow (its own) is never clipped. */}
        <span className="relative aspect-4/5 w-28.5 overflow-hidden border border-foreground/8 bg-card transition-[border-color,box-shadow] duration-300 [content-visibility:auto] group-hover/row:border-blood-text/50 group-hover/row:shadow-[0_0_34px_color-mix(in_oklch,var(--blood)_45%,transparent)] group-focus-visible/row:border-blood-text/50 lg:w-39">
          <CostumeImage
            photo={costume.photo}
            alt=""
            sizes="(min-width: 1024px) 156px, 114px"
            className="brightness-80 transition-[filter] duration-300 group-hover/row:brightness-100 group-focus-visible/row:brightness-100"
          />
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-heading text-h3 font-medium text-balance transition-[color,translate,text-shadow] duration-300 ease-dread group-hover/row:translate-x-1.5 group-hover/row:text-blood-text group-hover/row:[text-shadow:0_0_30px_color-mix(in_oklch,var(--blood)_55%,transparent)] group-focus-visible/row:text-blood-text motion-reduce:transition-none motion-reduce:group-hover/row:translate-x-0">
            {costume.name}
          </span>
          <span className="text-lg text-muted-foreground italic transition-colors group-hover/row:text-foreground">
            {filmLine(costume.films, (film) => t("film", film))}
          </span>
        </span>
      </IntentLink>
      <BasketToggle slug={costume.slug} name={costume.name} />
    </div>
  )
}
