import "server-only"

import { fakeProvider } from "./fake-provider"
import type * as Renderer from "./renderer"

/**
 * The renders of the e2e test build only (E2E=1, see next.config.ts): always
 * the fake, whatever .env says. A test never spends a unit.
 */
export const renderProvider: typeof Renderer.renderProvider = () => fakeProvider
