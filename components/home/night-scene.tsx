import { Fog } from "@/components/horror/fog"

import { Flashlight } from "./flashlight"

/**
 * Behind the home title (spec §11.1): moonlight, eyes that only the
 * flashlight finds, the darkness the flashlight cuts through, a grimy
 * blood-red window with a hooded figure standing in it (on phones only),
 * and fog. All decorative; the
 * parent section must be positioned, isolated and clipped.
 */
export function NightScene() {
  return (
    <>
      <div aria-hidden="true" className="night-sky" />
      <div aria-hidden="true" className="night-hidden">
        <svg
          viewBox="0 0 60 16"
          className="eyes absolute bottom-[26%] left-[3%] w-13"
        >
          <ellipse cx="12" cy="8" rx="5" ry="3" fill="#e8d86a" />
          <ellipse cx="48" cy="8" rx="5" ry="3" fill="#e8d86a" />
          <ellipse cx="12" cy="8" rx="1.4" ry="3" fill="#000" />
          <ellipse cx="48" cy="8" rx="1.4" ry="3" fill="#000" />
        </svg>
      </div>
      <Flashlight />
      <svg aria-hidden="true" viewBox="0 0 400 640" className="apparition">
        <defs>
          <radialGradient id="lamp-spill" cx="50%" cy="40%" r="50%">
            <stop offset="0" stopColor="#c8101d" stopOpacity=".3" />
            <stop offset="1" stopColor="#c8101d" stopOpacity="0" />
          </radialGradient>
          <clipPath id="window-pane">
            <path d="M112 138 A88 88 0 0 1 288 138 V340 H112 Z" />
          </clipPath>
          {/* Burnt in from the frame, as the film's windows are. */}
          <radialGradient id="window-burn" cx="50%" cy="46%" r="62%">
            <stop offset="0" stopColor="#1a0204" stopOpacity=".1" />
            <stop offset=".65" stopColor="#1a0204" stopOpacity=".5" />
            <stop offset="1" stopColor="#060102" stopOpacity=".9" />
          </radialGradient>
          {/* Rotten wood and old glass: no straight edge left. */}
          <filter
            id="window-rough"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.09"
              numOctaves="2"
              seed="7"
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <ellipse cx="200" cy="200" rx="200" ry="220" fill="url(#lamp-spill)" />
        {/* The glass: the film strip's grime (public/images/window-glass.webp),
            dimmed, its edges burnt; the frame dark, worn and rough. */}
        <g className="lamp" filter="url(#window-rough)">
          <g clipPath="url(#window-pane)">
            <image
              href="/images/window-glass.webp"
              x="112"
              y="50"
              width="176"
              height="290"
              preserveAspectRatio="xMidYMid slice"
            />
            <rect
              x="112"
              y="50"
              width="176"
              height="290"
              fill="#2a0306"
              opacity=".4"
            />
            <rect
              x="112"
              y="50"
              width="176"
              height="290"
              fill="url(#window-burn)"
            />
          </g>
          <path
            d="M200 52 V340 M112 214 H288"
            stroke="#170809"
            strokeOpacity=".92"
            strokeWidth="9"
          />
          <path
            d="M112 138 A88 88 0 0 1 288 138 V340 H112 Z"
            fill="none"
            stroke="#170809"
            strokeWidth="12"
          />
        </g>
        <g className="figure">
          <path
            fill="#040405"
            d="M200 112 C166 112 147 142 143 178 C139 214 148 238 139 260 C108 284 76 302 64 344 C48 404 38 524 26 640 L374 640 C362 524 352 404 336 344 C324 302 292 284 261 260 C252 238 261 214 257 178 C253 142 234 112 200 112 Z"
          />
          <g fill="#ff5a45">
            <ellipse className="glint" cx="187" cy="196" rx="3.4" ry="1.8" />
            <ellipse className="glint" cx="213" cy="196" rx="3.4" ry="1.8" />
          </g>
        </g>
      </svg>
      <Fog />
    </>
  )
}
