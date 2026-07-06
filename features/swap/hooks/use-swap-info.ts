"use client";

import { useQuery } from "@tanstack/react-query";
import { useClusterStore } from "@/stores/cluster.store";
import { getSwapInfo } from "../jupiter";
import type { SwapInfoResponse } from "../types";

export function useSwapInfo(params: { inputMint: string | undefined | null; outputMint: string | undefined | null; enabled?: boolean }) {
    const { inputMint, outputMint, enabled = true } = params;
    const cluster = useClusterStore((state) => state.cluster);
    return useQuery<SwapInfoResponse>({
        queryKey: ["swap-info", cluster, inputMint, outputMint],
        queryFn: () => getSwapInfo({ inputMint: inputMint!, outputMint: outputMint! }),
        enabled: enabled && !!inputMint && !!outputMint,
        staleTime: 5_000,
        refetchInterval: 5_000,
        refetchOnWindowFocus: false,
        refetchOnMount: "always"
    });
}
