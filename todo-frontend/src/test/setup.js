import { vi } from "vitest"

global.confirm = vi.fn()
global.alert = vi.fn()

global.console = {
    ...console,
    error: vi.fn(),
}

Object.defineProperty(window, "location", {
    value: { href: "http://localhost:3001" },
})
