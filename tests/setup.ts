import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.solana for Phantom wallet
Object.defineProperty(window, "solana", {
    value: {
        isPhantom: true,
        connect: vi.fn().mockResolvedValue({
            publicKey: {
                toString: () => "mock-public-key-12345678901234567890123456789012"
            }
        }),
        disconnect: vi.fn().mockResolvedValue({})
    },
    writable: true
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
Object.defineProperty(window, "localStorage", {
    value: localStorageMock
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));
