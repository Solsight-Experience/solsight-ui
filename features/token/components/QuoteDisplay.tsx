import React from "react";
import type { QuoteState } from "../hooks/useQuoteState";

interface QuoteDisplayProps {
    quoteState: QuoteState;
    formattedQuote: string;
    lastEdited: "pay" | "receive" | null;
    validationError: string | null;
    swapError: string | null;
    swapSignature: string | null;
    onViewRoute: () => void;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({
    quoteState,
    formattedQuote,
    lastEdited,
    validationError,
    swapError,
    swapSignature,
    onViewRoute
}) => {
    return (
        <div className="mb-4 text-sm bg-gray-800/50 rounded-lg p-3 border border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-gray-300">
                <span className="text-gray-400">Price Impact</span>
                <span className="font-semibold">{quoteState.priceImpactPct === null ? "--" : `${(quoteState.priceImpactPct * 100).toFixed(2)}%`}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
                <span className="text-gray-400">{lastEdited === "receive" ? "Maximum Paid" : "Minimum Received"}</span>
                <span className="font-semibold">{formattedQuote}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
                <span className="text-gray-400">Route</span>
                <span className="flex items-center gap-2">
                    <span>{quoteState.routeLabel ?? "--"}</span>
                    {quoteState.routePathTokens.length > 0 && (
                        <button type="button" onClick={onViewRoute} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                            View route details
                        </button>
                    )}
                </span>
            </div>
            {quoteState.routeDetails.length > 0 && (
                <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">{quoteState.routeDetails.join(" → ")}</div>
            )}
            {quoteState.loading && <div className="mt-2 text-xs text-yellow-400 font-medium">Fetching quote...</div>}
            {quoteState.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {quoteState.error}</div>}
            {validationError && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {validationError}</div>}
            {swapError && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {swapError}</div>}
            {swapSignature && (
                <div className="mt-2 text-xs text-green-400">
                    Order submitted: {swapSignature.slice(0, 4)}...{swapSignature.slice(-4)}
                </div>
            )}
        </div>
    );
};
