export type SwapMode = "ExactIn" | "ExactOut";

export interface RouteHopToken {
    display: string;
    full?: string;
}

export interface QuoteRequest {
    inputMint: string;
    outputMint: string;
    amount: string;
    swapMode: SwapMode;
    slippageBps: number;
}

export interface QuoteResult {
    rawQuote: Record<string, unknown>;
    priceImpactPct: number | null;
    otherAmountThreshold: string | null;
    routeLabel: string;
    routeDetails: string[];
    routePathTokens: RouteHopToken[];
    inAmount: string | null;
    outAmount: string | null;
}

export interface ExecuteSwapRequest {
    quoteResponse: Record<string, unknown>;
    userPublicKey: string;
    signTransaction: (tx: unknown) => Promise<{ serialize(): Uint8Array }>;
}

export interface ExecuteSwapResult {
    signature: string;
}

export interface SwapApiConfig {
    quoteBaseUrl: string;
    swapBaseUrl: string;
    quoteApiKey?: string;
}
