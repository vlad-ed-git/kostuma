import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      ".next/**",
      ".next-e2e/**",
      "e2e/**",
      // Need the Firestore emulator: `npm run test:firestore`.
      "**/*.emulator.test.ts",
    ],
  },
})
