import { z } from "zod"

// Zod's fast path compiles code with `new Function`, which the CSP forbids:
// even its probe for that shows up as a CSP violation. Every schema imports
// `z` from here, so this runs before any form is checked.
z.config({ jitless: true })

export { z }
