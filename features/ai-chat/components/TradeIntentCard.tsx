"use client";

import React, { useState, useEffect } from "react";
import { ArrowRightLeft, ArrowRight, Coins, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tokenApi } from "@/features/token/services/token.services";
import { AiSwapModal } from "./AiSwapModal";
import { formatAddress, formatCompactNumber } from "@/lib/formatters";
import { COMMON_LABELS } from "@/lib/constants";

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

export const TradeIntentCard: React.FC<{ data: TradeIntentData }> = ({ data }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [inputSymbol, setInputSymbol] = useState(() => formatAddress(data.inputMint));
    const [outputSymbol, setOutputSymbol] = useState(() => formatAddress(data.outputMint));

    useEffect(() => {
        let mounted = true;

        const loadSymbols = async () => {
            const inputLower = data.inputMint.toLowerCase();
            const outputLower = data.outputMint.toLowerCase();

            if (!COMMON_LABELS[inputLower] && data.inputMint) {
                try {
                    const detail = await tokenApi.getTokenDetail(data.inputMint);
                    if (mounted && detail.symbol) setInputSymbol(detail.symbol);
                } catch {}
            }
            if (!COMMON_LABELS[outputLower] && data.outputMint) {
                try {
                    const detail = await tokenApi.getTokenDetail(data.outputMint);
                    if (mounted && detail.symbol) setOutputSymbol(detail.symbol);
                } catch {}
            }
        };

        loadSymbols();
        return () => {
            mounted = false;
        };
    }, [data.inputMint, data.outputMint]);

    const severity = data.priceImpactSeverity;
    const pct = data.priceImpactPct;
    const hasWarning = severity && severity !== "safe" && pct !== null && pct !== undefined;

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
                            <h4 className="text-sm font-semibold text-white/90">Prepare Swap</h4>
                            <p className="text-[11px] text-muted-foreground">Swap is prepared and ready for review</p>
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
                                <span className="text-white/80">{inputSymbol}</span>
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
                            <span className="text-xs font-semibold text-white/80 text-right">{outputSymbol}</span>
                            <Coins className="w-3.5 h-3.5 text-indigo-400/80" />
                        </div>
                    </div>
                </div>

                {/* Slippage Display */}
                {data.slippageBps !== undefined && (
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-3 px-4 py-2 rounded-xl bg-black/20 border border-white/5 text-xs">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Slippage</span>
                                <span className={cn("font-mono font-bold", data.slippageBps > 100 ? "text-amber-400" : "text-violet-400")}>
                                    {data.slippageBps} <span className="text-[9px] font-semibold text-white/50">bps</span>
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Equivalent</span>
                                <span className="font-semibold text-white/80">{(data.slippageBps / 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        {data.slippageBps > 100 && (
                            <div className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-2 text-amber-400/80">
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] leading-relaxed font-medium">High slippage may result in a worse execution price.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Price Impact Badge */}
                {hasWarning && severity && pct !== null && pct !== undefined && (
                    <div className={cn("flex items-start gap-2 px-3 py-1.5 rounded-xl border", SEVERITY_CONFIG[severity]?.className)}>
                        <AlertTriangle className={cn("w-3 h-3 shrink-0 mt-0.5", severity === "warning" ? "text-amber-500" : "text-red-500")} />
                        <p className="text-[9px] leading-relaxed font-medium">
                            {SEVERITY_CONFIG[severity]?.label}: {(pct * 100).toFixed(2)}%
                        </p>
                    </div>
                )}

                {/* Open Modal Button */}
                <Button
                    onClick={() => setModalOpen(true)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10 cursor-pointer"
                >
                    <span>Confirm Swap</span>
                </Button>
            </div>

            {/* Modal Dialog */}
            <AiSwapModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                inputMint={data.inputMint}
                outputMint={data.outputMint}
                amount={data.amount}
                slippageBps={data.slippageBps}
            />
        </div>
    );
};
