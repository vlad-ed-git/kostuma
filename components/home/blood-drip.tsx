/**
 * Blood running down from the end of "Choose your costume", past the lines
 * under it (spec §11.1, owner: "blood dripping down… past the three lines,
 * and indicate down"): a pool at the word with two short runs, one long
 * stream with a bulge and a heavy drop at its tip, the light catching it
 * wet. It pours down once, then a drop swells at the tip and falls, again
 * and again (app/film.css, `.blood-drip`). Decorative: the link says where
 * it goes.
 */
export function BloodDrip() {
  return (
    <span aria-hidden="true" className="blood-drip">
      <svg viewBox="0 0 60 300" overflow="visible">
        <defs>
          <linearGradient id="blood-drip-fill">
            <stop offset="0" stopColor="#4a0408" />
            <stop offset=".35" stopColor="#a50f19" />
            <stop offset=".6" stopColor="#c8101d" />
            <stop offset="1" stopColor="#5e050b" />
          </linearGradient>
        </defs>
        <g className="blood-drip-stream" fill="url(#blood-drip-fill)">
          <path d="M4 15C2 9 7 4 13 4C16 1 22 0 27 3C31 0 38 1 41 4C46 2 53 5 55 10C59 13 57 19 52 21C50 25 44 24 41 26C36 28 31 25 27 27C22 28 17 26 13 26C8 26 4 21 4 15Z" />
          <path d="M24 20C25 50 26 80 25 105C24.5 118 22 126 22 140C22 165 24.5 190 24.5 215C20 222 17 229 17 238C17 249 23 256 30.5 256C38 256 44 249 44 238C44 229 41 222 36.5 215C36.5 190 38 165 38 140C38 126 35.5 118 35 105C34 80 35 50 36 20Z" />
          <path d="M11 22C11 32 10.5 42 11 50C8.5 53 7 56 7 60C7 64.5 9.5 67 12.5 67C15.5 67 18 64.5 18 60C18 56 16.5 53 14.5 50C14 42 14.5 32 15 22Z" />
          <path d="M46 22C46.5 30 46 36 46.5 41C44.8 43 44 45 44 47.5C44 50.5 45.8 52 48 52C50.2 52 52 50.5 52 47.5C52 45 51 43 49.5 41C49.8 36 49.5 30 50 22Z" />
          <circle cx="2" cy="28" r="1.8" />
          <circle cx="57" cy="27" r="1.4" />
          <circle cx="40" cy="33" r="1" />
          <g fill="none" stroke="#ece6da" strokeLinecap="round">
            <path
              d="M14 8C20 5 30 5 38 6"
              strokeOpacity=".25"
              strokeWidth="1.5"
            />
            <path
              d="M27.5 30C28 60 28.2 90 27.5 112C27 125 25 132 25.5 150"
              strokeOpacity=".3"
              strokeWidth="1.6"
            />
          </g>
          <ellipse
            cx="24.5"
            cy="236"
            rx="2.4"
            ry="4.5"
            fill="#ece6da"
            fillOpacity=".4"
          />
        </g>
        <path
          className="blood-drip-fall"
          fill="url(#blood-drip-fill)"
          d="M30.5 240C34 248 38 252 38 258C38 262.5 34.5 266 30.5 266C26.5 266 23 262.5 23 258C23 252 27 248 30.5 240Z"
        />
      </svg>
    </span>
  )
}
