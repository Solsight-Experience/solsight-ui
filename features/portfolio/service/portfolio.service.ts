import { apiClient } from "@/lib/network-requests/api-client";
import { PORTFOLIO_ENDPOINTS } from "@/lib/constants";
import type { WalletsResponse, PortfolioOverview, PositionsResponse, ActivitiesResponse, Wallet } from "../types/portfolio.types";

interface OverviewApiResponse {
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
    total_balance_usd: number;
    total_balance_sol?: number;
    balance_change_24h?: number;
    pnl?: {
        total?: number;
        realized?: number;
        unrealized?: number;
        change_24h?: number;
        roi_percent?: number;
    };
    transactions?: {
        total: number;
        buys: number;
        sells: number;
        transfers?: number;
        last_24h?: number;
    };
}

interface PositionsApiResponse {
    positions?: Array<{
        mint?: string;
        address?: string;
        symbol?: string;
        name?: string;
        logo?: string;
        logo_uri?: string;
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
        decimals: number;
    }>;
    summary?: {
        total_value_usd: number;
        total_tokens: number;
        total_pnl: number;
    };
}

export const portfolioApi = {
    // Wallet Management
    getWallets: async (): Promise<WalletsResponse> => {
        const response = await apiClient.get<WalletsResponse>(PORTFOLIO_ENDPOINTS.WALLETS);
        return response;
    },

    setDefaultWallet: async (address: string): Promise<{ success: boolean }> => {
        const response = await apiClient.patch<{ success: boolean }>(PORTFOLIO_ENDPOINTS.SET_DEFAULT_WALLET(address));
        return response;
    },

    deleteWallet: async (address: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(PORTFOLIO_ENDPOINTS.DELETE_WALLET(address));
        return response;
    },

    addWallet: async (data: { address: string; name?: string; icon: string }): Promise<{ success: boolean; wallet: Wallet }> => {
        const response = await apiClient.post<{ success: boolean; wallet: Wallet }>(PORTFOLIO_ENDPOINTS.WALLETS, data);
        return response;
    },

    // Portfolio Overview
    getOverview: async (params?: { wallet_addresses?: string[]; time_frame?: "24h" | "7d" | "30d" | "90d" | "1y" }): Promise<PortfolioOverview> => {
        const response = await apiClient.get<OverviewApiResponse>(PORTFOLIO_ENDPOINTS.OVERVIEW, {
            params
        });

        // Map backend response to frontend types (percentage -> percent)
        // Build a properly-typed PortfolioOverview from the backend response
        const result: PortfolioOverview = {
            total_balance_usd: response.total_balance_usd,
            total_balance_sol: response.total_balance_sol ?? 0,
            balance_change_24h: response.balance_change_24h ?? 0,
            // backend may not return change_24h/roi_percent in pnl; ensure shape matches PnlData
            pnl: {
                total: response.pnl?.total ?? 0,
                realized: response.pnl?.realized ?? 0,
                unrealized: response.pnl?.unrealized ?? 0,
                change_24h: response.pnl?.change_24h ?? 0,
                roi_percent: response.pnl?.roi_percent ?? 0
            },
            transactions: {
                total: response.transactions?.total ?? 0,
                buys: response.transactions?.buys ?? 0,
                sells: response.transactions?.sells ?? 0,
                transfers: response.transactions?.transfers ?? 0,
                last_24h: response.transactions?.last_24h ?? 0
            },
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
                })) || [],
            allocation:
                response.allocation?.map((item) => ({
                    symbol: item.symbol,
                    value_usd: item.value_usd,
                    percent: item.percentage ?? item.percent ?? 0 // Support both field names
                })) || []
        };

        return result;
    },

    getPnlChart: async (params: {
        wallet_addresses?: string[];
        time_frame?: "7d" | "30d" | "90d" | "1y" | "all";
        interval?: "1h" | "1d" | "1w";
    }): Promise<{
        chart_data: Array<{
            timestamp: number;
            pnl: number;
            balance_usd: number;
        }>;
    }> => {
        const response = await apiClient.get<{
            chart_data: Array<{
                timestamp: number;
                pnl: number;
                balance_usd: number;
            }>;
        }>(PORTFOLIO_ENDPOINTS.PNL_CHART, { params });
        return response;
    },

    // Positions
    getPositions: async (params: {
        wallet_address: string;
        sort_by?: "value" | "pnl" | "change_24h";
        show_zero_balance?: boolean;
    }): Promise<PositionsResponse> => {
        const response = await apiClient.get<PositionsApiResponse>(PORTFOLIO_ENDPOINTS.POSITIONS, {
            params
        });

        // Map backend response to frontend types
        const mappedResponse: PositionsResponse = {
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
            summary: response.summary || {
                total_value_usd: 0,
                total_tokens: 0,
                total_pnl: 0
            }
        };

        return mappedResponse;
    },

    // Activities
    getActivities: async (params: {
        wallet_address?: string;
        type?: "all" | "swap" | "transfer" | "stake" | "unstake";
        limit?: number;
        offset?: number;
        from?: number;
        to?: number;
    }): Promise<ActivitiesResponse> => {
        const response = await apiClient.get<ActivitiesResponse>(PORTFOLIO_ENDPOINTS.ACTIVITIES, {
            params
        });
        return response;
    }
};
