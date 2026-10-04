import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    exclude: [
      "node_modules/**",
      ".next/**",
      ".next-e2e/**",
      ".next-emulators/**",
      "e2e/**",
      "e2e-emulators/**",
      // Need the Firestore emulator: `npm run test:firestore`.
      "**/*.emulator.test.ts",
    ],
    projects: [
      // Logic and data (`*.test.ts`) in Node: no browser to build for each
      // file. A test that needs one says `// @vitest-environment jsdom`.
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["**/*.test.ts"],
        },
      },
      // Components (`*.test.tsx`) in a browser of jsdom's.
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["**/*.test.tsx"],
        },
      },
    ],
  },
})
