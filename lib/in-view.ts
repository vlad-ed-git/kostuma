/**
 * Calls back once, the first time an element reaches the upper four fifths
 * of the window (so it is seen, not just touched at the bottom edge). Works
 * for elements of any height, even taller than the window. One observer
 * serves every element (82 costume photos on the home page). Returns a
 * function that stops watching.
 */
export function onceInView(element: Element, callback: () => void) {
  // Old browsers: as if already in view.
  if (typeof IntersectionObserver === "undefined") {
    callback()
    return () => {}
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const seen = waiting.get(entry.target)
        stop(entry.target)
        seen?.()
      }
    },
    { rootMargin: "0px 0px -20% 0px" }
  )
  waiting.set(element, callback)
  observer.observe(element)
  return () => stop(element)
}

let observer: IntersectionObserver | undefined
const waiting = new Map<Element, () => void>()

function stop(element: Element) {
  waiting.delete(element)
  observer?.unobserve(element)
}
