import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query-keys";
import { TokenDiscoveryService } from "../services/token-discovery.service";

export interface TickerItem {
    symbol: string;
    price: string;
    change: number;
    logo_uri?: string;
}

function formatPrice(raw: unknown): string {
    const price = Number(raw);
    if (!isFinite(price)) return "—";
    if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toExponential(2);
}

export function useTickerData(): TickerItem[] {
    const { data } = useQuery({
        queryKey: queryKeys.tokens.trending({ ticker: true }),
        queryFn: () => TokenDiscoveryService.getTrending({ limit: 20, sort_by: "volume_24h", time_frame: "24h" }),
        staleTime: 30000,
        refetchInterval: 60000
    });

    if (!data?.tokens?.length) return [];

    return data.tokens.map((token) => ({
        symbol: token.symbol,
        price: formatPrice(token.price),
        change: Number(token.price_change_24h) || 0,
        logo_uri: token.logo_uri
    }));
}
