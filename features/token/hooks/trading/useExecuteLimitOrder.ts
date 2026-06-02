"use client";

import { useMutation } from "@tanstack/react-query";
import { useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { LimitOrderService, type CreateLimitOrderRequest } from "@/features/limit-orders";
import { toBaseUnits } from "@/features/swap";

export interface ExecuteLimitOrderInput {
    payAmount: string;
    receiveAmount: string;
    payDecimals: number;
    receiveDecimals: number;
    payMint: string;
    receiveMint: string;
    walletAddress: string;
    slippageBps: number;
}

/**
 * Mutation hook for placing a limit order via Jupiter.
 * Wraps LimitOrderService.createSignAndExecuteOrder and surfaces toast feedback.
 *
 * Pre-checks (wallet connected, valid limit price, non-empty amounts) are caller-owned;
 * the shell guards the call site before invoking `mutate`.
 */
export function useExecuteLimitOrder() {
    const { signTransaction } = useAdapterWallet();

    return useMutation<{ signature: string; order: string; requestId: string }, Error, ExecuteLimitOrderInput>({
        mutationFn: async ({ payAmount, receiveAmount, payDecimals, receiveDecimals, payMint, receiveMint, walletAddress, slippageBps }) => {
            if (!signTransaction) {
                throw new Error("Wallet not connected");
            }

            const makingAmount = toBaseUnits(payAmount, payDecimals);
            const takingAmount = toBaseUnits(receiveAmount, receiveDecimals);
            if (!makingAmount || !takingAmount) {
                throw new Error("Invalid amounts");
            }
            if (!walletAddress) {
                throw new Error("Wallet address not available");
            }

            const request: CreateLimitOrderRequest = {
                inputMint: payMint,
                outputMint: receiveMint,
                maker: walletAddress,
                payer: walletAddress,
                params: {
                    makingAmount,
                    takingAmount,
                    slippageBps: slippageBps.toString()
                },
                computeUnitPrice: "auto",
                wrapAndUnwrapSol: true
            };

            return LimitOrderService.createSignAndExecuteOrder({ request, signTransaction });
        },
        onSuccess: () => {
            toast.success("Limit order created!");
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to create limit order";
            toast.error(message);
        }
    });
}
