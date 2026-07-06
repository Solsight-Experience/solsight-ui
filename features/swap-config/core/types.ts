import type { ExecutorCapability, ExecutorKey } from "@/features/swap/types";

export type SwapConfigId = "slippage" | "priorityFee" | "tipFee" | "maxAutoFee" | "antiMev" | "gasless";

export interface Validation {
    level: "warn" | "error";
    message: string;
}

export interface LockResult {
    locked: boolean;
    forcedMode?: "auto" | "custom";
    reason?: string;
}

export interface SwapInfoSnapshot {
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

export interface TokenPair {
    quote: { mint: string; symbol: string; decimals: number; logoUri?: string | null };
    receive: { mint: string; symbol: string; decimals: number; logoUri?: string | null };
}

export interface ConfigCtx {
    swapInfo: SwapInfoSnapshot | undefined;
    pair: TokenPair | undefined;
    defaultSlippageBps?: number;
    // Cross-item read access. Implementations get a snapshot of all item states.
    getItemState: <T = unknown>(id: SwapConfigId) => T | undefined;
}

// Subset of swap submission DTO that items can contribute to.
export interface SwapRequestFragment {
    slippageBps?: number;
    priorityFeeLamports?: number;
    tipLamports?: number;
    maxAutoFeeLamports?: number;
    antiMevRpc?: "off" | "red" | "sec";
    gaslessFeeToken?: string; // mint address; when present, signals server to route through Kora
}
