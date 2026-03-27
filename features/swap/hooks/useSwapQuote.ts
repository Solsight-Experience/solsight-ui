import { useQuery } from "@tanstack/react-query";
import { SwapService, QuoteParams } from "../services/swap.service";

export function useSwapQuote(params: QuoteParams | null) {
    return useQuery({
        queryKey: ["swap-quote", params],
        queryFn: () => SwapService.getQuote(params!),
        enabled: !!params && !!params.amount,
        staleTime: 10_000,
        refetchInterval: 15_000
    });
}
