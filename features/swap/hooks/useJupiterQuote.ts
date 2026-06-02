"use client";

import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchJupiterQuote } from "../jupiter";
import type { QuoteResult, SwapMode } from "../types";

export interface UseJupiterQuoteParams {
    inputMint: string | null | undefined;
    outputMint: string | null | undefined;
    amount: string;
    swapMode: SwapMode;
    slippageBps: number;
    payTokenSymbol?: string;
    receiveTokenSymbol?: string;
    enabled?: boolean;
}

export function useJupiterQuote(params: UseJupiterQuoteParams): UseQueryResult<QuoteResult, Error> {
    const { inputMint, outputMint, amount, swapMode, slippageBps, payTokenSymbol, receiveTokenSymbol, enabled = true } = params;

    return useQuery<QuoteResult, Error>({
        queryKey: ["jupiter-quote", inputMint ?? null, outputMint ?? null, amount, swapMode, slippageBps],
        queryFn: ({ signal }) =>
            fetchJupiterQuote(
                {
                    inputMint: inputMint as string,
                    outputMint: outputMint as string,
                    amount,
                    swapMode,
                    slippageBps
                },
                { signal, payTokenSymbol, receiveTokenSymbol }
            ),
        enabled: enabled && !!inputMint && !!outputMint && amount.length > 0 && amount !== "0",
        placeholderData: keepPreviousData,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false
    });
}
