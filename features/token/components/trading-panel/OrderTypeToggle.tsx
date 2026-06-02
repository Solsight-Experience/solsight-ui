"use client";

import { useTokenUIStore } from "../../stores/token.stores";

export function OrderTypeToggle() {
    const orderType = useTokenUIStore((s) => s.orderType);
    const setOrderType = useTokenUIStore((s) => s.setOrderType);

    return (
        <div className="flex gap-2 mb-4 text-sm">
            <button
                onClick={() => setOrderType("market")}
                className={`flex-1 py-2 px-3 rounded ${orderType === "market" ? "bg-[var(--surface-btn)] border-b-2 border-purple-500" : "bg-[var(--surface-btn)] text-[var(--text-muted)]"}`}
            >
                Market
            </button>
            <button
                onClick={() => setOrderType("limit")}
                className={`flex-1 py-2 px-3 rounded ${orderType === "limit" ? "bg-[var(--surface-btn)] border-b-2 border-purple-500" : "bg-[var(--surface-btn)] text-[var(--text-muted)]"}`}
            >
                Limit
            </button>
        </div>
    );
}
