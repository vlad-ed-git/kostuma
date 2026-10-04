import { defineConfig, devices } from "@playwright/test"

const port = 3200
const emulators = "127.0.0.1"

/**
 * The real accounts, end to end, against the local Firebase emulators
 * (`npm run test:emulators` starts them): registering, signing in with a
 * password and with Google, the session, My Pumpkin Basket following the
 * account live, signing out. Local only (owner): never in CI. Nothing here
 * can reach the real project: a `demo-` project, and every SDK pointed at
 * the emulators.
 */
export default defineConfig({
  testDir: "./e2e-emulators",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${port}`,
    colorScheme: "light",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 240_000,
    env: {
      E2E: "emulators",
      SITE_URL: `http://localhost:${port}`,
      NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: emulators,
      FIREBASE_AUTH_EMULATOR_HOST: `${emulators}:9099`,
      FIRESTORE_EMULATOR_HOST: `${emulators}:8085`,
      NEXT_PUBLIC_projectId: "demo-kostuma",
      NEXT_PUBLIC_apiKey: "demo-key",
      NEXT_PUBLIC_authDomain: "demo-kostuma.firebaseapp.com",
      NEXT_PUBLIC_appId: "demo-app",
      // The Fitting Room open, so the pages read the free costume; nothing
      // here starts a try-on, so YouCam is never called.
      YOUCAM_API_GENERATED_KEY: "emulators-never-called",
      // Google's public test keys: the box always passes, on any domain.
      RECAPTCHA_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
      RECAPTCHA_SECRET_KEY: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe",
    },
  },
})
