import { createNavigation } from "next-intl/navigation"

import { routing } from "./routing"

// Next.js' navigation APIs, aware of the locale prefix. Import these instead
// of the ones from `next/link` and `next/navigation`.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
