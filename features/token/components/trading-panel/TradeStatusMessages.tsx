"use client";

import { useTokenUIStore } from "../../stores/token.stores";

export interface TradeStatusMessagesProps {
    validationError: string | null;
    swapError: string | null;
    swapSignature: string | null;
}

export function TradeStatusMessages({ validationError, swapError, swapSignature }: TradeStatusMessagesProps) {
    const orderType = useTokenUIStore((s) => s.orderType);

    if (orderType !== "limit") return null;

    return (
        <div className="mb-4 text-sm space-y-2">
            {validationError && <div className="text-xs text-red-500 dark:text-red-400 font-semibold">✕ {validationError}</div>}
            {swapError && <div className="text-xs text-red-500 dark:text-red-400 font-semibold">✕ {swapError}</div>}
            {swapSignature && (
                <div className="text-xs text-green-600 dark:text-green-400">
                    Order submitted: {swapSignature.slice(0, 4)}...{swapSignature.slice(-4)}
                </div>
            )}
        </div>
    );
}
