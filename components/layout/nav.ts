/**
 * The site's main sections, shared by the header and the mobile menu. The
 * labels are keys of the `Nav` messages. `soon` marks a coming-soon page
 * (spec §12: a working link with a "Soon" badge, never a disabled one).
 */
export const primaryNav = [
  { href: "/costumes", label: "costumes", soon: false },
  { href: "/try-on", label: "mirror", soon: true },
  { href: "/pricing", label: "pricing", soon: true },
] as const
