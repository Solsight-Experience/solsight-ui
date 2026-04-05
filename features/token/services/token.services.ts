import { apiClient } from "@/lib/api-client";
import { TOKEN_ENDPOINTS } from "@/lib/constants";
import type { PoolOverview, PoolFilterResponse } from "@/types/filter";
import type {
    TokenDetail,
    ChartData,
    TradesResponse,
    TopTradersResponse,
    HoldersResponse,
    TokenPoolsResponse,
    SwapPreviewRequest,
    SwapPreviewResponse
} from "../types/token.types";

const mapPoolOverviewToTokenPool = (pool: PoolOverview): TokenPoolsResponse["pools"][number] => ({
    pool_address: pool.address,
    dex: pool.protocol,
    pair_name: `${pool.base_token.symbol}/${pool.quote_token.symbol}`,
    quote_symbol: pool.quote_token.symbol,
    liquidity_usd: pool.liquidity,
    volume_24h_usd: pool.volume_24h,
    fee_percent: pool.fee_percent,
    reserve_base: 0,
    reserve_quote: 0
});

const summarizePools = (pools: TokenPoolsResponse["pools"]): TokenPoolsResponse["summary"] => ({
    total_liquidity_usd: pools.reduce((sum, pool) => sum + pool.liquidity_usd, 0),
    total_volume_24h_usd: pools.reduce((sum, pool) => sum + pool.volume_24h_usd, 0),
    unique_dex_count: new Set(pools.map((pool) => pool.dex)).size,
    unique_pool_count: pools.length
});

export const tokenApi = {
    // Get token details
    getTokenDetail: async (address: string): Promise<TokenDetail> => {
        const response = await apiClient.get<TokenDetail>(TOKEN_ENDPOINTS.TOKEN_DETAIL(address));
        return response;
    },

    // Get chart data
    getChartData: async (
        address: string,
        params: {
            interval: string;
            from?: number;
            to?: number;
            limit?: number;
        }
    ): Promise<ChartData> => {
        const response = await apiClient.get<ChartData>(TOKEN_ENDPOINTS.TOKEN_CHART(address), {
            params
        });
        return response;
    },

    // Get trades
    getTrades: async (
        address: string,
        params?: {
            limit?: number;
            offset?: number;
            type?: "all" | "buy" | "sell";
        }
    ): Promise<TradesResponse> => {
        const response = await apiClient.get<TradesResponse>(TOKEN_ENDPOINTS.TOKEN_TRADES(address), {
            params
        });
        return response;
    },

    // Get top traders
    getTopTraders: async (
        address: string,
        params?: {
            time_frame?: "24h" | "7d" | "30d" | "all";
            limit?: number;
        }
    ): Promise<TopTradersResponse> => {
        const response = await apiClient.get<TopTradersResponse>(TOKEN_ENDPOINTS.TOKEN_TOP_TRADERS(address), { params });
        return response;
    },

    // Get holders
    getHolders: async (
        address: string,
        params?: {
            sort_by?: "balance" | "pnl" | "bought" | "sold";
            limit?: number;
            offset?: number;
        }
    ): Promise<HoldersResponse> => {
        const response = await apiClient.get<HoldersResponse>(TOKEN_ENDPOINTS.TOKEN_HOLDERS(address), {
            params
        });
        return response;
    },

    getTokenPools: async (
        address: string,
        params?: {
            limit?: number;
            offset?: number;
        }
    ): Promise<TokenPoolsResponse> => {
        try {
            const response = await apiClient.get<TokenPoolsResponse>(TOKEN_ENDPOINTS.TOKEN_POOLS(address), {
                params
            });
            return response;
        } catch {
            const fallbackLimit = params?.limit ?? 200;
            const fallbackOffset = params?.offset ?? 0;
            const fallbackResponse = await apiClient.post<PoolFilterResponse>(`/api/pools/filter?limit=${fallbackLimit}&offset=${fallbackOffset}`, {
                tokens: [address]
            });

            const normalizedPools = fallbackResponse.pools.map(mapPoolOverviewToTokenPool);

            return {
                pools: normalizedPools,
                summary: summarizePools(normalizedPools)
            };
        }
    },

    // Swap preview
    getSwapPreview: async (address: string, data: SwapPreviewRequest): Promise<SwapPreviewResponse> => {
        const response = await apiClient.post<SwapPreviewResponse>(TOKEN_ENDPOINTS.SWAP_PREVIEW(address), data);
        return response;
    },

    // Add to favorites
    addFavorite: async (address: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post<{ success: boolean }>(TOKEN_ENDPOINTS.ADD_FAVORITE(address), {
            token_address: address
        });
        return response;
    },

    // Remove from favorites
    removeFavorite: async (address: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(TOKEN_ENDPOINTS.REMOVE_FAVORITE(address));
        return response;
    }
};
