"use client";

import { useQuery } from "@tanstack/react-query";
import { IF_CONFIG } from "../constants/program";
import { getStakingPosition, type StakingFundSnapshot } from "../lib/staking-api";

export interface IFPosition {
    ifShares: string;
    totalShares: string;
    vaultJitoTokenUnits: string;
    estimatedSol: number;
    lastWithdrawRequestShares: string;
    /** Estimated current value of pending request based on current pool ratio */
    lastWithdrawRequestValue: number;
    lastWithdrawRequestTs: number;
    cooldownEndsAt: number;
    canWithdraw: boolean;
    unstakingPeriod: number;
    fund: StakingFundSnapshot;
}

export function useIFPositions(connected: boolean, walletPubkey: string | null) {
    return useQuery<IFPosition | null>({
        queryKey: ["if-position", walletPubkey],
        enabled: !!walletPubkey && connected && IF_CONFIG.isEnabled,
        staleTime: 30_000,
        refetchInterval: 60_000,
        queryFn: async (): Promise<IFPosition | null> => {
            if (!walletPubkey) return null;
            return getStakingPosition(walletPubkey);
        }
    });
}
