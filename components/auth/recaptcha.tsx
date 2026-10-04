"use client"

import { useTranslations } from "next-intl"
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react"

import { cn } from "@/lib/utils"

type Grecaptcha = {
  render(
    container: HTMLElement,
    parameters: {
      sitekey: string
      theme: "dark"
      hl: string
      size: "normal" | "compact"
    }
  ): number
  reset(widget: number): void
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
    onRecaptchaLoad?: () => void
  }
}

let script: Promise<Grecaptcha> | undefined

/**
 * Loads Google's script once per page. Every widget waits on the same
 * promise, so one that mounts while the script is still loading renders too.
 */
function loadRecaptcha() {
  script ??= new Promise<Grecaptcha>((resolve, reject) => {
    window.onRecaptchaLoad = () => resolve(window.grecaptcha!)
    const element = document.createElement("script")
    element.src =
      "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
    element.async = true
    element.onerror = () => {
      script = undefined // Let the next mount try again.
      reject(new Error("reCAPTCHA did not load."))
    }
    document.head.append(element)
  })
  return script
}

/** How long Google's box may take before the visitor is told. */
export const RECAPTCHA_PATIENCE_MS = 10_000

export type RecaptchaHandle = {
  /** Clears the tick: a token passes Google's check only once. */
  reset(): void
}

/**
 * Google's "I'm not a robot" checkbox, dark, in the page's language. Once
 * ticked, it adds its token to the surrounding form as the
 * `g-recaptcha-response` field. If Google fails, or is still silent after
 * a while, the visitor is told in words; a box that arrives late still
 * shows.
 */
export function Recaptcha({
  siteKey,
  locale,
  ref,
}: {
  siteKey: string
  locale: string
  ref?: Ref<RecaptchaHandle>
}) {
  const t = useTranslations("Recaptcha")
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<number | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")
  // Google's box is 304 px wide; narrower screens get its compact one.
  const [compact, setCompact] = useState(false)

  useImperativeHandle(ref, () => ({
    reset() {
      if (widget.current !== null) window.grecaptcha?.reset(widget.current)
    },
  }))

  useEffect(() => {
    let mounted = true
    const patience = setTimeout(() => {
      if (mounted && widget.current === null) setState("failed")
    }, RECAPTCHA_PATIENCE_MS)
    loadRecaptcha().then(
      (grecaptcha) => {
        if (!mounted || !container.current) return
        // Rendered already: the effect ran again on the same element.
        if (widget.current === null) {
          const narrow = container.current.clientWidth < 304
          setCompact(narrow)
          widget.current = grecaptcha.render(container.current, {
            sitekey: siteKey,
            theme: "dark",
            hl: locale === "zh" ? "zh-CN" : locale,
            size: narrow ? "compact" : "normal",
          })
        }
        setState("ready")
      },
      () => {
        if (mounted) setState("failed")
      }
    )
    return () => {
      mounted = false
      clearTimeout(patience)
    }
  }, [siteKey, locale])

  return (
    <>
      {/* The box's size, reserved so the form does not jump; never wider
          than the screen. */}
      <div
        ref={container}
        data-recaptcha
        className={cn(
          "max-w-[304px]",
          compact ? "h-[138px]" : "h-[78px]",
          state === "failed" && "hidden"
        )}
      />
      {state === "failed" && (
        <p role="alert" className="text-destructive">
          {t("unavailable")}
        </p>
      )}
    </>
  )
}
