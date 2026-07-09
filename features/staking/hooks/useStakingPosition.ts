"use client";

import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IF_CONFIG, IF_MIN_STAKE_SOL, NATIVE_STAKE_PAGE_SIZE } from "../constants/program";
import { getStakingPosition, getStakingValidators, type StakingPositionResponse, type StakingValidatorResponse } from "../lib/staking-api";
import { getStakingConnection } from "./useIFProgram";

export type { LiquidPositionResponse, NativeStakeAccountResponse, NativeStakePositionsPage, NativeStakeStatus } from "../lib/staking-api";

export function useStakingPosition(connected: boolean, walletPubkey: string | null, nativePage: number = 1, nativePageSize: number = NATIVE_STAKE_PAGE_SIZE) {
    return useQuery<StakingPositionResponse>({
        queryKey: ["staking-position", walletPubkey, nativePage, nativePageSize],
        enabled: !!walletPubkey && connected && IF_CONFIG.isEnabled,
        staleTime: 15_000,
        refetchInterval: 30_000,
        queryFn: async (): Promise<StakingPositionResponse> => {
            if (!walletPubkey) return { liquid: null, native: { items: [], total: 0, page: nativePage, pageSize: nativePageSize } };
            return getStakingPosition(walletPubkey, nativePage, nativePageSize);
        }
    });
}

export function useStakingValidators() {
    return useQuery<StakingValidatorResponse[]>({
        queryKey: ["staking-validators"],
        enabled: IF_CONFIG.isEnabled,
        staleTime: 5 * 60_000,
        queryFn: () => getStakingValidators()
    });
}

/**
 * The native Stake program rejects DelegateStake below the cluster's minimum
 * delegation (custom program error 0xc). That minimum is a cluster-level
 * runtime setting, not a constant, so fetch it instead of hardcoding it.
 */
export function useStakeMinimumDelegation() {
    return useQuery<number>({
        queryKey: ["stake-minimum-delegation", IF_CONFIG.network],
        enabled: IF_CONFIG.isEnabled,
        staleTime: 30 * 60_000,
        retry: 1,
        placeholderData: IF_MIN_STAKE_SOL,
        queryFn: async () => {
            const { value: lamports } = await getStakingConnection().getStakeMinimumDelegation();
            return lamports / LAMPORTS_PER_SOL;
        }
    });
}
