"use client";

import { useTokenUIStore } from "../../stores/token.stores";

export interface QuoteSummaryProps {
    formattedQuote: string; // "--" or numeric string
    lastEdited: "pay" | "receive" | null;
    priceImpactPct: number | null;
    routeLabel: string | null;
    routePathTokens: Array<{ display: string; full?: string }>;
    routeDetails: string[];
    quoteLoading: boolean;
    quoteError: string | null;
    validationError: string | null;
    swapError: string | null;
    swapSignature: string | null;
    onOpenRouteDetails: () => void;
}

export function QuoteSummary({
    formattedQuote,
    lastEdited,
    priceImpactPct,
    routeLabel,
    routePathTokens,
    routeDetails,
    quoteLoading,
    quoteError,
    validationError,
    swapError,
    swapSignature,
    onOpenRouteDetails
}: QuoteSummaryProps) {
    const orderType = useTokenUIStore((s) => s.orderType);

    if (orderType !== "market") return null;

    return (
        <div className="mb-4 text-sm bg-[var(--surface-btn)] rounded-lg p-3 border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span className="text-[var(--text-muted)]">Price Impact</span>
                <span className="font-semibold">{priceImpactPct === null ? "--" : `${(priceImpactPct * 100).toFixed(2)}%`}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span className="text-[var(--text-muted)]">{lastEdited === "receive" ? "Maximum Paid" : "Minimum Received"}</span>
                <span className="font-semibold">{formattedQuote}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span className="text-[var(--text-muted)]">Route</span>
                <span className="flex items-center gap-2">
                    <span>{routeLabel ?? "--"}</span>
                    {routePathTokens.length > 0 && (
                        <button
                            type="button"
                            onClick={onOpenRouteDetails}
                            className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors"
                        >
                            View route details
                        </button>
                    )}
                </span>
            </div>
            {routeDetails.length > 0 && (
                <div className="mt-2 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2">{routeDetails.join(" → ")}</div>
            )}
            {quoteLoading && <div className="mt-2 text-xs text-yellow-400 font-medium">Fetching quote...</div>}
            {quoteError && <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold">✕ {quoteError}</div>}

            {validationError && <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold">✕ {validationError}</div>}
            {swapError && <div className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold">✕ {swapError}</div>}
            {swapSignature && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    Order submitted: {swapSignature.slice(0, 4)}...{swapSignature.slice(-4)}
                </div>
            )}
        </div>
    );
}
