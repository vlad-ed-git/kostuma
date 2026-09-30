"use client"

import { useEffect, useRef } from "react"

/**
 * The darkness over the night scene, with a hole in it that follows the
 * pointer: a flashlight (app/film.css `.flashlight`). When nobody moves
 * it, and on touch screens, it wanders on its own in slow figure-eights.
 * Reduced motion: it stays where it is. It moves with transforms only and
 * rests while the scene is off screen or the tab is hidden.
 */
export function Flashlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dark = ref.current
    const scene = dark?.closest<HTMLElement>("[data-title-card]")
    if (!dark || !scene) return

    let target = { x: 0.3, y: 0.62 }
    const at = { ...target }
    let frame = 0
    let lastMove = -Infinity
    let visible = true

    const place = () => {
      dark.style.setProperty("--px", `${at.x * scene.clientWidth}px`)
      dark.style.setProperty("--py", `${at.y * scene.clientHeight}px`)
    }
    // Eases toward the target, then stops asking for frames.
    const step = () => {
      at.x += (target.x - at.x) * 0.14
      at.y += (target.y - at.y) * 0.14
      place()
      const moving =
        Math.abs(target.x - at.x) + Math.abs(target.y - at.y) > 0.0005
      frame = moving ? requestAnimationFrame(step) : 0
    }
    const follow = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }

    const onMove = (event: PointerEvent) => {
      const box = scene.getBoundingClientRect()
      target = {
        x: (event.clientX - box.left) / box.width,
        y: (event.clientY - box.top) / box.height,
      }
      lastMove = performance.now()
      follow()
    }
    scene.addEventListener("pointermove", onMove)
    place()

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    seen.observe(scene)

    let wander: ReturnType<typeof setInterval> | undefined
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const start = performance.now()
      wander = setInterval(() => {
        const now = performance.now()
        if (!visible || document.hidden || now - lastMove < 2500) return
        const t = (now - start) / 1000
        target = {
          x: 0.5 + 0.34 * Math.sin(t / 3.1),
          y: 0.58 + 0.2 * Math.sin(t / 1.7),
        }
        follow()
      }, 60)
    }

    return () => {
      scene.removeEventListener("pointermove", onMove)
      seen.disconnect()
      clearInterval(wander)
      cancelAnimationFrame(frame)
    }
  }, [])

  // The darkness fades out before the scene's bottom edge, so it never
  // draws a line where the scene ends.
  return (
    <div aria-hidden="true" className="night-dark">
      <div ref={ref} className="flashlight" />
    </div>
  )
}
