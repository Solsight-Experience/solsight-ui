import React, { useEffect, useRef } from "react";
import { Activity, AlertTriangle } from "lucide-react";
import { createChart, AreaSeries, UTCTimestamp } from "lightweight-charts";
import { miniChartOptions, areaSeriesPresets } from "@/lib/chart-config";
import { usePortfolioOverview, usePnlChart } from "../hooks/portfolio.hooks";

// Mini PnL chart component using lightweight-charts
const PnlLineChart: React.FC<{ data: { time: UTCTimestamp; value: number }[] }> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

    useEffect(() => {
        if (!containerRef.current || data.length === 0) return;

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = createChart(containerRef.current, {
            ...miniChartOptions,
            width: containerRef.current.clientWidth,
            height: 128
        });

        chartRef.current = chart;

        const series = chart.addSeries(AreaSeries, areaSeriesPresets.purple);
        series.setData(data);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data]);

    if (data.length === 0) {
        return <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>;
    }

    return <div ref={containerRef} className="w-full h-full" />;
};

export const PortfolioDashboard: React.FC = () => {
    const { data: overview, isLoading: overviewLoading, error: overviewError } = usePortfolioOverview();
    const {
        data: pnlData,
        isLoading: pnlLoading,
        error: pnlError
    } = usePnlChart({
        time_frame: "7d",
        interval: "1d"
    });

    // Error state
    if (overviewError || pnlError) {
        return (
            <div className="grid grid-cols-[1fr_2fr] gap-4">
                <div className="rounded-2xl border border-purple-600 bg-purple-950/20 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="size-4 text-purple-500" />
                        <div className="text-purple-500 text-base font-medium">Error Loading Data</div>
                    </div>
                    <div className="text-gray-400 text-sm">{overviewError instanceof Error ? overviewError.message : "Network error. Please try again."}</div>
                </div>
                <div className="rounded-2xl border border-purple-600 bg-purple-950/20 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="size-4 text-purple-500" />
                        <div className="text-purple-500 text-base font-medium">Error Loading Data</div>
                    </div>
                    <div className="text-gray-400 text-sm">{pnlError instanceof Error ? pnlError.message : "Network error. Please try again."}</div>
                </div>
            </div>
        );
    }

    if (overviewLoading || pnlLoading) {
        return (
            <div className="grid grid-cols-[1fr_2fr] gap-4">
                <div className="rounded-2xl border border-gray-600 p-4 animate-pulse">
                    <div className="h-48 bg-gray-700 rounded"></div>
                </div>
                <div className="rounded-2xl border border-gray-600 p-4 animate-pulse">
                    <div className="h-48 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!overview || !pnlData) return null;

    const { allocation, total_balance_usd, pnl, transactions } = overview;
    console.log(overview);

    // Empty state - no data
    if (!allocation || allocation.length === 0) {
        return (
            <div className="grid grid-cols-[1fr_2fr] gap-4">
                {/* Balance Card - Empty State */}
                <div className="rounded-2xl border border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="size-4" />
                        <div className="text-white text-base font-medium">Balance</div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-gray-400 text-center">
                            <div className="text-xl mb-2">No assets yet</div>
                            <div className="text-sm">Connect a wallet to get started</div>
                        </div>
                    </div>
                </div>

                {/* PNL Card - Empty State */}
                <div className="flex-1 rounded-2xl border border-gray-600 p-4">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="size-4" />
                        <div className="text-white text-base font-medium">PNL</div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-gray-400 text-center">
                            <div className="text-xl mb-2">No trading history</div>
                            <div className="text-sm">Your profit and loss will appear here</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main asset for center display (largest allocation)
    const mainAsset = allocation[0];

    // Calculate donut segments
    const circumference = 2 * Math.PI * 45; // radius = 45

    const formatDateLabel = (timestamp?: number) =>
        timestamp ? new Date(timestamp).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" }) : "--/--";

    // Prepare chart data for lightweight-charts
    const chartData = pnlData.chart_data.map((point) => ({
        time: Math.floor((point.timestamp || Date.now()) / 1000) as import("lightweight-charts").UTCTimestamp,
        value: point.pnl
    }));

    const assetColors = ["#3B82F6", "#F97316", "#A855F7", "#10B981", "#F59E0B"];

    return (
        <div className="grid grid-cols-[1fr_2fr] gap-4">
            {/* Balance Card */}
            <div className="rounded-2xl border border-gray-600 p-4">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="size-4" />
                    <div className="text-white text-base font-medium">Balance</div>
                </div>

                <div className="flex items-center justify-center gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {allocation.map((item, index) => {
                                const startPercentage = allocation.slice(0, index).reduce((sum, a) => sum + a.percent, 0);
                                const offset = (circumference * startPercentage) / 100;
                                const dashArray = `${(circumference * item.percent) / 100} ${circumference}`;

                                return (
                                    <circle
                                        key={item.symbol}
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={assetColors[index % assetColors.length]}
                                        strokeWidth="10"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={-offset}
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-white">{mainAsset.percent.toFixed(1)}%</div>
                            <div className="text-sm text-zinc-400 mt-1">{mainAsset.symbol}</div>
                        </div>
                    </div>

                    {/* Asset List */}
                    <div className="space-y-3">
                        <div className="text-3xl font-bold text-white mb-4">${total_balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>

                        {allocation.map((item, index) => (
                            <div key={item.symbol} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: assetColors[index % assetColors.length] }} />
                                <div className="text-white font-medium">{item.symbol}</div>
                                <div className="flex gap-2 items-center text-sm text-gray-400">
                                    <div>${item.value_usd.toFixed(2)}</div>
                                    <div>({item.percent.toFixed(1)}%)</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PNL Card */}
            <div className="flex-1 rounded-2xl border border-gray-600 p-4">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="size-4" />
                    <div className="text-white text-base font-medium">PNL</div>
                </div>

                {/* Chart */}
                <div className="h-32 mb-4">
                    <PnlLineChart data={chartData} />
                </div>

                {/* Stats */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Total PNL</span>
                        <span className={`font-semibold ${pnl.total >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {pnl.total >= 0 ? "+" : ""}${(pnl.total / 1000).toFixed(1)}K
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Total TXNS</span>
                        <span className="font-semibold text-white">{transactions.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
