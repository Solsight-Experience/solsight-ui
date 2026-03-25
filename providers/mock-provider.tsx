"use client";

import { useEffect, useState } from "react";

export function MockProvider({ children }: { children: React.ReactNode }) {
    const [mockReady, setMockReady] = useState(false);

    useEffect(() => {
        // Only setup mock in browser
        const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

        if (isMockEnabled) {
            // Dynamic import mock setup
            import("@/lib/mock")
                .then(() => {
                    console.log("✅ Mock provider initialized");
                    setMockReady(true);
                })
                .catch((error) => {
                    console.error("❌ Failed to initialize mock:", error);
                    setMockReady(true); // Continue anyway
                });
        } else {
            setMockReady(true);
        }
    }, []);

    // Optionally show loading state while mock is setting up
    // if (!mockReady) {
    //   return <div>Loading...</div>;
    // }

    return <>{children}</>;
}

export default MockProvider;
