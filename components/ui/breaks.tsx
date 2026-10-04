/**
 * A display string's break points: Chinese has no spaces, so its headings
 * mark where a line may break with `<wbr></wbr>` (todo UX-12), and break
 * nowhere else unless a part would overflow (globals.css). For `t.rich`.
 */
export const breaks = { wbr: () => <wbr /> }
