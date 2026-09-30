import { cn } from "@/lib/utils"

/**
 * Slow fog along the bottom of its (positioned) parent: the home hero, the
 * 404 and, flipped, the footer (spec §8.7). It spills past the parent's top
 * and bottom and fades out, so its parent must not clip it. Still under
 * reduced motion.
 */
export function Fog({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("fog", className)} />
}
