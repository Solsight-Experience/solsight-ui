import { TokenSocketManager } from "../services/token.socket.services";
import { useEffect, useState } from "react";
import type { Trade, TradeStreamResponse, TopTrader, Holder, TokenDetail } from "../types/token.types";
import type { ChartInterval } from "@/lib/constants";
import { CandlestickData, UTCTimestamp } from "lightweight-charts";
import { normalizeCandlePoint } from "../utils/chart.utils";
import useClusterStore from "@/stores/cluster.store";

const socket = TokenSocketManager.getInstance();

export function useTokenDetailStream(address: string) {
    const [detail, setDetail] = useState<TokenDetail>();
    const cluster = useClusterStore((s) => s.cluster);
    useEffect(() => {
        const dto = {
            cluster,
            domain: "stats",
            resource: address,
            interval: "5s"
        };

        socket.onDomainEvent<TokenDetail>(dto, (data) => {
            setDetail(data);
        });

        return () => {
            socket.unsubscribe(dto);
        };
    }, [address, cluster]);
    return detail;
}

export function useTradeStream(
    address: string,
    _params?: {
        type?: "all" | "buy" | "sell";
    }
) {
    const [trades, setTrades] = useState<Trade[]>();
    const cluster = useClusterStore((s) => s.cluster);
    useEffect(() => {
        const dto = {
            cluster,
            domain: "trades",
            resource: address,
            interval: "5s"
        };

        socket.onDomainEvent<TradeStreamResponse>(dto, (data) => {
            setTrades(data.trades);
        });

        return () => {
            socket.unsubscribe(dto);
        };
    }, [address, cluster]);

    return trades;
}

export function useTopTradersStream(address: string) {
    const [topTraders, setTopTraders] = useState<TopTrader[]>();
    const cluster = useClusterStore((s) => s.cluster);
    useEffect(() => {
        const dto = {
            cluster,
            domain: "top_traders",
            resource: address,
            interval: "5s"
        };

        socket.onDomainEvent(dto, (data: { token: string; data: TopTrader[] }) => {
            setTopTraders(data.data);
        });

        return () => {
            socket.unsubscribe(dto);
        };
    }, [address, cluster]);
    return topTraders;
}

export interface HolderUpdatePayload {
    token: string;
    changed: Holder[];
    removed: string[];
}

export function useHoldersStream(address: string) {
    const [holderUpdate, setHolderUpdate] = useState<HolderUpdatePayload>();
    const cluster = useClusterStore((s) => s.cluster);
    useEffect(() => {
        const dto = {
            cluster,
            domain: "holders",
            resource: address,
            interval: "5s"
        };

        socket.onDomainEvent(dto, (data: HolderUpdatePayload) => {
            // Backend sends: { token, changed: Holder[], removed: string[] }
            if (data?.changed || data?.removed) {
                setHolderUpdate(data);
            }
        });

        return () => {
            socket.unsubscribe(dto);
        };
    }, [address, cluster]);
    return holderUpdate;
}

export function useChartDataStream(address: string, interval: ChartInterval) {
    const [chart, setChart] = useState<CandlestickData>();
    const cluster = useClusterStore((s) => s.cluster);
    useEffect(() => {
        const priceDto = {
            cluster,
            domain: "priceOHLC",
            resource: address,
            interval
        };

        socket.onDomainEvent<{ priceOHLC: CandlestickData; time: UTCTimestamp }>(priceDto, ({ priceOHLC, time }) => {
            const nextPoint = normalizeCandlePoint({ ...priceOHLC, time });

            if (nextPoint) {
                setChart(nextPoint);
            }
        });

        return () => {
            socket.unsubscribe(priceDto);
        };
    }, [address, interval, cluster]);

    return chart;
}
