import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { TOKEN_ENDPOINTS } from "@/lib/constants";

interface SolPriceResponse {
    price_usd: number;
    source: "redis" | "coingecko";
}

export function useSolPrice() {
    return useQuery<SolPriceResponse, Error>({
        queryKey: ["solPrice"],
        queryFn: () => apiClient.get<SolPriceResponse>(TOKEN_ENDPOINTS.SOL_PRICE),
        staleTime: 30_000 // 30 seconds — shared cache across components
    });
}
