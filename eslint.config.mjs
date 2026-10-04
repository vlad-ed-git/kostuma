import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Components the shadcn CLI adds may import `cn` from a package,
      // whose defaults take Kostuma's font sizes (`text-label`) for colors.
      "no-restricted-imports": [
        "error",
        {
          paths: ["cn", "tailwind-merge"].map((name) => ({
            name,
            message:
              'Import { cn } from "@/lib/utils": it knows Kostuma\'s type scale.',
          })),
        },
      ],
    },
  },
  // Where `cn` is made.
  { files: ["lib/utils.ts"], rules: { "no-restricted-imports": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The e2e build and test reports.
    ".next-e2e/**",
    ".next-emulators/**",
    "test-results/**",
    "playwright-report/**",
  ]),
])

export default eslintConfig
