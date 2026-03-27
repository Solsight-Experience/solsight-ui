import { useMemo, useRef, useState, useEffect } from "react";
import { formatDisplay, formatFromBaseUnits, fetchJupiterQuote, getSwapApiConfig, isValidAmount, toBaseUnits, formatInputValue } from "@/features/swap";
import type { SwapApiConfig } from "@/features/swap";

export interface QuoteState {
    loading: boolean;
    error: string | null;
    priceImpactPct: number | null;
    otherAmountThreshold: string | null;
    routeLabel: string | null;
    routeDetails: string[];
    routePathTokens: Array<{ display: string; full?: string }>;
    rawQuote: Record<string, unknown> | null;
}

const EMPTY_QUOTE_STATE: QuoteState = {
    loading: false,
    error: null,
    priceImpactPct: null,
    otherAmountThreshold: null,
    routeLabel: null,
    routeDetails: [],
    routePathTokens: [],
    rawQuote: null
};

export interface UseQuoteStateResult {
    quoteState: QuoteState;
    setQuoteState: React.Dispatch<React.SetStateAction<QuoteState>>;
    isLoading: boolean;
    error: string | null;
    priceImpactPct: number | null;
    priceImpactClass: "low" | "medium" | "high";
    otherAmountThreshold: string | null;
    routeLabel: string | null;
    routeDetails: string[];
    routePathTokens: Array<{ display: string; full?: string }>;
    rawQuote: Record<string, unknown> | null;
    formattedQuote: string;
    resetQuote: () => void;
}

interface QuoteFetchParams {
    orderType: "market" | "limit";
    payAmount: string;
    receiveAmount: string;
    payMint: string;
    receiveMint: string;
    slippageBps: number;
    payToken: string;
    receiveToken: string;
    swapConfig: SwapApiConfig;
    setPayAmount: (v: string) => void;
    setReceiveAmount: (v: string) => void;
}

export function useQuoteState(
    lastEdited: "pay" | "receive" | null,
    payDecimals: number,
    receiveDecimals: number,
    fetchParams: QuoteFetchParams
): UseQuoteStateResult {
    const [quoteState, setQuoteState] = useState<QuoteState>(EMPTY_QUOTE_STATE);

    const internalUpdateRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    const resetQuote = () => setQuoteState(EMPTY_QUOTE_STATE);

    const { orderType, payAmount, receiveAmount, payMint, receiveMint, slippageBps, payToken, receiveToken, swapConfig, setPayAmount, setReceiveAmount } =
        fetchParams;

    // Market quote fetching effect
    useEffect(() => {
        if (orderType === "limit") return;
        if (internalUpdateRef.current) {
            internalUpdateRef.current = false;
            return;
        }
        if (!lastEdited) {
            setQuoteState((prev) => ({
                ...prev,
                error: null,
                priceImpactPct: null,
                otherAmountThreshold: null,
                routeLabel: null,
                routeDetails: [],
                routePathTokens: [],
                rawQuote: null
            }));
            return;
        }
        const sourceAmount = lastEdited === "pay" ? payAmount : receiveAmount;
        if (!isValidAmount(sourceAmount)) {
            setQuoteState((prev) => ({
                ...prev,
                loading: false,
                error: null,
                priceImpactPct: null,
                otherAmountThreshold: null,
                routeLabel: null,
                routeDetails: [],
                routePathTokens: [],
                rawQuote: null
            }));
            if (lastEdited === "pay" && receiveAmount !== "") setReceiveAmount("");
            if (lastEdited === "receive" && payAmount !== "") setPayAmount("");
            return;
        }
        if (!payMint || !receiveMint) {
            setQuoteState((prev) => ({
                ...prev,
                loading: false,
                error: null,
                priceImpactPct: null,
                otherAmountThreshold: null,
                routeLabel: null,
                routeDetails: [],
                routePathTokens: [],
                rawQuote: null
            }));
            return;
        }
        const swapMode = lastEdited === "pay" ? "ExactIn" : "ExactOut";
        const amountBaseUnits = toBaseUnits(sourceAmount, swapMode === "ExactIn" ? payDecimals : receiveDecimals);
        if (!amountBaseUnits) return;
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setQuoteState((prev) => ({ ...prev, loading: true, error: null }));
        const timeoutId = window.setTimeout(async () => {
            try {
                const result = await fetchJupiterQuote(
                    { inputMint: payMint, outputMint: receiveMint, amount: amountBaseUnits, swapMode, slippageBps },
                    { signal: controller.signal, config: swapConfig, payTokenSymbol: payToken, receiveTokenSymbol: receiveToken }
                );
                const nextPay =
                    swapMode === "ExactOut" && result.inAmount ? formatInputValue(formatFromBaseUnits(result.inAmount, payDecimals), payDecimals) : null;
                const nextReceive =
                    swapMode === "ExactIn" && result.outAmount
                        ? formatInputValue(formatFromBaseUnits(result.outAmount, receiveDecimals), receiveDecimals)
                        : null;
                internalUpdateRef.current = true;
                if (nextPay !== null) setPayAmount(nextPay);
                if (nextReceive !== null) setReceiveAmount(nextReceive);
                setQuoteState({
                    loading: false,
                    error: null,
                    priceImpactPct: result.priceImpactPct,
                    otherAmountThreshold: result.otherAmountThreshold,
                    routeLabel: result.routeLabel,
                    routeDetails: result.routeDetails,
                    routePathTokens: result.routePathTokens,
                    rawQuote: result.rawQuote
                });
            } catch (error) {
                if ((error as Error).name === "AbortError") return;
                setQuoteState((prev) => ({ ...prev, loading: false, error: error instanceof Error ? error.message : "Quote failed" }));
            }
        }, 350);
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [
        lastEdited,
        payAmount,
        receiveAmount,
        payDecimals,
        receiveDecimals,
        payMint,
        receiveMint,
        slippageBps,
        swapConfig,
        setPayAmount,
        setReceiveAmount,
        payToken,
        receiveToken,
        orderType
    ]);

    const priceImpactClass = useMemo<"low" | "medium" | "high">(() => {
        if (quoteState.priceImpactPct === null) return "low";
        const pct = quoteState.priceImpactPct * 100;
        if (pct < 1) return "low";
        if (pct < 5) return "medium";
        return "high";
    }, [quoteState.priceImpactPct]);

    const formattedQuote = useMemo(() => {
        if (!quoteState.otherAmountThreshold) return "--";
        const value = formatFromBaseUnits(quoteState.otherAmountThreshold, lastEdited === "receive" ? payDecimals : receiveDecimals);
        return formatDisplay(value, lastEdited === "receive" ? payDecimals : receiveDecimals);
    }, [quoteState.otherAmountThreshold, lastEdited, payDecimals, receiveDecimals]);

    return {
        quoteState,
        setQuoteState,
        isLoading: quoteState.loading,
        error: quoteState.error,
        priceImpactPct: quoteState.priceImpactPct,
        priceImpactClass,
        otherAmountThreshold: quoteState.otherAmountThreshold,
        routeLabel: quoteState.routeLabel,
        routeDetails: quoteState.routeDetails,
        routePathTokens: quoteState.routePathTokens,
        rawQuote: quoteState.rawQuote,
        formattedQuote,
        resetQuote
    };
}
