"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import { GetPro } from "@/components/pro/get-pro"
import { Button } from "@/components/ui/button"
import { backdropClass, popupClass } from "@/components/ui/popup"

/**
 * "Try with other photos" on a finished try-on (owner, 2026-10-03): it asks
 * first. New photos make a new try-on in place of this one, so the pop-up
 * says so and offers to keep the current photos, focused first (Enter or
 * Escape never replaces them by accident). Choosing new photos opens the
 * photos, where they can still be kept: nothing changes until the new
 * try-on starts. Once the free costume is used, new photos would need
 * Kostuma Pro: the pop-up says so and offers it instead.
 */
export function ReplacePhotos({
  name,
  free,
  onReplace,
}: {
  /** The character tried on. */
  name: string
  /** Whether the account's free costume is still there. */
  free: boolean
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
        <AlertDialog.Backdrop className={backdropClass} />
        <AlertDialog.Popup initialFocus={keep} className={popupClass}>
          <AlertDialog.Title className="font-heading text-h4 font-semibold text-balance">
            {free ? t("replace.title") : t("used.title")}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-body-lg text-muted-foreground">
            {free
              ? t("replace.line", { name })
              : t("replace.usedLine", { name })}
          </AlertDialog.Description>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-end">
            <AlertDialog.Close
              ref={keep}
              render={<Button variant="outline" size="lg" />}
            >
              {t("replace.keep")}
            </AlertDialog.Close>
            {free ? (
              <Button
                size="lg"
                onClick={() => {
                  setOpen(false)
                  onReplace()
                }}
              >
                {t("replace.choose")}
              </Button>
            ) : (
              <GetPro source="fitting-room" />
            )}
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
