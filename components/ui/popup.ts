/**
 * The site's pop-ups (Base UI dialogs, spec §10.1): a card lit red from
 * behind, over the page dimmed and blurred; they rise out of the dark and
 * sink back into it, and stay still under reduced motion.
 */
export const backdropClass =
  "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ease-heavy data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"

export const popupClass =
  "fixed top-1/2 left-1/2 z-50 flex w-[min(100vw-2rem,36rem)] -translate-1/2 flex-col gap-4 border border-blood/40 bg-card p-6 shadow-[0_0_80px_-10px_color-mix(in_oklch,var(--blood)_45%,transparent)] transition-[opacity,scale] duration-300 ease-dread outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none sm:p-8"
