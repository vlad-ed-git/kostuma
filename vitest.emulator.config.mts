import { defineConfig } from "vitest/config"

// The tests that need the Firestore emulator (`npm run test:firestore` starts
// it): the rules and the basket's live sync, against the real SDK.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["**/*.emulator.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".next-e2e/**", "e2e/**"],
    // One emulator, one database: files must not clear each other's data.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
})
