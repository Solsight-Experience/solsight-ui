"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, AlertCircle, Zap } from "lucide-react";
import { useLiquidStaking, type StakeActionSuccessPayload } from "../hooks/useLiquidStaking";
import type { LiquidPositionResponse } from "../lib/staking-api";
import { IF_MIN_STAKE_SOL, getSolscanTxUrl } from "../constants/program";
import { StakeAmountInput } from "./StakeAmountInput";
import type { VersionedTransaction } from "@solana/web3.js";

interface UnstakeModalProps {
    open: boolean;
    onClose: () => void;
    walletPubkey: string | null;
    liquidPosition: LiquidPositionResponse | null;
    isLoadingPosition: boolean;
    connected: boolean;
    signTransaction: ((tx: VersionedTransaction) => Promise<VersionedTransaction>) | null;
    ensureWalletReadyForUserAction: (actionLabel?: string) => boolean;
    onSuccess?: (payload?: StakeActionSuccessPayload) => void;
}

export function UnstakeModal({
    open,
    onClose,
    walletPubkey,
    liquidPosition,
    isLoadingPosition,
    connected,
    signTransaction,
    ensureWalletReadyForUserAction,
    onSuccess
}: UnstakeModalProps) {
    const { resolvedTheme } = useTheme();
    const { unstakeState, resetUnstakeState, handleUnstake } = useLiquidStaking(
        connected,
        walletPubkey,
        signTransaction,
        ensureWalletReadyForUserAction,
        onSuccess
    );

    const [amount, setAmount] = useState("");
    const loading = unstakeState.status === "signing" || unstakeState.status === "confirming";

    const hasPosition = !!liquidPosition && liquidPosition.estimatedSol > 0;
    const maxUnstake = liquidPosition?.estimatedSol ?? 0;
    const amountNum = parseFloat(amount);
    const isValid = !isNaN(amountNum) && amountNum >= IF_MIN_STAKE_SOL && amountNum <= maxUnstake;
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
        if (open) {
            setAmount("");
            resetUnstakeState();
        }
    }, [open, resetUnstakeState]);

    const handleClose = () => {
        setAmount("");
        resetUnstakeState();
        onClose();
    };

    const handleSubmit = async () => {
        const didUnstake = await handleUnstake(amountNum);
        if (didUnstake) setAmount("");
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
                    background: isDark ? "linear-gradient(145deg, #110d20 0%, #080612 100%)" : "#ffffff",
                    boxShadow: isDark ? "0 25px 60px rgba(249,115,22,0.15)" : "0 25px 60px rgba(15,23,42,0.18)"
                }}
            >
                <div
                    className="h-1 w-full"
                    style={{
                        background: "linear-gradient(90deg, #f97316, #f59e0b, #f97316)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-border 3s linear infinite"
                    }}
                />

                <div className="p-6 space-y-5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Unstake jitoSOL</DialogTitle>
                    </DialogHeader>

                    {isLoadingPosition && (
                        <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-gray-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-[13px]">Loading position...</span>
                        </div>
                    )}

                    {!isLoadingPosition && !hasPosition && (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <span className="text-4xl">🔍</span>
                            <p className="text-[13px] text-slate-500 dark:text-gray-400">
                                No liquid staking position found.
                                <br />
                                Stake SOL first.
                            </p>
                        </div>
                    )}

                    {!isLoadingPosition && hasPosition && (
                        <>
                            <div className="flex items-center gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/8 px-4 py-3.5">
                                <Zap className="h-9 w-9 text-orange-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">Current Position</p>
                                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                        ≈ {liquidPosition!.estimatedSol.toFixed(6)}{" "}
                                        <span className="text-base font-semibold text-slate-500 dark:text-gray-400">SOL</span>
                                    </p>
                                </div>
                            </div>

                            <StakeAmountInput
                                label="Amount to unstake"
                                amount={amount}
                                onAmountChange={setAmount}
                                onMax={() => setAmount(maxUnstake.toFixed(6))}
                                disabled={loading}
                                accent="orange"
                                helperText={
                                    <>
                                        Available: {maxUnstake.toFixed(6)} SOL · Min {IF_MIN_STAKE_SOL} SOL · No lockup, redeemed instantly
                                    </>
                                }
                            />

                            {unstakeState.error && (
                                <div className="flex gap-2 text-[12px] text-red-400 rounded-xl bg-red-400/8 px-3.5 py-2.5 border border-red-400/20">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    {unstakeState.error}
                                </div>
                            )}
                            {unstakeState.status === "done" && unstakeState.signature && (
                                <p className="text-[12px] text-green-400 rounded-xl bg-green-400/8 px-3.5 py-2.5 border border-green-400/20">
                                    Unstaked successfully!{" "}
                                    <a
                                        href={getSolscanTxUrl(unstakeState.signature)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline font-semibold"
                                    >
                                        View on Solscan ↗
                                    </a>
                                </p>
                            )}

                            <button
                                className="w-full cursor-pointer rounded-2xl py-3.5 text-[13px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                                style={{
                                    background: isValid && !loading ? "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" : "rgba(255,255,255,0.05)",
                                    boxShadow: isValid && !loading ? "0 4px 20px rgba(249,115,22,0.25)" : "none"
                                }}
                                onClick={handleSubmit}
                                disabled={loading || !isValid}
                            >
                                {loading ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {unstakeState.status === "signing" ? "Waiting for signature..." : "Confirming on-chain..."}
                                    </span>
                                ) : (
                                    "Unstake SOL"
                                )}
                            </button>
                        </>
                    )}

                    <button
                        className="w-full cursor-pointer rounded-2xl border border-slate-200 py-3 text-[13px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
