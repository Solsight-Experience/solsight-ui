import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import type { ChartCandlePointDto } from "../types/token.types";

const LIGHTWEIGHT_CHARTS_MAX_PRICE = 90_071_992_547_409.91;

type CandleValue = number | string | null | undefined;

type CandlePointInput = {
    timestamp?: CandleValue;
    time?: CandleValue;
    open?: CandleValue;
    high?: CandleValue;
    low?: CandleValue;
    close?: CandleValue;
};

const toFiniteNumber = (value: CandleValue): number | null => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
};

const isValidPrice = (value: number) => Math.abs(value) <= LIGHTWEIGHT_CHARTS_MAX_PRICE;

export const normalizeCandlePoint = (point: CandlePointInput): CandlestickData | null => {
    const rawTimestamp = toFiniteNumber(point.timestamp ?? point.time);
    const open = toFiniteNumber(point.open);
    const high = toFiniteNumber(point.high);
    const low = toFiniteNumber(point.low);
    const close = toFiniteNumber(point.close);

    if (rawTimestamp === null || open === null || high === null || low === null || close === null) {
        return null;
    }

    if (![open, high, low, close].every(isValidPrice)) {
        return null;
    }

    const seconds = rawTimestamp > 10_000_000_000 ? Math.floor(rawTimestamp / 1000) : Math.floor(rawTimestamp);

    if (seconds <= 0) {
        return null;
    }

    return {
        time: seconds as UTCTimestamp,
        open,
        high,
        low,
        close
    };
};

export const normalizeChartPoints = (points: ChartCandlePointDto[] | undefined): CandlestickData[] => {
    if (!points?.length) {
        return [];
    }

    return points
        .map(normalizeCandlePoint)
        .filter((point): point is CandlestickData => point !== null)
        .sort((a, b) => Number(a.time) - Number(b.time));
};
