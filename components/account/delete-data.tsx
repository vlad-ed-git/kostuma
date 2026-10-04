"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { RiLoader4Line } from "@remixicon/react"
import { useLocale, useTranslations } from "next-intl"
import { useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { backdropClass, popupClass } from "@/components/ui/popup"
import { useRouter } from "@/i18n/navigation"
import {
  deleteAccount,
  deletePhotos,
  type EraseError,
  type EraseResult,
} from "@/lib/account/actions"

/**
 * The account page's two deletions (todo SEC-04): the photos and pictures,
 * or the whole account. Each asks first, in a pop-up whose first focus
 * keeps everything (Enter or Escape never deletes by accident); deleting
 * the account signs out and goes home.
 */
export function DeleteData() {
  const t = useTranslations("Account")
  const locale = useLocale()
  const router = useRouter()
  const [deleted, setDeleted] = useState(false)

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        <Ask
          label={t("deletePhotos")}
          title={t("deletePhotosTitle")}
          line={t("deletePhotosLine")}
          keep={t("keepPhotos")}
          confirm={t("deletePhotosConfirm")}
          action={async () => {
            const result = await deletePhotos()
            if (result.ok) {
              setDeleted(true)
              router.refresh()
            }
            return result
          }}
        />
        <Ask
          label={t("deleteAccount")}
          title={t("deleteAccountTitle")}
          line={t("deleteAccountLine")}
          keep={t("keepAccount")}
          confirm={t("deleteAccountConfirm")}
          action={() => deleteAccount(locale)}
        />
      </div>
      <p role="status" className="text-muted-foreground">
        {deleted ? t("photosDeleted") : ""}
      </p>
    </div>
  )
}

/** A deletion behind its pop-up. */
function Ask({
  label,
  title,
  line,
  keep,
  confirm,
  action,
}: {
  label: string
  title: string
  line: string
  keep: string
  confirm: string
  action: () => Promise<EraseResult>
}) {
  const t = useTranslations("Account")
  const keepButton = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<EraseError | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        setError(null)
      }}
    >
      <AlertDialog.Trigger
        render={
          <Button
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-destructive"
          />
        }
      >
        {label}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={backdropClass} />
        <AlertDialog.Popup initialFocus={keepButton} className={popupClass}>
          <AlertDialog.Title className="font-heading text-h4 font-semibold text-balance">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-body-lg text-muted-foreground">
            {line}
          </AlertDialog.Description>
          {error && (
            <p role="alert" className="text-destructive">
              {t(`deleteErrors.${error}`)}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-end">
            <AlertDialog.Close
              ref={keepButton}
              disabled={pending}
              render={<Button variant="outline" size="lg" />}
            >
              {keep}
            </AlertDialog.Close>
            <Button
              variant="destructive"
              size="lg"
              aria-busy={pending || undefined}
              disabled={pending}
              className="gap-2"
              onClick={() =>
                startTransition(async () => {
                  const result = await action()
                  if (result.ok) setOpen(false)
                  else setError(result.error)
                })
              }
            >
              {pending && (
                <RiLoader4Line
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              )}
              {pending ? t("deleting") : confirm}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
