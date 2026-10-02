/**
 * The night every page sits in (spec §8): the falloff of the light behind
 * the content, grain above it, fog along the bottom of the screen, and
 * scratches that only show while a page changes. CSS only (app/film.css),
 * still under reduced motion, invisible to assistive tech.
 */
export function Atmosphere() {
  return (
    <>
      <div aria-hidden="true" className="film-vignette" />
      <div aria-hidden="true" className="ground-fog">
        <span />
      </div>
      <div aria-hidden="true" className="film-grain" />
      <div aria-hidden="true" className="film-scratches" />
    </>
  )
}
