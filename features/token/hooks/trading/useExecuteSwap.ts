"use client";

import { useMutation } from "@tanstack/react-query";
import { useConnection, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { executeJupiterSwap } from "@/features/swap";

export interface ExecuteSwapInput {
    quoteResponse: Record<string, unknown>;
    userPublicKey: string;
    gaslessFeeToken?: string;
}

export interface UseExecuteSwapParams {
    refreshBalancesAfterSwap: () => Promise<void>;
}

/** Returns true when the given error represents a wallet-level user rejection. */
export function isUserRejectionError(error: unknown): boolean {
    return error instanceof Error && error.name === "UserRejectedError";
}

/** TanStack mutation that executes a Jupiter swap and refreshes balances on success. */
export function useExecuteSwap({ refreshBalancesAfterSwap }: UseExecuteSwapParams) {
    const { signTransaction } = useAdapterWallet();
    const { connection } = useConnection();

    return useMutation<{ signature: string }, Error, ExecuteSwapInput>({
        mutationFn: async ({ quoteResponse, userPublicKey, gaslessFeeToken }) => {
            if (!signTransaction) {
                throw new Error("Wallet not connected");
            }
            try {
                return await executeJupiterSwap({
                    quoteResponse,
                    userPublicKey,
                    signTransaction,
                    connection,
                    gaslessFeeToken
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Swap failed";
                const isUserRejected = /user rejected|rejected the request|denied|cancelled/i.test(message);
                if (isUserRejected) {
                    const rejection = new Error("USER_REJECTED");
                    rejection.name = "UserRejectedError";
                    throw rejection;
                }
                throw error instanceof Error ? error : new Error(message);
            }
        },
        onSuccess: async () => {
            await refreshBalancesAfterSwap();
            toast.success("Swap submitted!");
        },
        onError: (error) => {
            if (error.name === "UserRejectedError") {
                toast.info("Transaction was cancelled in wallet.");
                return;
            }
            toast.error(error.message);
        }
    });
}
