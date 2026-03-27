import { apiClient } from "@/lib/api-client";
import { QuoteRequest, QuoteResult, ExecuteSwapRequest, ExecuteSwapResult } from "../types";

export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoUri?: string | null;
}

export interface QuoteParams {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
}

export interface QuoteResponse {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    [key: string]: unknown;
}

export interface SwapParams {
    quoteResponse: QuoteResponse;
    userPublicKey: string;
    [key: string]: unknown;
}

export interface SwapResponse {
    swapTransaction: string;
    [key: string]: unknown;
}

export class SwapService {
    static async getSolPrice(): Promise<{ price: number; currency: string; cached_at: string }> {
        return apiClient.get("/api/v1/tokens/prices/sol");
    }

    static async getTokenInfo(address: string): Promise<TokenInfo> {
        return apiClient.get(`/api/v1/tokens/${address}/info`);
    }

    static async getQuote(params: QuoteParams): Promise<QuoteResponse> {
        return apiClient.get("/api/v1/tokens/swap/quote", { params });
    }

    static async executeSwap(params: SwapParams): Promise<SwapResponse> {
        return apiClient.post("/api/v1/tokens/swap/execute", params);
    }
}
