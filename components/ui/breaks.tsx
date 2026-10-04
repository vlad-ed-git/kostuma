import type { ReactNode } from "react"

/**
 * A display string's break points, for `t.rich`: Chinese has no spaces, so
 * its headings mark where a line may break with `<wbr></wbr>` (todo UX-12),
 * and break nowhere else unless a part would overflow (globals.css); a
 * phrase in `<nowrap>` stays on one line in any language ("step by step").
 */
export const breaks = {
  wbr: () => <wbr />,
  nowrap: (chunks: ReactNode) => (
    <span className="whitespace-nowrap">{chunks}</span>
  ),
}
