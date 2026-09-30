import type { ComponentProps } from "react"
import { vi } from "vitest"

/**
 * Stands in for `@/i18n/navigation` in component tests, which run without
 * Next.js' router: `vi.mock("@/i18n/navigation", () => import(
 * "@/test/navigation"))`. Links become plain anchors.
 */
export function Link({
  href,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  return <a href={href} {...props} />
}

export const replace = vi.fn()

export const usePathname = () => "/"

export const useRouter = () => ({ replace, push: vi.fn() })
