"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { createChart, AreaSeries, UTCTimestamp } from "lightweight-charts";
import { pnlChartOptions, getPnlSeriesOptions } from "@/lib/chart-config";

interface PnlDataPoint {
    time: UTCTimestamp;
    value: number;
}

interface PnlMiniChartProps {
    data: PnlDataPoint[];
    height?: number;
    isLoading?: boolean;
}

export const PnlMiniChart: React.FC<PnlMiniChartProps> = ({ data, height = 120, isLoading = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>["addSeries"]> | null>(null);
    const scaleFactorRef = useRef<number>(1);

    // Determine if PnL is positive overall (for color theming)
    const isProfitable = useMemo(() => {
        if (data.length < 2) return true;
        return data[data.length - 1].value >= data[0].value;
    }, [data]);

    // Normalize data to fit within chart's allowed range
    const normalizedData = useMemo(() => {
        if (data.length === 0) return [];

        // Find max absolute value
        const maxAbsValue = Math.max(...data.map((d) => Math.abs(d.value)));

        // Chart max safe value is approximately 90071992547409.91
        const CHART_MAX = 90071992547409.91;

        // Calculate scale factor with safety margin to avoid floating point precision issues
        const scale = maxAbsValue > CHART_MAX ? (maxAbsValue / CHART_MAX) * 1.01 : 1;
        scaleFactorRef.current = scale;

        return data.map((d) => ({
            ...d,
            value: d.value / scale
        }));
    }, [data]);

    useEffect(() => {
        if (!containerRef.current || data.length === 0) return;

        // Create chart only once
        if (!chartRef.current) {
            chartRef.current = createChart(containerRef.current, {
                ...pnlChartOptions,
                width: containerRef.current.clientWidth,
                height
            });

            // Add area series with dynamic colors based on profitability
            seriesRef.current = chartRef.current.addSeries(AreaSeries, {
                ...getPnlSeriesOptions(isProfitable),
                priceFormat: {
                    type: "custom",
                    formatter: (price: number) => {
                        // Scale back the normalized value to original magnitude
                        const originalPrice = price * scaleFactorRef.current;
                        const sign = originalPrice >= 0 ? "+" : "";
                        if (Math.abs(originalPrice) >= 1000) {
                            return `${sign}$${(originalPrice / 1000).toFixed(1)}K`;
                        }
                        return `${sign}$${originalPrice.toFixed(2)}`;
                    }
                }
            });
        }

        // Update series data
        if (seriesRef.current) {
            seriesRef.current.setData(normalizedData);

            // Update colors based on profitability
            seriesRef.current.applyOptions(getPnlSeriesOptions(isProfitable));

            // Fit content
            chartRef.current?.timeScale().fitContent();
        }

        // Handle resize
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth
                });
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [data, normalizedData, isProfitable, height]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
                seriesRef.current = null;
            }
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center bg-[#1a1a2e] rounded-lg animate-pulse" style={{ height }}>
                <div className="text-xs text-gray-500">Loading chart...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center bg-[#1a1a2e] rounded-lg" style={{ height }}>
                <div className="text-center">
                    <svg className="w-6 h-6 mx-auto text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                        />
                    </svg>
                    <p className="text-xs text-gray-500">No PnL data</p>
                </div>
            </div>
        );
    }

    return <div ref={containerRef} className="w-full bg-[#1a1a2e] rounded-lg overflow-hidden" style={{ height }} />;
};

// Helper to generate mock PnL data for testing
export const generateMockPnlData = (days: number = 30): PnlDataPoint[] => {
    const data: PnlDataPoint[] = [];
    const now = Math.floor(Date.now() / 1000);
    const daySeconds = 86400;

    let cumulativePnl = 0;

    for (let i = days; i >= 0; i--) {
        const time = (now - i * daySeconds) as UTCTimestamp;
        // Random daily PnL between -50 and +100
        const dailyPnl = (Math.random() - 0.4) * 150;
        cumulativePnl += dailyPnl;

        data.push({
            time,
            value: cumulativePnl
        });
    }

    return data;
};
