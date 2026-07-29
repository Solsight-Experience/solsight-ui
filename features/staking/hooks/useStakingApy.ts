"use client";

import { useQuery } from "@tanstack/react-query";
import { getStakingApy, type StakingApyResponse } from "../lib/staking-api";

// Cluster-agnostic: the backend always sources this from mainnet, so it's
// fetched once regardless of whether the app is pointed at devnet or mainnet.
export function useStakingApy() {
    return useQuery<StakingApyResponse[]>({
        queryKey: ["staking-apy"],
        staleTime: 5 * 60_000,
        refetchInterval: 15 * 60_000,
        queryFn: () => getStakingApy()
    });
}
