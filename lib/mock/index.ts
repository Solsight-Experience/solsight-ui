import MockAdapter from "axios-mock-adapter";
import { axiosClient } from "../network-requests/api-client";

// Import mock handlers
import { setupPortfolioMocks } from "./handlers/portfolioHandlers";
import { setupTokenMockApi } from "./handlers/tokenHandlers";

let mockAdapter: MockAdapter | null = null;

export function setupMockAdapter() {
    // Only setup in browser (client-side)
    if (typeof window === "undefined") {
        return;
    }

    // Check if mock is enabled
    const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

    if (!isMockEnabled) {
        console.log("🔴 Mock adapter is disabled");
        return;
    } else {
        console.log("Mock adapter is enabled");
    }

    // Create mock adapter with delay to simulate network latency
    mockAdapter = new MockAdapter(axiosClient, {
        delayResponse: 50, // 50ms delay
        onNoMatch: "passthrough" // Pass through unmatched requests
    });

    console.log("🟢 Mock adapter enabled with 50ms delay");

    // Setup all mock handlers
    setupPortfolioMocks(mockAdapter);

    setupTokenMockApi(mockAdapter);

    // Add more mock handlers here as needed
    // setupTokenMocks(mockAdapter);
    // setupUserMocks(mockAdapter);

    console.log("✅ All mock handlers registered");

    return mockAdapter;
}

export function resetMockAdapter() {
    if (mockAdapter) {
        mockAdapter.reset();
        console.log("🔄 Mock adapter reset");
    }
}

export function disableMockAdapter() {
    if (mockAdapter) {
        mockAdapter.restore();
        mockAdapter = null;
        console.log("🔴 Mock adapter disabled");
    }
}

export function getMockAdapter() {
    return mockAdapter;
}

// Auto setup when module is imported (only in browser)
if (typeof window !== "undefined") {
    setupMockAdapter();
}

export default mockAdapter;
