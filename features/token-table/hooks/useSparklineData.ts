import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CandlestickData } from "lightweight-charts";
import { tokenApi } from "@/features/token/services/token.services";
import { tokenKeys } from "@/features/token/hooks/token.hooks";
import { useChartDataStream } from "@/features/token/hooks/token.socket.hooks";
import { normalizeChartPoints } from "@/features/token/utils/chart.utils";
import type { ChartInterval } from "@/lib/constants";

export const SPARKLINE_INTERVAL: ChartInterval = "10s";
const SPARKLINE_LIMIT = 60;

/**
 * Chart data for the token-table sparkline: initial candles from the chart
 * endpoint plus live updates from the priceOHLC socket room.
 *
 * Subscribes to the socket on mount — only mount this hook for rows that are
 * visible in the viewport so the number of active rooms stays bounded.
 * Unlike useChartData, errors yield an empty sparkline instead of mock candles.
 */
export function useSparklineData(address: string) {
    const initial = useQuery({
        queryKey: tokenKeys.chart(address, SPARKLINE_INTERVAL),
        queryFn: () =>
            tokenApi.getChartData(address, {
                interval: SPARKLINE_INTERVAL,
                limit: SPARKLINE_LIMIT
            }),
        enabled: !!address,
        staleTime: 30_000
    });

    const initPoints = useMemo(() => {
        if (initial.isError) return [];
        return normalizeChartPoints(initial.data?.points);
    }, [initial.data, initial.isError]);

    const newPoint = useChartDataStream(address, SPARKLINE_INTERVAL);

    const [candles, setCandles] = useState<CandlestickData[]>(initPoints);

    useEffect(() => {
        setCandles(initPoints);
    }, [initPoints]);

    useEffect(() => {
        if (!newPoint) return;
        setCandles((prev) => {
            const last = prev[prev.length - 1];
            if (last && Number(newPoint.time) < Number(last.time)) return prev;
            if (last && Number(newPoint.time) === Number(last.time)) {
                return [...prev.slice(0, -1), newPoint];
            }
            const next = [...prev, newPoint];
            return next.length > SPARKLINE_LIMIT ? next.slice(next.length - SPARKLINE_LIMIT) : next;
        });
    }, [newPoint]);

    const points = useMemo(() => candles.map((candle) => candle.close), [candles]);

    return { points, isLoading: initial.isPending };
}
