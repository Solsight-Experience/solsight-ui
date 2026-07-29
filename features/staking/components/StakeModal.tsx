"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Info, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { IF_CONFIG, IF_MIN_STAKE_SOL, IF_RESERVE_SOL, getSolscanTxUrl } from "../constants/program";
import { DEFAULT_STAKING_PROTOCOL, getStakingProtocolMeta, type StakingProtocolId } from "../constants/protocols";
import { useLiquidStaking, type StakeStatus, type StakeActionSuccessPayload } from "../hooks/useLiquidStaking";
import { useIFProgram } from "../hooks/useIFProgram";
import { StakeAmountInput } from "./StakeAmountInput";
import type { VersionedTransaction } from "@solana/web3.js";

interface StakeModalProps {
    open: boolean;
    onClose: () => void;
    walletPubkey: string | null;
    solBalance: number;
    connected: boolean;
    signTransaction: ((tx: VersionedTransaction) => Promise<VersionedTransaction>) | null;
    ensureWalletReadyForUserAction: (actionLabel?: string) => boolean;
    onSuccess?: (payload?: StakeActionSuccessPayload) => void;
    protocol?: StakingProtocolId;
}

const STATUS_LABELS: Record<StakeStatus, string> = {
    idle: "Stake SOL",
    signing: "Waiting for signature...",
    confirming: "Confirming on-chain...",
    done: "Stake SOL",
    error: "Stake SOL"
};

export function StakeModal({
    open,
    onClose,
    walletPubkey,
    solBalance,
    connected,
    signTransaction,
    ensureWalletReadyForUserAction,
    onSuccess,
    protocol = DEFAULT_STAKING_PROTOCOL
}: StakeModalProps) {
    const { resolvedTheme } = useTheme();
    const [amount, setAmount] = useState("");
    const networkLabel = IF_CONFIG.label;
    const protocolMeta = getStakingProtocolMeta(protocol);
    const { stakeState, resetStakeState, handleStake } = useLiquidStaking(
        connected,
        walletPubkey,
        signTransaction,
        ensureWalletReadyForUserAction,
        onSuccess,
        protocol
    );
    const { isReady: clientReady } = useIFProgram(connected, walletPubkey);

    const loading = stakeState.status !== "idle" && stakeState.status !== "done" && stakeState.status !== "error";

    const maxStakeable = Math.max(0, solBalance - IF_RESERVE_SOL);

    const handleSubmit = async () => {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) return;
        const didStake = await handleStake(parsed);
        if (didStake) setAmount("");
    };

    const amountNum = parseFloat(amount);
    const isValid = !isNaN(amountNum) && amountNum >= IF_MIN_STAKE_SOL && !!walletPubkey && clientReady;
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
        if (open) {
            setAmount("");
            resetStakeState();
        }
    }, [open, resetStakeState]);

    const handleClose = () => {
        setAmount("");
        resetStakeState();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                if (!loading) handleClose();
            }}
        >
            <DialogContent
                className="overflow-hidden border-0 p-0 text-slate-950 sm:max-w-md dark:text-white"
                style={{
                    background: isDark ? "linear-gradient(145deg, #110820 0%, #080612 100%)" : "#ffffff",
                    boxShadow: isDark ? "0 25px 60px rgba(139,92,246,0.25)" : "0 25px 60px rgba(15,23,42,0.18)"
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
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Stake SOL</DialogTitle>
                    </DialogHeader>

                    {/* Protocol card */}
                    <div className="flex items-center gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/8 px-4 py-3.5">
                        <ShieldCheck className="h-9 w-9 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{protocolMeta.label} Staking Pool</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-400">SOL Market · {networkLabel} · Earn fees from protocol</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1">
                            <Zap className="h-3 w-3 text-purple-400" />
                            <span className="text-purple-400 font-bold text-[12px]">Fee Yield</span>
                        </div>
                    </div>

                    {/* Available Balance */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/8 dark:bg-white/4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">Available Balance</p>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {solBalance.toFixed(4)} <span className="text-lg font-semibold text-slate-500 dark:text-gray-400">SOL</span>
                        </p>
                    </div>

                    {/* Amount input */}
                    <StakeAmountInput
                        label="Amount to stake"
                        amount={amount}
                        onAmountChange={setAmount}
                        onMax={() => setAmount(maxStakeable.toFixed(6))}
                        disabled={loading}
                        accent="purple"
                        helperText={
                            <>
                                Minimum {IF_MIN_STAKE_SOL} SOL · Reserve {IF_RESERVE_SOL} SOL for transaction fees
                            </>
                        }
                    />

                    {/* Info banner */}
                    <div className="flex gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-3 text-[12px] text-blue-700 dark:bg-blue-500/6 dark:text-blue-300">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                        <span className="leading-relaxed">
                            Your SOL is swapped into <strong className="text-slate-900 dark:text-white">{protocolMeta.lstSymbol}</strong>, held directly in your
                            own wallet. No lockup — unstake back to SOL any time.
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
                            className="flex-1 cursor-pointer rounded-2xl border border-slate-200 py-3.5 text-[13px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 cursor-pointer rounded-2xl py-3.5 text-[13px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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
