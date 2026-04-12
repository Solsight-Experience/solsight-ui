import React, { useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, Wallet, BarChart3, PieChart, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createChart, AreaSeries, UTCTimestamp } from "lightweight-charts";
import { miniChartOptions, areaSeriesPresets } from "@/lib/chart-config";
import { usePortfolioOverview, usePnlChart } from "../hooks/portfolio.hooks";
import { usePortfolioUIStore } from "../stores/portfolioUIStore";
import { MockConnectWalletDialog } from "./MockConnectWalletDialog";

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
            height: containerRef.current.clientHeight || 140,
            layout: {
                background: { color: "transparent" },
                textColor: "#a3a3a3"
            },
            grid: {
                vertLines: { color: "rgba(255,255,255,0.02)" },
                horzLines: { color: "rgba(255,255,255,0.02)" }
            }
        });

        chartRef.current = chart;

        const series = chart.addSeries(AreaSeries, {
            ...areaSeriesPresets.purple,
            topColor: "rgba(168, 85, 247, 0.4)",
            bottomColor: "rgba(168, 85, 247, 0.0)",
            lineColor: "#a855f7",
            lineWidth: 2
        });
        series.setData(data);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
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
        return <div className="h-full flex items-center justify-center text-gray-500/50 text-sm">No chart data</div>;
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
    const [open, setOpen] = useState(false);
    // Error state
    if (overviewError || pnlError) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-red-500/20 bg-red-950/20 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
                    <AlertTriangle className="size-10 text-red-500 mb-4 animate-pulse" />
                    <div className="text-red-400 text-lg font-semibold mb-2">Error Loading Data</div>
                    <div className="text-red-300/60 text-sm">{overviewError instanceof Error ? overviewError.message : "Network error. Please try again."}</div>
                </div>
            </div>
        );
    }

    if (overviewLoading || pnlLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
                <div className="rounded-3xl border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl p-6 h-[260px] animate-pulse flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <div className="w-32 h-6 bg-gray-700/50 rounded mb-6"></div>
                    <div className="flex items-end gap-8">
                        <div className="w-32 h-32 rounded-full bg-gray-700/50"></div>
                        <div className="flex-1 space-y-4">
                            <div className="w-48 h-10 bg-gray-700/50 rounded"></div>
                            <div className="w-full h-4 bg-gray-700/50 rounded"></div>
                            <div className="w-3/4 h-4 bg-gray-700/50 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="rounded-3xl border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl p-6 h-[260px] animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <div className="w-24 h-6 bg-gray-700/50 rounded mb-6"></div>
                    <div className="w-full h-32 bg-gray-700/50 rounded mb-4"></div>
                    <div className="w-full flex justify-between">
                        <div className="w-20 h-4 bg-gray-700/50 rounded"></div>
                        <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!overview || !pnlData) return null;

    const { allocation, total_balance_usd, pnl, transactions } = overview;

    // Premium Empty State
    if (!allocation || allocation.length === 0) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 w-full">
                {/* Immersive Empty State Card */}
                <div className="group relative rounded-3xl overflow-hidden bg-[#0c0c14]/80 backdrop-blur-2xl border border-white/5 hover:border-purple-500/40 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700 -z-10"></div>

                    <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center h-full min-h-[360px] relative z-10">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse"></div>
                            <div className="w-24 h-24 bg-gradient-to-br from-[#1c1c28] to-[#0f0f16] border border-white/10 rounded-3xl flex items-center justify-center relative z-10 shadow-2xl group-hover:scale-110 transition-transform duration-700 transform-gpu rotate-[-5deg]">
                                <Wallet className="size-10 text-purple-400 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-300" />
                            </div>
                            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-[#1c1c28] to-[#0f0f16] border border-white/10 rounded-xl flex items-center justify-center rotate-[15deg] shadow-lg z-20 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-700">
                                <Sparkles className="size-5 text-blue-400" />
                            </div>
                        </div>

                        <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight drop-shadow-sm">No Assets Yet</h3>
                        <p className="text-purple-200/50 max-w-sm mb-10 text-base leading-relaxed">
                            Connect your wallet to track your Web3 portfolio across chains, analyze performance, and discover market opportunities.
                        </p>

                        <div className="relative group/btn cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-60 group-hover/btn:opacity-100 group-hover/btn:blur-md transition duration-300"></div>
                            <button
                                onClick={() => setOpen(true)}
                                className="relative flex h-12 items-center justify-center gap-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 px-8 font-semibold text-white transition-all duration-300 hover:bg-[#12121a]"
                            >
                                <span>Connect Wallet</span>
                            </button>
                        </div>
                    </div>
                    <MockConnectWalletDialog open={open} onOpenChange={setOpen} />
                </div>

                {/* Simulated Data Preview (Faded Glass) */}
                <div className="rounded-3xl overflow-hidden bg-[#0a0a10]/50 backdrop-blur-xl border border-white/5 p-8 opacity-40 select-none pointer-events-none relative shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="flex items-center gap-2 mb-8">
                        <TrendingUp className="size-6 text-purple-400/50" />
                        <div className="text-white/80 text-xl font-bold">Performance</div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-28 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl w-full flex items-end p-2 gap-1 overflow-hidden">
                            {/* Fake chart bars */}
                            {[20, 45, 30, 60, 40, 75, 50, 90, 70, 100].map((h, i) => (
                                <div key={i} className="bg-purple-500/20 w-full rounded-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-zinc-500 font-medium">Total Profit</span>
                            <span className="text-green-500/60 font-bold flex items-center gap-1">
                                <ArrowUpRight className="size-4" /> $12,450
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-zinc-500 font-medium">Win Rate</span>
                            <span className="text-white/50 font-bold">68.5%</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const mainAsset = allocation[0];
    const circumference = 2 * Math.PI * 45; // radius = 45

    const chartData = pnlData.chart_data.map((point) => ({
        time: Math.floor((point.timestamp || Date.now()) / 1000) as import("lightweight-charts").UTCTimestamp,
        value: point.pnl
    }));

    // Premium dark vibrant colors for donut
    const assetColors = ["#8b5cf6", "#3b82f6", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 w-full">
            {/* Main Portfolio Balance Card */}
            <div className="group relative rounded-3xl bg-[#0c0c14]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 hover:border-purple-500/40 transition-colors duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-600/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-700"></div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <PieChart className="size-5 text-purple-400" />
                    </div>
                    <div className="text-white text-lg font-bold">Portfolio Value</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">
                    {/* Donut Chart with modern aesthetic */}
                    <div className="relative w-40 h-40 shrink-0 filter drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform duration-500">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Track background */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
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
                                        strokeWidth="8"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={-offset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Value */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                                {mainAsset ? mainAsset.percent.toFixed(0) : "0"}%
                            </div>
                            <div className="text-xs font-semibold text-purple-300/70 tracking-widest uppercase mt-0.5">{mainAsset ? mainAsset.symbol : ""}</div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="flex-1 w-full space-y-6">
                        <div>
                            <div className="text-5xl font-black text-white tracking-tighter mb-1 font-mono">
                                ${total_balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${pnl.total >= 0 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                                >
                                    {pnl.total >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                    {Math.abs((pnl.total / total_balance_usd) * 100).toFixed(2)}%
                                </span>
                                <span className="text-xs text-gray-500 font-medium">All Time</span>
                            </div>
                        </div>

                        {/* Top Assets Legend */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            {allocation.slice(0, 4).map((item, index) => (
                                <div
                                    key={item.symbol}
                                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                                            style={{ backgroundColor: assetColors[index % assetColors.length], color: assetColors[index % assetColors.length] }}
                                        />
                                        <span className="text-white font-semibold text-sm">{item.symbol}</span>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">{item.percent.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance/PNL Card */}
            <div className="group relative rounded-3xl bg-[#0c0c14]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 hover:border-blue-500/40 transition-colors duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10 w-full justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <TrendingUp className="size-5 text-blue-400" />
                        </div>
                        <div className="text-white text-lg font-bold">Performance</div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 w-full min-h-[140px] relative z-10 mb-6 bg-gradient-to-b from-white/[0.02] to-transparent rounded-xl border border-white/[0.02] p-2">
                    <PnlLineChart data={chartData} />
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-[#12121a]/80 border border-white/[0.05] rounded-2xl p-4 flex flex-col items-center justify-center">
                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Total PNL</span>
                        <span
                            className={`text-xl font-bold tracking-tight font-mono ${pnl.total >= 0 ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" : "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]"}`}
                        >
                            {pnl.total >= 0 ? "+" : ""}${(pnl.total / 1000).toFixed(2)}K
                        </span>
                    </div>

                    <div className="bg-[#12121a]/80 border border-white/[0.05] rounded-2xl p-4 flex flex-col items-center justify-center">
                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Total TXNs</span>
                        <span className="text-xl font-bold tracking-tight text-white font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                            {transactions.total}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
