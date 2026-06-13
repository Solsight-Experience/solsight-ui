import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Wallet, PieChart, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createChart, AreaSeries, UTCTimestamp } from "lightweight-charts";
import { miniChartOptions, areaSeriesPresets } from "@/lib/chart-config";
import { usePortfolioOverview, usePnlChart } from "../hooks/portfolio.hooks";
import { MockConnectWalletDialog } from "./MockConnectWalletDialog";
import { currencyFormatter } from "@/lib/formatters";

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
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 flex flex-col items-center justify-center">
                    <AlertTriangle className="size-8 text-red-400 mb-3 animate-pulse" />
                    <div className="text-red-400 text-base font-semibold mb-1">Error Loading Data</div>
                    <div className="text-red-400/60 text-sm">{overviewError instanceof Error ? overviewError.message : "Network error. Please try again."}</div>
                </div>
            </div>
        );
    }

    if (overviewLoading || pnlLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
                {[0, 1].map((i) => (
                    <div key={i} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 h-[220px] animate-pulse">
                        <div className="h-3 w-28 rounded-full bg-black/[0.07] dark:bg-white/[0.07] mb-6" />
                        <div className="space-y-3">
                            <div className="h-8 w-40 rounded-lg bg-black/[0.07] dark:bg-white/[0.07]" />
                            <div className="h-3 w-full rounded-full bg-black/[0.05] dark:bg-white/[0.05]" />
                            <div className="h-3 w-3/4 rounded-full bg-black/[0.05] dark:bg-white/[0.05]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!overview || !pnlData) return null;

    const { allocation, total_balance_usd, pnl, transactions } = overview;

    // Premium Empty State
    if (!allocation || allocation.length === 0) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 w-full">
                {/* Empty State Card */}
                <div className="group relative rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-violet-500/30 transition-all duration-300 shadow-[var(--shadow-card)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700 -z-10"></div>

                    <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center h-full min-h-[360px] relative z-10">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full animate-pulse"></div>
                            <div className="w-24 h-24 bg-[var(--surface-panel)] border border-[var(--border-subtle)] rounded-3xl flex items-center justify-center relative z-10 shadow-lg group-hover:scale-105 transition-transform duration-500 rotate-[-5deg]">
                                <Wallet className="size-10 text-violet-500 dark:text-violet-400" />
                            </div>
                            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[var(--surface-panel)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center rotate-[15deg] shadow-md z-20 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500">
                                <Sparkles className="size-5 text-blue-400" />
                            </div>
                        </div>

                        <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">No Assets Yet</h3>
                        <p className="text-[var(--text-muted)] max-w-sm mb-10 text-base leading-relaxed">
                            Connect your wallet to track your Web3 portfolio across chains, analyze performance, and discover market opportunities.
                        </p>

                        <div className="relative group/btn cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-60 group-hover/btn:opacity-100 group-hover/btn:blur-md transition duration-300"></div>
                            <button
                                onClick={() => setOpen(true)}
                                className="relative flex h-11 items-center justify-center gap-2 rounded-xl
                                           bg-[var(--surface-panel)] border border-[var(--border-default)]
                                           px-8 text-[13px] font-semibold text-[var(--text-primary)]
                                           hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-300
                                           transition-all duration-200"
                            >
                                <span>Connect Wallet</span>
                            </button>
                        </div>
                    </div>
                    <MockConnectWalletDialog open={open} onOpenChange={setOpen} />
                </div>

                {/* Simulated Data Preview (faded) */}
                <div className="rounded-2xl overflow-hidden bg-[var(--surface-card)] border border-[var(--border-faint)] p-8 opacity-40 select-none pointer-events-none relative shadow-[var(--shadow-card)]">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="flex items-center gap-2 mb-8">
                        <TrendingUp className="size-6 text-purple-400/50" />
                        <div className="text-[var(--text-primary)] text-xl font-bold">Performance</div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-28 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-2xl w-full flex items-end p-2 gap-1 overflow-hidden">
                            {[20, 45, 30, 60, 40, 75, 50, 90, 70, 100].map((h, i) => (
                                <div key={i} className="bg-violet-500/20 w-full rounded-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-[var(--border-faint)]">
                            <span className="text-[var(--text-muted)] font-medium">Total Profit</span>
                            <span className="text-emerald-500/70 font-bold flex items-center gap-1">
                                <ArrowUpRight className="size-4" /> $12,450
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-[var(--text-muted)] font-medium">Win Rate</span>
                            <span className="text-[var(--text-secondary)] font-bold">68.5%</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 w-full">
            {/* Main Portfolio Balance Card */}
            <div className="group relative rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-4 sm:p-5 hover:border-violet-500/30 transition-colors duration-300 shadow-[var(--shadow-card)] overflow-hidden">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-600/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-700"></div>

                <div className="flex items-center gap-2 mb-5 relative z-10">
                    <div className="p-1.5 bg-violet-500/10 rounded-md border border-violet-500/20">
                        <PieChart className="size-3.5 text-violet-500 dark:text-violet-400" />
                    </div>
                    <div className="text-[var(--text-primary)] text-sm font-bold">Portfolio Value</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                    {/* Donut Chart with modern aesthetic */}
                    <div className="relative w-28 h-28 shrink-0 dark:drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform duration-500">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Track background */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                            {allocation.map((item, index) => {
                                const startPercentage = allocation.slice(0, index).reduce((sum, a) => sum + a.percent, 0);
                                const offset = (circumference * startPercentage) / 100;
                                const dashArray = `${(circumference * item.percent) / 100} ${circumference}`;

                                return (
                                    <circle
                                        key={`${item.symbol}-${index}`}
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
                            <div className="text-xl font-black text-[var(--text-primary)]">{mainAsset ? mainAsset.percent.toFixed(0) : "0"}%</div>
                            <div className="text-[9px] font-semibold text-violet-500 dark:text-violet-300/70 tracking-widest uppercase mt-0.5">
                                {mainAsset ? mainAsset.symbol : ""}
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <div className="text-3xl font-black text-[var(--text-primary)] tracking-tighter mb-1 font-mono">
                                ${total_balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold
                                    ${
                                        pnl.total >= 0
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                    }`}
                                >
                                    {pnl.total >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                    {Math.abs((pnl.total / total_balance_usd) * 100).toFixed(2)}%
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)] font-medium">All Time</span>
                            </div>
                        </div>

                        {/* Top Assets Legend */}
                        <div className="grid grid-cols-2 gap-2">
                            {allocation.slice(0, 4).map((item, index) => (
                                <div
                                    key={`${item.symbol}-${index}`}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg
                                               bg-[var(--surface-panel)] border border-[var(--border-faint)]
                                               hover:border-[var(--border-subtle)] transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: assetColors[index % assetColors.length] }} />
                                        <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">{item.symbol}</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-[var(--text-muted)]">{item.percent.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance/PNL Card */}
            <div className="group relative rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-4 sm:p-5 hover:border-blue-500/25 transition-colors duration-300 shadow-[var(--shadow-card)] flex flex-col">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700"></div>

                <div className="flex items-center gap-2 mb-4 relative z-10 w-full justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                            <TrendingUp className="size-3.5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="text-[var(--text-primary)] text-sm font-bold">Performance</div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 w-full min-h-[120px] relative z-10 mb-3 bg-[var(--surface-panel)] rounded-xl border border-[var(--border-faint)] p-2">
                    <PnlLineChart data={chartData} />
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 gap-2 relative z-10">
                    <div className="bg-[var(--surface-panel)] border border-[var(--border-faint)] rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Total PNL</span>
                        <span
                            className={`text-sm font-bold tracking-tight font-mono ${pnl.total >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                        >
                            {pnl.total > 0 ? "+" : ""}
                            {currencyFormatter.format(pnl.total)}
                        </span>
                    </div>
                    <div className="bg-[var(--surface-panel)] border border-[var(--border-faint)] rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Total TXNs</span>
                        <span className="text-sm font-bold tracking-tight font-mono text-[var(--text-primary)]">{transactions.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
