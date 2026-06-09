"use client";

import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getStakingConnection } from "./useIFProgram";

export function useSolBalance(walletPubkey?: string) {
    return useQuery<number>({
        queryKey: ["sol-balance", walletPubkey],
        enabled: !!walletPubkey,
        staleTime: 15_000,
        queryFn: async () => {
            if (!walletPubkey) return 0;
            const lamports = await getStakingConnection().getBalance(new PublicKey(walletPubkey));
            return lamports / LAMPORTS_PER_SOL;
        }
    });
}

export const useDevnetSolBalance = useSolBalance;
