"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"

/**
 * "Try with other photos" on a finished try-on (owner, 2026-10-03): it asks
 * first. New photos make a new try-on in place of this one, so the pop-up
 * says so and offers to keep the current photos, focused first (Enter or
 * Escape never replaces them by accident). Choosing new photos opens the
 * photos, where they can still be kept: nothing changes until the new
 * try-on starts.
 */
export function ReplacePhotos({
  name,
  onReplace,
}: {
  /** The character tried on. */
  name: string
  /** Opens the photos to replace. */
  onReplace: () => void
}) {
  const t = useTranslations("FittingRoom")
  const keep = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger render={<Button variant="outline" size="lg" />}>
        {t("again")}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ease-heavy data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <AlertDialog.Popup
          initialFocus={keep}
          className="fixed top-1/2 left-1/2 z-50 flex w-[min(100vw-2rem,36rem)] -translate-1/2 flex-col gap-4 border border-blood/40 bg-card p-6 shadow-[0_0_80px_-10px_color-mix(in_oklch,var(--blood)_45%,transparent)] transition-[opacity,scale] duration-300 ease-dread outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none sm:p-8"
        >
          <AlertDialog.Title className="font-heading text-h4 font-semibold text-balance">
            {t("replace.title")}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-body-lg text-muted-foreground">
            {t("replace.line", { name })}
          </AlertDialog.Description>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <AlertDialog.Close
              ref={keep}
              render={<Button variant="outline" size="lg" />}
            >
              {t("replace.keep")}
            </AlertDialog.Close>
            <Button
              size="lg"
              onClick={() => {
                setOpen(false)
                onReplace()
              }}
            >
              {t("replace.choose")}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
