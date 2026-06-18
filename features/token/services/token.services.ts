import { apiClient } from "@/lib/network-requests/api-client";
import { TOKEN_ENDPOINTS } from "@/lib/constants";
import type {
    TokenDetail,
    ChartData,
    TradesResponse,
    TopTradersResponse,
    HoldersResponse,
    SwapPreviewRequest,
    SwapPreviewResponse
} from "../types/token.types";

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
