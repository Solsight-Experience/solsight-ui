import type { LineData, HistogramData, BarData, SingleValueData, CandlestickData, DeepPartial, ChartOptions, AreaSeriesOptions } from "lightweight-charts";
import { ColorType } from "lightweight-charts";

export type ChartType = "candles" | "line" | "area" | "bars" | "baseline" | "histogram";

// ─── Chart Color Presets ─────────────────────────────────────────────────────

export const chartColors = {
    profit: "#22c55e",
    loss: "#ef4444",
    purple: "#A855F7",
    blue: "#3b82f6",
    text: {
        primary: "#9ca3af",
        secondary: "#71717a",
        muted: "#6b7280"
    },
    grid: "#1f2933",
    background: "transparent"
} as const;

// ─── Base Chart Options ──────────────────────────────────────────────────────

export const baseChartOptions: DeepPartial<ChartOptions> = {
    layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.text.primary
    },
    grid: {
        vertLines: { color: chartColors.grid },
        horzLines: { color: chartColors.grid }
    },
    timeScale: {
        timeVisible: true,
        borderVisible: false
    }
};

// ─── Mini Chart Options (for sparklines/small charts) ────────────────────────

export const miniChartOptions: DeepPartial<ChartOptions> = {
    layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.text.secondary,
        fontSize: 10
    },
    grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
    },
    rightPriceScale: {
        visible: false
    },
    timeScale: {
        visible: true,
        borderVisible: false,
        timeVisible: false
    },
    crosshair: {
        vertLine: { color: "rgba(168, 85, 247, 0.3)", width: 1, style: 2, labelVisible: false },
        horzLine: { color: "rgba(168, 85, 247, 0.3)", width: 1, style: 2, labelVisible: false }
    },
    handleScroll: false,
    handleScale: false
};

// ─── PnL Chart Options (with price scale) ────────────────────────────────────

export const pnlChartOptions: DeepPartial<ChartOptions> = {
    layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.text.muted,
        fontSize: 10
    },
    grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255, 255, 255, 0.05)", style: 1 }
    },
    rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 }
    },
    timeScale: {
        visible: true,
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false
    },
    crosshair: {
        vertLine: { color: "rgba(255, 255, 255, 0.2)", width: 1, style: 2, labelVisible: false },
        horzLine: { color: "rgba(255, 255, 255, 0.2)", width: 1, style: 2, labelVisible: true }
    },
    handleScroll: false,
    handleScale: false
};

// ─── Area Series Presets ─────────────────────────────────────────────────────

export const areaSeriesPresets = {
    purple: {
        lineColor: chartColors.purple,
        topColor: "rgba(168, 85, 247, 0.3)",
        bottomColor: "rgba(168, 85, 247, 0.0)",
        lineWidth: 2
    } as DeepPartial<AreaSeriesOptions>,

    blue: {
        lineColor: chartColors.blue,
        topColor: "rgba(59, 130, 246, 0.4)",
        bottomColor: "rgba(59, 130, 246, 0.05)",
        lineWidth: 2
    } as DeepPartial<AreaSeriesOptions>,

    profit: {
        lineColor: chartColors.profit,
        topColor: "rgba(34, 197, 94, 0.3)",
        bottomColor: "rgba(34, 197, 94, 0.0)",
        lineWidth: 2
    } as DeepPartial<AreaSeriesOptions>,

    loss: {
        lineColor: chartColors.loss,
        topColor: "rgba(239, 68, 68, 0.3)",
        bottomColor: "rgba(239, 68, 68, 0.0)",
        lineWidth: 2
    } as DeepPartial<AreaSeriesOptions>
} as const;

// ─── Dynamic PnL Series Options ──────────────────────────────────────────────

export const getPnlSeriesOptions = (isProfitable: boolean): DeepPartial<AreaSeriesOptions> =>
    isProfitable ? areaSeriesPresets.profit : areaSeriesPresets.loss;

// ─── Data Transformers ───────────────────────────────────────────────────────

export const toLineData = (data: CandlestickData[]): LineData[] => data.map((d) => ({ time: d.time, value: d.close }));

export const toAreaData = (data: CandlestickData[]): SingleValueData[] => data.map((d) => ({ time: d.time, value: d.close }));

export const toBaselineData = (data: CandlestickData[]): SingleValueData[] => data.map((d) => ({ time: d.time, value: d.close }));

export const toHistogramData = (data: CandlestickData[]): HistogramData[] =>
    data.map((d) => ({
        time: d.time,
        value: Math.abs(d.close - d.open),
        color: d.close >= d.open ? "#22c55e" : "#ef4444"
    }));

export const toBarData = (data: CandlestickData[]): BarData[] =>
    data.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
    }));
