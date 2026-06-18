import { apiClient } from "@/lib/network-requests/api-client";
import { PORTFOLIO_WATCH_ENDPOINTS } from "@/lib/constants";
import type { PortfolioOverview, PositionsResponse, ActivitiesResponse } from "@/features/portfolio/types/portfolio.types";

interface WatchedOverviewApiResponse {
    total_balance_usd: number;
    total_balance_sol: number;
    balance_change_24h: number;
    pnl: PortfolioOverview["pnl"];
    transactions: PortfolioOverview["transactions"];
    allocation?: Array<{
        symbol: string;
        value_usd: number;
        percentage?: number;
        percent?: number;
    }>;
    top_tokens?: Array<{
        address?: string;
        mint?: string;
        symbol: string;
        name: string;
        logo_uri?: string;
        logo?: string;
        balance?: number;
        amount?: number;
        value_usd: number;
        percent_of_portfolio?: number;
        percentage?: number;
        pnl?: number;
        price_change_24h?: number;
        change_24h?: number;
    }>;
}

interface WatchedPositionApiItem {
    mint?: string;
    address?: string;
    symbol?: string;
    name?: string;
    logo?: string;
    logo_uri?: string;
    decimals: number;
    amount?: number;
    balance?: number;
    avg_buy_price?: number;
    price?: number;
    current_price?: number;
    value_usd?: number;
    price_change_24h?: number;
    total_bought?: number;
    total_sold?: number;
    realized_pnl?: number;
    unrealized_pnl?: number;
    pnl?: number;
    total_pnl?: number;
    roi_percent?: number;
    pnl_percent?: number;
    percent_of_portfolio?: number;
}

interface WatchedPositionsApiResponse {
    positions?: WatchedPositionApiItem[];
    summary?: PositionsResponse["summary"];
}

export const watchedPortfolioApi = {
    getOverview: async (params: { wallet_address: string; time_frame?: "24h" | "7d" | "30d" | "90d" | "1y" }): Promise<PortfolioOverview> => {
        const response = await apiClient.get<WatchedOverviewApiResponse>(PORTFOLIO_WATCH_ENDPOINTS.OVERVIEW, { params });
        return {
            ...response,
            allocation:
                response.allocation?.map((item) => ({
                    symbol: item.symbol,
                    value_usd: item.value_usd,
                    percent: item.percentage ?? item.percent ?? 0
                })) || [],
            top_tokens:
                response.top_tokens?.map((item) => ({
                    address: item.address || item.mint || "",
                    symbol: item.symbol,
                    name: item.name,
                    logo_uri: item.logo_uri || item.logo || "",
                    balance: item.balance || item.amount || 0,
                    value_usd: item.value_usd,
                    percent_of_portfolio: item.percent_of_portfolio || item.percentage || 0,
                    pnl: item.pnl || 0,
                    price_change_24h: item.price_change_24h || item.change_24h || 0
                })) || []
        };
    },

    getPositions: async (params: {
        wallet_address: string;
        sort_by?: "value" | "pnl" | "change_24h";
        show_zero_balance?: boolean;
    }): Promise<PositionsResponse> => {
        const response = await apiClient.get<WatchedPositionsApiResponse>(PORTFOLIO_WATCH_ENDPOINTS.POSITIONS, { params });
        return {
            positions:
                response.positions?.map((item) => ({
                    token: {
                        address: item.mint || item.address || "",
                        symbol: item.symbol || "",
                        name: item.name || "",
                        logo_uri: item.logo || item.logo_uri || "",
                        decimals: item.decimals
                    },
                    balance: item.amount || item.balance || 0,
                    avg_buy_price: item.avg_buy_price || 0,
                    current_price: item.price || item.current_price || 0,
                    value_usd: item.value_usd || 0,
                    price_change_24h: item.price_change_24h || 0,
                    total_bought: item.total_bought || 0,
                    total_sold: item.total_sold || 0,
                    realized_pnl: item.realized_pnl || 0,
                    unrealized_pnl: item.unrealized_pnl || item.pnl || 0,
                    total_pnl: item.total_pnl || item.pnl || 0,
                    roi_percent: item.roi_percent || item.pnl_percent || 0,
                    percent_of_portfolio: item.percent_of_portfolio || 0
                })) || [],
            summary: response.summary || { total_value_usd: 0, total_tokens: 0, total_pnl: 0 }
        };
    },

    getActivities: async (params: {
        wallet_address: string;
        type?: "all" | "swap" | "transfer" | "stake" | "unstake";
        limit?: number;
        offset?: number;
        from?: number;
        to?: number;
    }): Promise<ActivitiesResponse> => {
        return await apiClient.get<ActivitiesResponse>(PORTFOLIO_WATCH_ENDPOINTS.ACTIVITIES, { params });
    },

    getPnlChart: async (params: {
        wallet_address: string;
        time_frame?: "7d" | "30d" | "90d" | "1y" | "all";
        interval?: "1h" | "1d" | "1w";
    }): Promise<{ chart_data: Array<{ timestamp: number; pnl: number; balance_usd: number }> }> => {
        return await apiClient.get(PORTFOLIO_WATCH_ENDPOINTS.PNL_CHART, { params });
    }
};
