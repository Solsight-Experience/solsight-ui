"use client";

import { useEffect } from "react";
import { formatInputValue, parseInputNumber } from "@/features/swap";
import type { TradeMode } from "../../types/token.types";
import { useTokenUIStore } from "../../stores/token.stores";

export interface UseLimitOrderRecalcParams {
    payDecimals: number;
    receiveDecimals: number;
    payMint: string;
    receiveMint: string;
    tradeMode: TradeMode;
    lastEdited: "pay" | "receive" | null;
    solPriceUsd: number | null;
    internalUpdateRef: React.RefObject<boolean>;
}

/**
 * Recalculates pay/receive amounts when in "limit" order mode based on the
 * user-supplied USD-per-token limit price.
 *
 * Math derivation (preserved from the original TradingPanel effect):
 *   The user inputs `limitPrice` in USD per token.
 *   What we really need is: how many receive tokens per pay token.
 *   Assumption: we are trading SOL vs Token (SOL is the quote currency).
 *     - If tradeMode === "buy",  payToken = SOL,   receiveToken = Token.
 *     - If tradeMode === "sell", payToken = Token, receiveToken = SOL.
 *   They input `limitPrice` as USD per Token. They spend `payAmount`.
 *     1 Token = `limitPrice` USD.
 *     1 SOL   = `solPriceUsd` USD.
 *     => 1 Token = (limitPrice / solPriceUsd) SOL.
 *   tokensReceived = payAmount(SOL) / (limitPrice / solPriceUsd)
 *                  = payAmount * solPriceUsd / limitPrice.
 *
 * For non-SOL pairs we fall back to the same ratio, which is approximate
 * (kept for parity with the existing implementation; out of scope to fix here).
 *
 * `payMint` and `receiveMint` are intentionally kept in the dep array even
 * though their values aren't read inside the effect — they cause a re-fire
 * when the trading pair changes so amounts get recomputed for the new pair.
 */
export function useLimitOrderRecalc(params: UseLimitOrderRecalcParams): void {
    const { payDecimals, receiveDecimals, payMint, receiveMint, tradeMode, lastEdited, solPriceUsd, internalUpdateRef } = params;

    const orderType = useTokenUIStore((s) => s.orderType);
    const limitPrice = useTokenUIStore((s) => s.limitPrice);
    const payAmount = useTokenUIStore((s) => s.payAmount);
    const receiveAmount = useTokenUIStore((s) => s.receiveAmount);
    const setPayAmount = useTokenUIStore((s) => s.setPayAmount);
    const setReceiveAmount = useTokenUIStore((s) => s.setReceiveAmount);

    useEffect(() => {
        if (orderType !== "limit" || !limitPrice || !solPriceUsd) return;

        const priceUsd = parseInputNumber(limitPrice);
        if (priceUsd <= 0) return;

        // This logic assumes we are always pairing with SOL as the quote currency.
        // Fallback simple relation if it's not a SOL pair (might not be accurate
        // for Token-Token without USD value of pay token).
        const effectiveSolPrice = solPriceUsd || 1;

        if (lastEdited === "receive") {
            const amountReceive = parseInputNumber(receiveAmount);
            if (amountReceive > 0) {
                let calculatedPay = 0;
                if (tradeMode === "buy") {
                    calculatedPay = (amountReceive * priceUsd) / effectiveSolPrice;
                } else {
                    calculatedPay = (amountReceive * effectiveSolPrice) / priceUsd;
                }

                const newPay = formatInputValue(calculatedPay.toString(), payDecimals);
                if (newPay !== payAmount) {
                    internalUpdateRef.current = true;
                    setPayAmount(newPay);
                }
            } else {
                if (payAmount !== "") {
                    internalUpdateRef.current = true;
                    setPayAmount("");
                }
            }
        } else {
            const amountPay = parseInputNumber(payAmount);
            if (amountPay > 0) {
                let calculatedReceive = 0;
                if (tradeMode === "buy") {
                    calculatedReceive = (amountPay * effectiveSolPrice) / priceUsd;
                } else {
                    calculatedReceive = (amountPay * priceUsd) / effectiveSolPrice;
                }

                const newReceive = formatInputValue(calculatedReceive.toString(), receiveDecimals);
                if (newReceive !== receiveAmount) {
                    internalUpdateRef.current = true;
                    setReceiveAmount(newReceive);
                }
            } else {
                if (receiveAmount !== "") {
                    internalUpdateRef.current = true;
                    setReceiveAmount("");
                }
            }
        }
    }, [
        limitPrice,
        payAmount,
        receiveAmount,
        orderType,
        receiveDecimals,
        payDecimals,
        lastEdited,
        setPayAmount,
        setReceiveAmount,
        solPriceUsd,
        tradeMode,
        payMint,
        receiveMint,
        internalUpdateRef
    ]);
}
