import axios from "axios";
import { VersionedTransaction } from "@solana/web3.js";
import { apiClient } from "@/lib/network-requests/api-client";
import { SWAP_ENDPOINTS } from "@/lib/constants";
import type { ExecuteSwapRequest, ExecuteSwapResult, QuoteRequest, QuoteResult, SwapInfoResponse } from "./types";
import { buildRoutePathTokens, getRouteDetails } from "./utils";

export async function fetchJupiterQuote(
    request: QuoteRequest,
    opts?: {
        signal?: AbortSignal;
        payTokenSymbol?: string;
        receiveTokenSymbol?: string;
    }
): Promise<QuoteResult> {
    try {
        const payload = await apiClient.get<Record<string, unknown>>(SWAP_ENDPOINTS.QUOTE, {
            params: {
                inputMint: request.inputMint,
                outputMint: request.outputMint,
                amount: request.amount,
                swapMode: request.swapMode,
                slippageBps: request.slippageBps
            },
            signal: opts?.signal
        });

        const routeDetails = getRouteDetails(payload.routePlan);
        const routePlanLength = Array.isArray(payload.routePlan) ? payload.routePlan.length : 0;

        return {
            rawQuote: payload,
            priceImpactPct: payload.priceImpactPct ? Number(payload.priceImpactPct) : null,
            otherAmountThreshold: payload.otherAmountThreshold ? String(payload.otherAmountThreshold) : null,
            routeLabel: routePlanLength ? `${routePlanLength} hops` : "--",
            routeDetails,
            routePathTokens: buildRoutePathTokens(
                payload.routePlan,
                request.inputMint,
                request.outputMint,
                opts?.payTokenSymbol ?? "SOL",
                opts?.receiveTokenSymbol ?? "TOKEN"
            ),
            inAmount: payload.inAmount ? String(payload.inAmount) : null,
            outAmount: payload.outAmount ? String(payload.outAmount) : null
        };
    } catch (error) {
        if (axios.isCancel(error)) {
            throw Object.assign(new Error("Aborted"), { name: "AbortError" });
        }
        const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Quote failed. Please try again.";
        throw new Error(message);
    }
}

export async function executeJupiterSwap(request: ExecuteSwapRequest): Promise<ExecuteSwapResult> {
    const txData = await apiClient.post<{ swapTransaction: string }>(SWAP_ENDPOINTS.TRANSACTION, {
        quoteResponse: request.quoteResponse,
        userPublicKey: request.userPublicKey,
        ...(request.gaslessFeeToken ? { gaslessFeeToken: request.gaslessFeeToken } : {})
    });

    if (!txData.swapTransaction) {
        throw new Error("Missing swap transaction.");
    }

    const tx = VersionedTransaction.deserialize(base64ToBytes(txData.swapTransaction));
    const signed = await request.signTransaction(tx);
    const signedTxBase64 = Buffer.from(signed.serialize()).toString("base64");

    const result = await apiClient.post<{ signature: string }>(SWAP_ENDPOINTS.EXECUTE, {
        signedTransaction: signedTxBase64,
        ...(request.gaslessFeeToken ? { gaslessFeeToken: request.gaslessFeeToken } : {})
    });

    return { signature: result.signature };
}

export function mapQuoteError(payload: unknown): string {
    const normalizedPayload = payload as { errorCode?: string; error?: string; message?: string } | undefined;
    const code = normalizedPayload?.errorCode;
    if (code === "TOKEN_NOT_TRADABLE") {
        return "This token is not tradable on Jupiter.";
    }
    if (normalizedPayload?.message) return String(normalizedPayload.message);
    if (normalizedPayload?.error) return String(normalizedPayload.error);
    return "Quote failed. Please try again.";
}

export function mapSwapError(message: string, swapUrl: string, quoteUrl: string): string {
    const normalized = message.toLowerCase();
    if (normalized.includes("access forbidden") || normalized.includes('"code": 403') || normalized.includes("code: 403")) {
        return "Swap failed: RPC endpoint rejected the request (403). Configure a valid mainnet RPC endpoint.";
    }
    if (normalized.includes("address table account that doesn't exist")) {
        const endpoint = isPublicJupiterApi(swapUrl) || isPublicJupiterApi(quoteUrl) ? "Jupiter mainnet API" : "current swap API";
        return `Swap failed: RPC network mismatch for ${endpoint}. Please use Solana mainnet RPC.`;
    }
    return message;
}

function isPublicJupiterApi(url: string): boolean {
    return url.toLowerCase().includes("jup.ag");
}

function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export async function getSwapInfo(params: { inputMint: string; outputMint: string }): Promise<SwapInfoResponse> {
    return apiClient.get<SwapInfoResponse>(SWAP_ENDPOINTS.INFO, {
        params: {
            inputMint: params.inputMint,
            outputMint: params.outputMint
        }
    });
}
