import { cn } from "@/lib/utils"

/**
 * Slow fog along the bottom of its (positioned) parent: the home hero and
 * the footer (spec §8.7). Still under reduced motion.
 */
export function Fog({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("fog", className)} />
}
