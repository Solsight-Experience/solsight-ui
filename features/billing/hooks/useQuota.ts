"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query-keys";
import { BillingService } from "../services/billing.service";

export function useQuota() {
    return useQuery({
        queryKey: queryKeys.billing.quota(),
        queryFn: BillingService.getQuota,
        staleTime: 30_000
    });
}

export function usePackages() {
    return useQuery({
        queryKey: queryKeys.billing.packages(),
        queryFn: BillingService.getPackages,
        staleTime: 5 * 60_000
    });
}
