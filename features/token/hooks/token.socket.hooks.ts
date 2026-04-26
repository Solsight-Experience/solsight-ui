"use client";

import { useStream } from "@/hooks/useStream";
import type { TokenDetail, TradeStreamResponse, TopTrader, HolderUpdatePayload } from "../types/token.types";
import type { ChartInterval } from "@/lib/constants";
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

export function useTokenDetailStream(address: string) {
    const { data } = useStream("TOKEN_STATS", {
        domain: "stats",
        resource: address,
        interval: "5s"
    });
    return data;
}

export function useTradeStream(
    address: string,
    params?: {
        type?: "all" | "buy" | "sell";
    }
) {
    const { data } = useStream("TOKEN_TRADES", {
        domain: "trades",
        resource: address,
        interval: "5s"
    });
    return data?.trades;
}

export function useTopTradersStream(address: string, timeFrame: "24h" | "7d" | "30d" | "all" = "24h") {
    const { data } = useStream("TOKEN_TOP_TRADERS", {
        domain: "top_traders",
        resource: address,
        interval: "5s"
    });
    return data?.data;
}

export function useHoldersStream(address: string) {
    const { data } = useStream("TOKEN_HOLDERS", {
        domain: "holders",
        resource: address,
        interval: "5s"
    });
    return data?.changed || data?.removed ? data : undefined;
}

// BUG FIX (Architect A4, Critic C5):
// OLD: Read chartInterval from store inside this hook, but useEffect deps had [address, interval] parameter.
//      This caused mismatch: subscription used store, resubscription triggered by parameter.
// NEW: Use the `interval` parameter as the single source of truth.
//      Caller (useChartData) already reads store at component level and passes it.
export function useChartDataStream(address: string, interval: ChartInterval) {
    const { data } = useStream("TOKEN_CHART", {
        domain: "priceOHLC",
        resource: address,
        interval: interval
    });
    if (!data) return undefined;
    return {
        open: data.priceOHLC.open,
        high: data.priceOHLC.high,
        low: data.priceOHLC.low,
        close: data.priceOHLC.close,
        time: data.time as UTCTimestamp
    } as CandlestickData;
}
