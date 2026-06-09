"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Info, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { IF_CONFIG, IF_MIN_STAKE_SOL, IF_RESERVE_SOL, getSolscanTxUrl } from "../constants/program";
import { useIFStaking, IFStakeStatus } from "../hooks/useIFStaking";
import { useIFProgram } from "../hooks/useIFProgram";

interface StakeModalProps {
    open: boolean;
    onClose: () => void;
    walletPubkey: string | null;
    solBalance: number;
    connected: boolean;
    onSuccess?: () => void;
}

const STATUS_LABELS: Record<IFStakeStatus, string> = {
    idle: "Stake SOL",
    creating: "Initializing...",
    signing: "Waiting for signature...",
    confirming: "Confirming on-chain...",
    done: "Stake SOL",
    error: "Stake SOL"
};

export function StakeModal({ open, onClose, walletPubkey, solBalance, connected, onSuccess }: StakeModalProps) {
    const [amount, setAmount] = useState("");
    const networkLabel = IF_CONFIG.label;
    const { stakeState, handleStake } = useIFStaking(connected, walletPubkey, onSuccess);
    const { isLoading: clientLoading, isReady: clientReady } = useIFProgram(connected, walletPubkey);

    const loading = stakeState.status !== "idle" && stakeState.status !== "done" && stakeState.status !== "error";

    const maxStakeable = Math.max(0, solBalance - IF_RESERVE_SOL);

    const handleSubmit = async () => {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) return;
        await handleStake(parsed);
        if (stakeState.status === "done") setAmount("");
    };

    const amountNum = parseFloat(amount);
    const isValid = !isNaN(amountNum) && amountNum >= IF_MIN_STAKE_SOL && !!walletPubkey && clientReady;

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                if (!loading) onClose();
            }}
        >
            <DialogContent
                className="sm:max-w-md border-0 text-white p-0 overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, #110820 0%, #080612 100%)",
                    boxShadow: "0 25px 60px rgba(139,92,246,0.25)"
                }}
            >
                {/* Header gradient bar */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: "linear-gradient(90deg, #8b5cf6, #3b82f6, #8b5cf6)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-border 3s linear infinite"
                    }}
                />

                <div className="p-6 space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold tracking-tight">
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #fff 40%, #a78bfa)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}
                            >
                                Stake SOL
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Protocol card */}
                    <div className="flex items-center gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/8 px-4 py-3.5">
                        <ShieldCheck className="h-9 w-9 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-[13px]">Insurance Fund</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">SOL Market · {networkLabel} · Earn fees from protocol</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1">
                            <Zap className="h-3 w-3 text-purple-400" />
                            <span className="text-purple-400 font-bold text-[12px]">IF Yield</span>
                        </div>
                    </div>

                    {/* Loading program client */}
                    {clientLoading && (
                        <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/6 px-3.5 py-3 text-[12px] text-yellow-300">
                            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                            <span>Connecting to {networkLabel}...</span>
                        </div>
                    )}

                    {/* Available Balance */}
                    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Available Balance</p>
                        <p className="text-3xl font-extrabold text-white">
                            {solBalance.toFixed(4)} <span className="text-lg text-gray-400 font-semibold">SOL</span>
                        </p>
                    </div>

                    {/* Amount input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[13px] font-semibold text-gray-400">Amount to stake</label>
                            <button
                                className="text-[12px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                                onClick={() => setAmount(maxStakeable.toFixed(6))}
                                disabled={loading || clientLoading}
                            >
                                MAX
                            </button>
                        </div>
                        <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 focus-within:border-purple-500/50 transition-colors">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-white/20"
                                disabled={loading || clientLoading}
                            />
                            <span className="text-gray-400 font-semibold ml-2 text-[15px]">SOL</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-2">
                            Minimum {IF_MIN_STAKE_SOL} SOL · Reserve {IF_RESERVE_SOL} SOL for transaction fees
                        </p>
                    </div>

                    {/* Info banner */}
                    <div className="flex gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-500/6 px-3.5 py-3 text-[12px] text-blue-300">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                        <span className="leading-relaxed">
                            Your SOL will be deposited into the <strong className="text-white">Insurance Fund</strong>. You receive{" "}
                            <strong className="text-white">IF Shares</strong> and earn fees from protocol trading activity.
                        </span>
                    </div>

                    {stakeState.error && (
                        <div className="flex gap-2 text-[12px] text-red-400 rounded-xl bg-red-400/8 px-3.5 py-2.5 border border-red-400/20">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            {stakeState.error}
                        </div>
                    )}
                    {stakeState.status === "done" && stakeState.signature && (
                        <p className="text-[12px] text-green-400 rounded-xl bg-green-400/8 px-3.5 py-2.5 border border-green-400/20">
                            Staked successfully!{" "}
                            <a href={getSolscanTxUrl(stakeState.signature)} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                                View on Solscan ↗
                            </a>
                        </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            className="flex-1 rounded-2xl border border-white/10 py-3.5 text-[13px] font-semibold text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 rounded-2xl py-3.5 text-[13px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: isValid && !loading ? "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)" : "rgba(255,255,255,0.05)",
                                boxShadow: isValid && !loading ? "0 4px 20px rgba(139,92,246,0.30)" : "none"
                            }}
                            onClick={handleSubmit}
                            disabled={loading || !isValid}
                        >
                            {loading ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {STATUS_LABELS[stakeState.status]}
                                </span>
                            ) : (
                                STATUS_LABELS[stakeState.status]
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
