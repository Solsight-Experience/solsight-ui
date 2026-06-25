import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenApi } from "../services/token.services";
import type { HoldersResponse, SwapPreviewRequest, TokenDetail, TopTrader, Trade, FavoriteToken } from "../types/token.types";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/react-query-keys";
import { useChartDataStream, useHoldersStream, useTokenDetailStream, useTopTradersStream, useTradeStream } from "./token.socket.hooks";
import { useEffect, useMemo, useState } from "react";
import { ChartInterval } from "@/lib/constants";
import { generateCandleData } from "../utils/token.utils";
import { normalizeChartPoints } from "../utils/chart.utils";

// Query Keys
export const tokenKeys = {
    all: ["token"] as const,
    detail: (address: string) => [...tokenKeys.all, "detail", address] as const,
    chart: (address: string, interval: string) => [...tokenKeys.all, "chart", address, interval] as const,
    trades: (address: string, params?: Record<string, unknown>) => [...tokenKeys.all, "trades", address, params] as const,
    topTraders: (address: string, timeFrame: string) => [...tokenKeys.all, "top-traders", address, timeFrame] as const,
    holders: (address: string, params?: Record<string, unknown>) => [...tokenKeys.all, "holders", address, params] as const
};

// Hooks
export function useTokenDetail(address: string) {
    const initial = useQuery({
        queryKey: tokenKeys.detail(address),
        queryFn: () => tokenApi.getTokenDetail(address),
        enabled: !!address,
        staleTime: 10000 // 10 seconds
    });
    const newDetail = useTokenDetailStream(address);
    const [data, setData] = useState<TokenDetail>();

    useEffect(() => {
        if (initial.data) setData(initial.data);
    }, [initial.data]);

    useEffect(() => {
        if (!newDetail) return;
        if (!initial.data) return;
        setData((prev) => ({ ...prev, ...newDetail }));
    }, [initial.data, newDetail]);

    return { ...initial, data };
}

export function useChartData(address: string, interval: string) {
    const initial = useQuery({
        queryKey: tokenKeys.chart(address, interval),
        queryFn: () =>
            tokenApi.getChartData(address, {
                interval,
                limit: 100
            }),
        enabled: !!address && !!interval
    });

    const newPoint = useChartDataStream(address, interval as ChartInterval);

    // init data (batch / mock)
    const initPoints = useMemo(() => {
        if (initial.isError) {
            return generateCandleData(80);
        }
        return normalizeChartPoints(initial.data?.points);
    }, [initial.data, initial.isError]);

    return {
        ...initial,
        initPoints, // Candle[]
        newPoint // Candle | undefined
    };
}

export function useTrades(
    address: string,
    params?: {
        limit?: number;
        offset?: number;
        type?: "all" | "buy" | "sell";
    }
) {
    const initial = useQuery({
        queryKey: tokenKeys.trades(address, params),
        queryFn: () => tokenApi.getTrades(address, params),
        enabled: !!address,
        staleTime: 5000
        // refetchInterval: 5000,
    });
    const newTrades = useTradeStream(address, params);
    const [data, setData] = useState<{ trades: Trade[] }>({ trades: [] });

    useEffect(() => {
        if (initial.data) setData(initial.data);
    }, [initial.data]);

    useEffect(() => {
        if (!newTrades || newTrades.length === 0) return;

        setData((prev) => {
            const existingHashes = new Set(prev.trades.map((t) => t.tx_hash));
            const uniqueNew = newTrades.filter((t) => !existingHashes.has(t.tx_hash));
            if (uniqueNew.length === 0) return prev;
            const sortedNew = uniqueNew.sort((a, b) => b.timestamp - a.timestamp);
            return { trades: [...sortedNew, ...prev.trades] };
        });
    }, [newTrades]);

    return { ...initial, data };
}

export function useTopTraders(address: string, timeFrame: "24h" | "7d" | "30d" | "all" = "24h") {
    const initial = useQuery({
        queryKey: tokenKeys.topTraders(address, timeFrame),
        queryFn: () => tokenApi.getTopTraders(address, { time_frame: timeFrame, limit: 10 }),
        enabled: !!address,
        staleTime: 30000
    });
    const streamTraders = useTopTradersStream(address);
    const [data, setData] = useState<{ traders: TopTrader[] }>({ traders: [] });

    useEffect(() => {
        if (initial.data) setData(initial.data);
    }, [initial.data, timeFrame]);

    useEffect(() => {
        if (!streamTraders) return;
        setData({ traders: streamTraders });
    }, [streamTraders]);

    return { ...initial, data };
}

export function useHolders(
    address: string,
    params?: {
        sort_by?: "balance" | "pnl" | "bought" | "sold";
        limit?: number;
        offset?: number;
    }
) {
    const initial = useQuery({
        queryKey: tokenKeys.holders(address, params),
        queryFn: () => tokenApi.getHolders(address, params),
        enabled: !!address,
        staleTime: 30000 // 30 seconds
    });
    const holderUpdate = useHoldersStream(address);
    const [data, setData] = useState<HoldersResponse>({
        holders: [],
        total: 0,
        summary: {
            total_holders: 0,
            top_10_holding_percent: 0,
            top_20_holding_percent: 0
        }
    });

    useEffect(() => {
        if (initial.data) setData(initial.data);
    }, [initial.data]);

    useEffect(() => {
        if (!holderUpdate) return;

        setData((prev) => {
            const existingMap = new Map(prev.holders.map((h) => [h.address, h]));

            // Remove holders that are no longer in top list
            for (const addr of holderUpdate.removed) {
                existingMap.delete(addr);
            }

            // Update or add changed holders
            for (const holder of holderUpdate.changed) {
                existingMap.set(holder.address, holder);
            }

            // Sort by balance descending and limit to configured amount
            const limit = params?.limit ?? 100;
            const sortedHolders = Array.from(existingMap.values())
                .sort((a, b) => b.balance - a.balance)
                .slice(0, limit);

            return { ...prev, holders: sortedHolders };
        });
    }, [holderUpdate, params?.limit]);

    return { ...initial, data };
}

// Mutations
export function useSwapPreview(address: string) {
    return useMutation({
        mutationFn: (data: SwapPreviewRequest) => tokenApi.getSwapPreview(address, data)
    });
}

export function useFavoriteTokens() {
    const { user } = useAuth();
    const isLoggedIn = !!user;

    return useQuery({
        queryKey: queryKeys.user.favorites(),
        queryFn: () => tokenApi.getFavorites(),
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });
}

export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ address, isFavorite }: { address: string; isFavorite: boolean }) => {
            if (isFavorite) {
                return tokenApi.removeFavorite(address);
            } else {
                return tokenApi.addFavorite(address);
            }
        },
        onMutate: async ({ address, isFavorite }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: queryKeys.user.favorites() });

            // Snapshot the previous value
            const previousFavorites = queryClient.getQueryData<FavoriteToken[]>(queryKeys.user.favorites());

            // Optimistically update to the new value
            queryClient.setQueryData<FavoriteToken[]>(queryKeys.user.favorites(), (old) => {
                const list = old || [];
                if (isFavorite) {
                    return list.filter((fav) => fav.token_address !== address);
                } else {
                    return [...list, { token_address: address, added_at: new Date().toISOString(), token: null }];
                }
            });

            // Return a context object with the snapshotted value
            return { previousFavorites };
        },
        onError: (err, variables, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(queryKeys.user.favorites(), context.previousFavorites);
            }
            console.error("Failed to toggle favorite:", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites() });
        }
    });
}
