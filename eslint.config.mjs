import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Components the shadcn CLI adds import `cn` from the package, whose
      // defaults take Kostuma's font sizes (`text-label`) for colors.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "cn",
              message:
                'Import { cn } from "@/lib/utils": it knows Kostuma\'s type scale.',
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The e2e build and test reports.
    ".next-e2e/**",
    "test-results/**",
    "playwright-report/**",
  ]),
])

export default eslintConfig
