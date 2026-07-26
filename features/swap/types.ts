import type { VersionedTransaction } from "@solana/web3.js";

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
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
    gaslessFeeToken?: string;
    antiMevRpc?: "off" | "sec";
    priorityFeeLamports?: number;
    tipLamports?: number;
    maxAutoFeeLamports?: number;
}

export interface JupiterDynamicSlippageReport {
    slippageBps?: number;
    otherAmount?: number;
    simulatedIncurredSlippageBps?: number;
    amplificationRatio?: string;
}

export interface TransactionSwapResponse {
    swapTransaction: string;
    lastValidBlockHeight: number;
    prioritizationFeeLamports?: number;
    dynamicSlippageReport?: JupiterDynamicSlippageReport;
}

export interface ExecuteSwapResult {
    signature: string;
    lastValidBlockHeight: number;
    /** Base64 of the transaction we signed — the client reads its recentBlockhash to confirm. */
    signedTransaction: string;
}

export enum ExecutorCapability {
    Gasless = "gasless",
    MevProtection = "mevProtection"
}

export type ExecutorKey = "jupiter" | "solsight";

export interface SwapInfoResponse {
    autoPriorityFeeLamports: number;
    autoTipLamports: number;
    autoSlippageBps: number | null;
    maxAutoFeeLamports: number;
    executorKey: ExecutorKey;
    capabilities: ExecutorCapability[];
    gaslessEnabled: boolean;
    gaslessSupportedTokens: string[];
    payerPubkey: string | null;
}
