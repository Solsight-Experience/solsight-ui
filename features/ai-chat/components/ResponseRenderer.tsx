"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatResponseDto } from "@/types/dto";
import { TokenBriefCard } from "./cards/TokenBriefCard";
import { PortfolioSummaryCard } from "./cards/PortfolioSummaryCard";
import { NavigationCard } from "./cards/NavigationCard";
import { useTokenUIStore } from "@/features/token/stores/token.stores";
import { ArrowRightLeft, ArrowRight, Coins, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResponseRenderable = Pick<ChatResponseDto, "type" | "content" | "data">;

type TokenBriefData = Parameters<typeof TokenBriefCard>[0]["data"];
type PortfolioSummaryData = Parameters<typeof PortfolioSummaryCard>[0]["data"];
type NavigationData = Parameters<typeof NavigationCard>[0]["data"];

type TradeIntentData = {
    inputMint: string;
    outputMint: string;
    amount: string;
    mode?: "buy" | "sell";
    targetMint?: string;
    priceImpactPct?: number | null;
    priceImpactSeverity?: "safe" | "warning" | "danger" | "critical";
    slippageBps?: number;
};

function formatCompactNumber(val: string | number): string {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return String(val);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "k";
    if (num === 0) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(4).replace(/\.?0+$/, "");
}

const SEVERITY_CONFIG = {
    safe: null,
    warning: {
        label: "Price Impact",
        className: "border-amber-500/20 bg-amber-500/5 text-amber-400/80"
    },
    danger: {
        label: "High Price Impact",
        className: "border-red-500/20 bg-red-500/5 text-red-400/80"
    },
    critical: {
        label: "Very High Price Impact",
        className: "border-red-600/30 bg-red-600/10 text-red-400/90 animate-pulse"
    }
} as const;

const PriceImpactBadge: React.FC<{ severity: TradeIntentData["priceImpactSeverity"]; pct: number | null | undefined }> = ({ severity, pct }) => {
    if (!severity || severity === "safe" || pct === null || pct === undefined) return null;
    const cfg = SEVERITY_CONFIG[severity];
    if (!cfg) return null;
    const displayPct = (pct * 100).toFixed(2);
    return (
        <div className={cn("flex items-start gap-2 px-3 py-2 rounded-xl border", cfg.className)}>
            <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", severity === "warning" ? "text-amber-500" : "text-red-500")} />
            <p className="text-[10px] leading-relaxed font-medium min-w-0">
                {cfg.label}: {displayPct}%{severity && ". Please confirm before trading."}
            </p>
        </div>
    );
};

const TradeAutoAction: React.FC<{ data: TradeIntentData }> = ({ data }) => {
    const router = useRouter();
    // Use a ref instead of a timestamp check: fire navigation exactly once on mount.
    // The timestamp approach was unreliable because LLM processing (6-12s) makes
    // messages appear "stale" (> IS_RECENT_THRESHOLD) by the time this mounts.
    const hasTriggeredRef = React.useRef(false);

    useEffect(() => {
        // Guard: only run once per mount. Prevents re-triggering on history re-renders.
        if (hasTriggeredRef.current) return;

        const targetMint = data.targetMint || data.outputMint;
        if (!targetMint) return;

        hasTriggeredRef.current = true;

        useTokenUIStore.getState().setPendingTradeAction({
            mint: targetMint,
            amount: String(data.amount ?? ""),
            mode: data.mode || "buy",
            slippageBps: data.slippageBps
        });

        router.push(`/token/${targetMint}`);
    }, [data.amount, data.mode, data.outputMint, data.slippageBps, data.targetMint, router]);

    return (
        <div className="relative overflow-hidden group p-4 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 backdrop-blur-sm shadow-xl shadow-violet-500/5">
            {/* Background Glow Effect */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 blur-2xl rounded-full group-hover:bg-violet-500/20 transition-all duration-500" />

            <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white/90">Trade Preparation</h4>
                            <p className="text-[11px] text-muted-foreground">Redirecting to trading panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", data.mode === "sell" ? "bg-rose-400" : "bg-emerald-400")} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{data.mode || "buy"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Input</span>
                        <div className="flex items-center gap-2">
                            <Coins className="w-3.5 h-3.5 text-violet-400/80" />
                            <span className="text-xs font-semibold text-white/90 flex items-baseline gap-1">
                                {data.amount && <span className="text-violet-400 font-mono">{formatCompactNumber(data.amount)}</span>}
                                <span>{data.mode === "buy" ? "SOL" : data.targetMint?.slice(0, 4) + "..." + data.targetMint?.slice(-4)}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="p-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                            <ArrowRight className="w-3 h-3 text-violet-400" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Output</span>
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-white/90 text-right">
                                {data.mode === "buy" ? data.targetMint?.slice(0, 4) + "..." + data.targetMint?.slice(-4) : "SOL"}
                            </span>
                            <Coins className="w-3.5 h-3.5 text-indigo-400/80" />
                        </div>
                    </div>
                </div>

                {/* Slippage Display */}
                {data.slippageBps !== undefined && (
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-3 px-4 py-3 rounded-xl bg-black/20 border border-white/5">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Slippage</span>
                                <span className={cn("text-sm font-mono font-bold", data.slippageBps > 100 ? "text-amber-400" : "text-violet-400")}>
                                    {data.slippageBps} <span className="text-[10px] font-semibold text-white/50">bps</span>
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Equivalent</span>
                                <span className="text-sm font-semibold text-white/80">{(data.slippageBps / 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        {data.slippageBps > 100 && (
                            <div className="px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-2 text-amber-400/80">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] leading-relaxed font-medium min-w-0">High slippage may result in a worse execution price.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Price Impact Warning - Always at the bottom */}
                <PriceImpactBadge severity={data.priceImpactSeverity} pct={data.priceImpactPct} />
            </div>
        </div>
    );
};

export const ResponseRenderer: React.FC<{ response: ResponseRenderable }> = ({ response }) => {
    switch (response.type) {
        case "text":
            return <p>{response.content}</p>;
        case "token_brief":
            return <TokenBriefCard data={response.data as TokenBriefData} />;
        case "portfolio_summary":
            return <PortfolioSummaryCard data={response.data as PortfolioSummaryData} />;
        case "navigation":
            return <NavigationCard data={response.data as NavigationData} />;
        case "trade_intent":
            return <TradeAutoAction data={response.data as TradeIntentData} />;

        default:
            // Unrecognized types (e.g. portfolio_activities, portfolio_performance) —
            // render the LLM text content if available, otherwise render nothing.
            return response.content ? <p>{response.content}</p> : null;
    }
};

export default ResponseRenderer;
