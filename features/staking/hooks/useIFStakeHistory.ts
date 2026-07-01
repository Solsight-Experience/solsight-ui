"use client";

import { useQuery } from "@tanstack/react-query";
import { IF_CONFIG } from "../constants/program";
import { getStakingHistory, type StakeActionType, type StakeHistoryRecord, type StakeRecordStatus, type StakingHistoryResponse } from "../lib/staking-api";

export type { StakeActionType, StakeRecordStatus };
export type StakeRecord = StakeHistoryRecord;

export function useIFStakeHistory(walletPubkey: string | null, before: string | null, pageSize: number) {
    return useQuery<StakingHistoryResponse>({
        queryKey: ["if-stake-history", walletPubkey, before, pageSize],
        enabled: !!walletPubkey && IF_CONFIG.isEnabled,
        staleTime: 120_000,
        queryFn: async (): Promise<StakingHistoryResponse> => {
            if (!walletPubkey) return { records: [], nextCursor: null };
            return getStakingHistory(walletPubkey, before, pageSize);
        }
    });
}
