import { useTranslations } from "next-intl"

import type { Costume } from "@/lib/catalog/types"

/**
 * The credits, set like the billing block at the foot of a one-sheet
 * (spec §10.3): centered, tall and narrow (League Gothic at 75 % width),
 * small role words above the names. A role without names is left out.
 */
export function BillingBlock({
  costume,
}: {
  costume: Pick<Costume, "createdBy" | "broughtToLifeBy">
}) {
  const t = useTranslations("Costume")
  const credits = [
    { role: t("createdBy"), lines: costume.createdBy },
    { role: t("broughtToLifeBy"), lines: costume.broughtToLifeBy },
  ].filter(({ lines }) => lines.length > 0)

  return (
    <dl className="flex flex-col items-center gap-6 border-y border-border py-8 text-center">
      {credits.map(({ role, lines }) => (
        <div key={role} className="flex flex-col items-center gap-1.5">
          <dt className="font-mono text-micro text-muted-foreground uppercase">
            {role}
          </dt>
          {lines.map((line) => (
            <dd
              key={line}
              className="max-w-[40ch] font-heading text-billing text-balance text-foreground/90 uppercase [font-stretch:75%]"
            >
              {line}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  )
}
