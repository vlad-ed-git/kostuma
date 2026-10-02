// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const mocks = vi.hoisted(() => ({
  apps: [] as unknown[],
  initializeApp: vi.fn(),
  cert: vi.fn(),
  getAuth: vi.fn(),
}))

vi.mock("firebase-admin/app", () => ({
  getApps: () => mocks.apps,
  initializeApp: mocks.initializeApp,
  cert: mocks.cert,
}))
vi.mock("firebase-admin/auth", () => ({ getAuth: mocks.getAuth }))
vi.mock("firebase-admin/firestore", () => ({ getFirestore: vi.fn() }))

const { adminAuth } = await import("./admin")

const credentials = [
  "FIREBASE_AUTH_EMULATOR_HOST",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "GOOGLE_APPLICATION_CREDENTIALS",
]

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_projectId", "kostuma-test")
  for (const name of credentials) vi.stubEnv(name, "")
  mocks.initializeApp.mockImplementation((options) => ({ options }))
  mocks.cert.mockImplementation((from) => ({ cert: from }))
})
afterEach(() => {
  mocks.apps = []
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe("adminAuth", () => {
  it("signs with the service account's email and key (Vercel)", () => {
    vi.stubEnv("FIREBASE_CLIENT_EMAIL", "admin@kostuma-test.iam.example")
    vi.stubEnv("FIREBASE_PRIVATE_KEY", "line one\\nline two")
    adminAuth()
    expect(mocks.cert).toHaveBeenCalledWith({
      projectId: "kostuma-test",
      clientEmail: "admin@kostuma-test.iam.example",
      // Line breaks stored as the two characters "\n" become real ones.
      privateKey: "line one\nline two",
    })
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      projectId: "kostuma-test",
      credential: { cert: expect.any(Object) },
    })
  })

  it("reads the key file as a service account, so tokens are signed locally", () => {
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "secrets/key.json")
    adminAuth()
    expect(mocks.cert).toHaveBeenCalledWith("secrets/key.json")
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      projectId: "kostuma-test",
      credential: { cert: "secrets/key.json" },
    })
  })

  it("needs no credentials against the emulators", () => {
    vi.stubEnv("FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099")
    adminAuth()
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      projectId: "kostuma-test",
    })
    expect(mocks.cert).not.toHaveBeenCalled()
  })

  it("makes the app once", () => {
    mocks.apps = [{ name: "[DEFAULT]" }]
    adminAuth()
    expect(mocks.initializeApp).not.toHaveBeenCalled()
    expect(mocks.getAuth).toHaveBeenCalledWith({ name: "[DEFAULT]" })
  })

  it("names what is missing, for developers", () => {
    expect(() => adminAuth()).toThrow(
      /FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY \(or GOOGLE_APPLICATION_CREDENTIALS\)/
    )
    vi.stubEnv("NEXT_PUBLIC_projectId", "")
    expect(() => adminAuth()).toThrow(/NEXT_PUBLIC_projectId is not set/)
    expect(mocks.initializeApp).not.toHaveBeenCalled()
  })
})
