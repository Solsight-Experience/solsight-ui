"use client";

import { useEffect } from "react";
import { formatFromBaseUnits, formatInputValue } from "@/features/swap";
import type { QuoteResult } from "@/features/swap/types";
import { useTokenUIStore } from "../../stores/token.stores";

export interface UseQuoteFieldSyncParams {
    quoteData: QuoteResult | undefined;
    swapMode: "ExactIn" | "ExactOut";
    payDecimals: number;
    receiveDecimals: number;
    /** Suppression flag — set to true BEFORE we write back, so the source-of-truth effect skips its next run */
    internalUpdateRef: React.RefObject<boolean>;
    /** True only while market-mode quote sync is active. When false, we should NOT write back. */
    enabled: boolean;
}

export function useQuoteFieldSync(params: UseQuoteFieldSyncParams): void {
    const { quoteData, swapMode, payDecimals, receiveDecimals, internalUpdateRef, enabled } = params;
    const setPayAmount = useTokenUIStore((s) => s.setPayAmount);
    const setReceiveAmount = useTokenUIStore((s) => s.setReceiveAmount);

    useEffect(() => {
        if (!enabled) return;
        if (!quoteData) return;

        const nextPay =
            swapMode === "ExactOut" && quoteData.inAmount ? formatInputValue(formatFromBaseUnits(quoteData.inAmount, payDecimals), payDecimals) : null;
        const nextReceive =
            swapMode === "ExactIn" && quoteData.outAmount ? formatInputValue(formatFromBaseUnits(quoteData.outAmount, receiveDecimals), receiveDecimals) : null;

        if (nextPay !== null) {
            internalUpdateRef.current = true;
            setPayAmount(nextPay);
        }
        if (nextReceive !== null) {
            internalUpdateRef.current = true;
            setReceiveAmount(nextReceive);
        }
        // Effect runs whenever quoteData identity changes — useQuery returns a stable
        // reference for unchanged data thanks to placeholderData: keepPreviousData.
    }, [quoteData, swapMode, payDecimals, receiveDecimals, enabled, internalUpdateRef, setPayAmount, setReceiveAmount]);
}
