/**
 * The film every page is projected on (spec §8): a lamp's vignette and the
 * occasional light leak behind the content, grain above it, and scratches
 * that only show while a page changes reels. CSS only (app/film.css), still
 * under reduced motion, invisible to assistive tech.
 */
export function Atmosphere() {
  return (
    <>
      <div aria-hidden="true" className="film-vignette" />
      <div aria-hidden="true" className="film-leak" />
      <div aria-hidden="true" className="film-grain" />
      <div aria-hidden="true" className="film-scratches" />
    </>
  )
}
