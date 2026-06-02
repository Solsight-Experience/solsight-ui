"use client";

import { useMemo } from "react";
import { parseInputNumber } from "@/features/swap";
import type { TradeMode } from "../../types/token.types";

export interface UseTradeValidationParams {
    connected: boolean;
    publicKey: string | null;
    balancesLoading: boolean;
    positionsError: unknown;
    tradeMode: TradeMode;
    selectedBuyPayToken: { mint: string } | null;
    selectedSellReceiveToken: { mint: string } | null;
    lastEdited: "pay" | "receive" | null;
    payAmount: string;
    receiveAmount: string;
    payBalance: string;
}

export function useTradeValidation(params: UseTradeValidationParams): { error: string | null } {
    const {
        connected,
        publicKey,
        balancesLoading,
        positionsError,
        tradeMode,
        selectedBuyPayToken,
        selectedSellReceiveToken,
        lastEdited,
        payAmount,
        receiveAmount,
        payBalance
    } = params;

    return useMemo(() => {
        if (!connected || !publicKey) return { error: null };
        if (balancesLoading || positionsError) return { error: null };
        if (tradeMode === "buy" && !selectedBuyPayToken) return { error: "You cannot swap because you have insufficient funds." };
        if (tradeMode === "sell" && !selectedSellReceiveToken) return { error: "You cannot swap because you have insufficient funds." };

        const payValue = parseInputNumber(payAmount);
        const receiveValue = parseInputNumber(receiveAmount);
        const payBalanceValue = parseInputNumber(payBalance);

        if (lastEdited === "pay") {
            if (!payAmount) return { error: null };
            if (payValue <= 0) return { error: "Amount must be greater than 0." };
            if (payValue > payBalanceValue) return { error: "Insufficient balance." };
            return { error: null };
        }

        if (lastEdited === "receive") {
            if (!receiveAmount) return { error: null };
            if (receiveValue <= 0) return { error: "Amount must be greater than 0." };
            if (payAmount && payValue > payBalanceValue) return { error: "Insufficient balance." };
            return { error: null };
        }

        return { error: null };
    }, [
        connected,
        publicKey,
        balancesLoading,
        positionsError,
        tradeMode,
        selectedBuyPayToken,
        selectedSellReceiveToken,
        lastEdited,
        payAmount,
        receiveAmount,
        payBalance
    ]);
}
