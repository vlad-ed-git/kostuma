import { defineConfig, devices } from "@playwright/test"

const port = 3100
const ci = Boolean(process.env.CI)

// Runs against a production build: headers, CSP and rendering differ from
// `next dev`. The build goes to .next-e2e (E2E=1, see next.config.ts), so it
// never touches the .next folder of a running dev server.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  reporter: ci ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    // Kostuma is dark only: tests run with a light system theme to prove it.
    colorScheme: "light",
    // The film never stops moving (grain, fog, light leaks). Headless
    // Chromium draws that without a GPU, which costs about a CPU core per
    // idle home page (measured) and starved parallel runs. Tests check
    // behavior with the loops stilled; those about motion opt back in
    // (`reducedMotion: "no-preference"`).
    reducedMotion: "reduce",
  },
  projects: [
    // Fills the image optimizer's cache before the tests (e2e/warm-up.setup.ts).
    { name: "warm-up", testMatch: /warm-up\.setup\.ts$/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["warm-up"],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      dependencies: ["warm-up"],
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}`,
    env: {
      E2E: "1",
      SITE_URL: `http://localhost:${port}`,
      // The Fitting Room's fake renders, quick.
      FAKE_RENDER_MS: "400",
      // Google's public test key: its box always passes, on any domain.
      RECAPTCHA_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
    },
    reuseExistingServer: !ci,
    timeout: 180_000,
  },
})
