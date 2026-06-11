import { useQuery } from "@tanstack/react-query";
import { watchedPortfolioApi } from "../services/watchedPortfolio.service";

type WatchedOverviewParams = { time_frame?: "24h" | "7d" | "30d" | "90d" | "1y" };
type WatchedPositionsParams = { sort_by?: "value" | "pnl" | "change_24h"; show_zero_balance?: boolean };
type WatchedActivitiesParams = {
    type?: "all" | "swap" | "transfer" | "stake" | "unstake";
    limit?: number;
    offset?: number;
    from?: number;
    to?: number;
};
type WatchedPnlChartParams = { time_frame?: "7d" | "30d" | "90d" | "1y" | "all"; interval?: "1h" | "1d" | "1w" };

export const watchedPortfolioKeys = {
    all: ["watched-portfolio"] as const,
    overview: (address: string, params?: WatchedOverviewParams) => [...watchedPortfolioKeys.all, "overview", address, params] as const,
    positions: (address: string, params?: WatchedPositionsParams) => [...watchedPortfolioKeys.all, "positions", address, params] as const,
    activities: (address: string, params?: WatchedActivitiesParams) => [...watchedPortfolioKeys.all, "activities", address, params] as const,
    pnlChart: (address: string, params?: WatchedPnlChartParams) => [...watchedPortfolioKeys.all, "pnl-chart", address, params] as const
};

export function useWatchedOverview(walletAddress: string, params?: WatchedOverviewParams) {
    return useQuery({
        queryKey: watchedPortfolioKeys.overview(walletAddress, params),
        queryFn: () => watchedPortfolioApi.getOverview({ wallet_address: walletAddress, ...params }),
        enabled: !!walletAddress,
        staleTime: 10000
    });
}

export function useWatchedPositions(walletAddress: string, params?: WatchedPositionsParams) {
    return useQuery({
        queryKey: watchedPortfolioKeys.positions(walletAddress, params),
        queryFn: () => watchedPortfolioApi.getPositions({ wallet_address: walletAddress, ...params }),
        enabled: !!walletAddress,
        staleTime: 10000
    });
}

export function useWatchedActivities(walletAddress: string, params?: WatchedActivitiesParams) {
    return useQuery({
        queryKey: watchedPortfolioKeys.activities(walletAddress, params),
        queryFn: () => watchedPortfolioApi.getActivities({ wallet_address: walletAddress, ...params }),
        enabled: !!walletAddress,
        staleTime: 10000
    });
}

export function useWatchedPnlChart(walletAddress: string, params?: WatchedPnlChartParams) {
    return useQuery({
        queryKey: watchedPortfolioKeys.pnlChart(walletAddress, params),
        queryFn: () => watchedPortfolioApi.getPnlChart({ wallet_address: walletAddress, ...params }),
        enabled: !!walletAddress,
        staleTime: 60000
    });
}
