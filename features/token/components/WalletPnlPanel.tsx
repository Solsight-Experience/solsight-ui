"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNumber, formatTimeAgo } from "../utils/token.utils";
import type { Holder } from "../types/token.types";
import { PnlMiniChart } from "./PnlMiniChart";
import type { UTCTimestamp } from "lightweight-charts";
import { numberFormatter } from "@/lib/formatters";

interface WalletPnlPanelProps {
    holder: Holder;
    tokenSymbol?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type TabType = "positions" | "history" | "activity";
type TimePeriod = "1D" | "7D" | "30D" | "ALL";

const formatHolderDuration = (firstTxTime: number): string => {
    if (!firstTxTime || firstTxTime <= 0) return "—";

    const now = Date.now();
    const diffMs = now - firstTxTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMinutes > 0) return `${diffMinutes}m`;
    return "<1m";
};

export const WalletPnlPanel: React.FC<WalletPnlPanelProps> = ({ holder, tokenSymbol = "TOKEN", open, onOpenChange }) => {
    const [activeTab, setActiveTab] = useState<TabType>("positions");
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("30D");
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(holder.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const shortAddr = `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`;
    const totalPnl = (holder.realized_pnl || 0) + (holder.unrealized_pnl || 0);
    const totalTxns = holder.buy_tx_count + holder.sell_tx_count;
    const winRate = totalTxns > 0 ? (holder.buy_tx_count / totalTxns) * 100 : 0; // Simplified

    // Calculate ROI
    const costBasis = holder.total_bought || 0;
    const roi = costBasis > 0 ? (totalPnl / costBasis) * 100 : 0;

    // Generate PnL chart data based on holder's trading activity
    // This simulates cumulative PnL over time - in production, this would come from API
    const pnlChartData = useMemo(() => {
        const now = Math.floor(Date.now() / 1000);
        const daySeconds = 86400;

        // Determine number of data points based on time period
        let days: number;
        switch (timePeriod) {
            case "1D":
                days = 1;
                break;
            case "7D":
                days = 7;
                break;
            case "30D":
                days = 30;
                break;
            case "ALL":
                days = 90;
                break;
            default:
                days = 30;
        }

        // If no trading data, return empty
        if (totalTxns === 0) return [];

        const data: { time: UTCTimestamp; value: number }[] = [];
        const pointsPerDay = timePeriod === "1D" ? 24 : 1; // hourly for 1D, daily otherwise
        const totalPoints = days * pointsPerDay;
        const intervalSeconds = (days * daySeconds) / totalPoints;

        // Scale to show realistic progression
        let cumulativePnl = 0;

        for (let i = totalPoints; i >= 0; i--) {
            const time = (now - i * intervalSeconds) as UTCTimestamp;

            // Simulate gradual PnL accumulation with some variance
            const progress = (totalPoints - i) / totalPoints;
            const basePnl = totalPnl * progress;
            // Add slight variance for more realistic chart
            const variance = (Math.sin(i * 0.5) * 0.1 + Math.random() * 0.05 - 0.025) * Math.abs(totalPnl);
            cumulativePnl = basePnl + variance;

            data.push({
                time,
                value: cumulativePnl
            });
        }

        // Ensure last point matches actual total PnL
        if (data.length > 0) {
            data[data.length - 1].value = totalPnl;
        }

        return data;
    }, [totalPnl, totalTxns, timePeriod]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#0d0d1a] border-gray-800 p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-4 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Avatar placeholder */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {holder.name?.[0]?.toUpperCase() || holder.address.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <DialogTitle className="text-white flex items-center gap-2">
                                    {holder.name || shortAddr}
                                    <button onClick={handleCopy} className="text-gray-500 hover:text-gray-300 transition-colors" title="Copy address">
                                        {copied ? (
                                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </DialogTitle>
                                <p className="text-xs text-gray-500">{shortAddr}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.open(`https://solscan.io/account/${holder.address}`, "_blank")}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                title="View on Solscan"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Balance Section */}
                <div className="p-4 border-b border-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Left: Balance Info */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Value</p>
                                <p className="text-2xl font-bold text-white">{numberFormatter.format(holder.remaining_usd)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Unrealized PnL</p>
                                    <p className={`text-sm font-semibold ${(holder.unrealized_pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {(holder.unrealized_pnl || 0) >= 0 ? "+" : ""}
                                        {numberFormatter.format(holder.unrealized_pnl || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Realized PnL</p>
                                    <p className={`text-sm font-semibold ${(holder.realized_pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {(holder.realized_pnl || 0) >= 0 ? "+" : ""}
                                        {numberFormatter.format(holder.realized_pnl || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Holdings Breakdown */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Holdings</p>
                                <p className="text-lg font-semibold text-white">
                                    {numberFormatter.format(holder.balance)} <span className="text-gray-400 text-sm">{tokenSymbol}</span>
                                </p>
                                <p className="text-xs text-purple-400">{holder.balance_percent.toFixed(3)}% of supply</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Holder Since</p>
                                <p className="text-sm text-white">{formatHolderDuration(holder.first_tx_time)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PnL Chart */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">PnL Over Time</h3>
                        <div className="flex gap-1">
                            {(["1D", "7D", "30D", "ALL"] as TimePeriod[]).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimePeriod(period)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        timePeriod === period
                                            ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                                            : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <PnlMiniChart data={pnlChartData} height={120} />
                </div>

                {/* Performance Stats */}
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-white mb-3">Performance</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                            <p className={`text-lg font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {totalPnl >= 0 ? "+" : ""}
                                {formatNumber(totalPnl)}
                            </p>
                            <p className="text-xs text-gray-500">Total PnL</p>
                        </div>
                        <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                            <p className={`text-lg font-bold ${roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {roi >= 0 ? "+" : ""}
                                {roi.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">ROI</p>
                        </div>
                        <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{totalTxns}</p>
                            <p className="text-xs text-gray-500">Total TXNs</p>
                        </div>
                        <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-blue-400">{winRate.toFixed(0)}%</p>
                            <p className="text-xs text-gray-500">Win Rate</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800">
                    <div className="flex">
                        {[
                            { id: "positions" as TabType, label: "Active Position" },
                            { id: "history" as TabType, label: "History" },
                            { id: "activity" as TabType, label: "Activity" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tab.id ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 max-h-[200px] overflow-y-auto">
                    {activeTab === "positions" && (
                        <div className="space-y-2">
                            {/* Current position for this token */}
                            <div className="bg-[#1a1a2e] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500"></div>
                                        <span className="font-medium text-white">{tokenSymbol}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {totalPnl >= 0 ? "+" : ""}
                                        {formatNumber(totalPnl)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <p className="text-gray-500">Bought</p>
                                        <p className="text-green-400">{formatNumber(holder.total_bought)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Sold</p>
                                        <p className="text-red-400">{formatNumber(holder.total_sold)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Remaining</p>
                                        <p className="text-white">{formatNumber(holder.remaining_usd)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Avg Buy</p>
                                        <p className="text-white">${holder.avg_buy_price > 0 ? holder.avg_buy_price.toFixed(6) : "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-2">
                            {/* Trade history - would fetch from API */}
                            <div className="text-center py-4">
                                <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <p className="text-sm text-gray-500">Trade history coming soon</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="space-y-2">
                            {/* Recent activity */}
                            <div className="flex items-center justify-between p-2 bg-[#1a1a2e] rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white">Buy</p>
                                        <p className="text-xs text-gray-500">{formatTimeAgo(holder.last_active_ts)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-400">+{formatNumber(holder.total_bought / Math.max(holder.buy_tx_count, 1))}</p>
                                    <p className="text-xs text-gray-500">{holder.buy_tx_count} txns</p>
                                </div>
                            </div>
                            {holder.sell_tx_count > 0 && (
                                <div className="flex items-center justify-between p-2 bg-[#1a1a2e] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white">Sell</p>
                                            <p className="text-xs text-gray-500">Recent</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-red-400">-{formatNumber(holder.total_sold / Math.max(holder.sell_tx_count, 1))}</p>
                                        <p className="text-xs text-gray-500">{holder.sell_tx_count} txns</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
