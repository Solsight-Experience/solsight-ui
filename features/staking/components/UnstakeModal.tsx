"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";
import { Loader2, Clock, AlertCircle, CheckCircle2, ArrowUpFromLine } from "lucide-react";
import { useIFStaking, IFStakeStatus, type StakeActionSuccessPayload } from "../hooks/useIFStaking";
import { IFPosition } from "../hooks/useIFPositions";
import { IF_MIN_STAKE_SOL, getSolscanTxUrl } from "../constants/program";
import type { VersionedTransaction } from "@solana/web3.js";

interface UnstakeModalProps {
    open: boolean;
    onClose: () => void;
    walletPubkey: string | null;
    ifPosition: IFPosition | null;
    isLoadingPosition: boolean;
    connected: boolean;
    signTransaction: ((tx: VersionedTransaction) => Promise<VersionedTransaction>) | null;
    ensureWalletReadyForUserAction: (actionLabel?: string) => boolean;
    onSuccess?: (payload?: StakeActionSuccessPayload) => void;
}

const REQUEST_LABELS: Record<IFStakeStatus, string> = {
    idle: "Request Unstake",
    creating: "Processing...",
    signing: "Waiting for signature...",
    confirming: "Confirming on-chain...",
    done: "Request Unstake",
    error: "Request Unstake"
};

const WITHDRAW_LABELS: Record<IFStakeStatus, string> = {
    idle: "Withdraw SOL",
    creating: "Processing...",
    signing: "Waiting for signature...",
    confirming: "Confirming on-chain...",
    done: "Continue to Unstake",
    error: "Withdraw SOL"
};

const UNSTAKE_AMOUNT_FORMATTER = new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 9 });

export function UnstakeModal({
    open,
    onClose,
    walletPubkey,
    ifPosition,
    isLoadingPosition,
    connected,
    signTransaction,
    ensureWalletReadyForUserAction,
    onSuccess
}: UnstakeModalProps) {
    const { resolvedTheme } = useTheme();
    const { requestUnstakeState, unstakeState, resetRequestUnstakeState, resetUnstakeState, handleRequestUnstake, handleUnstake } = useIFStaking(
        connected,
        walletPubkey,
        signTransaction,
        ensureWalletReadyForUserAction,
        onSuccess
    );

    const [unstakeAmount, setUnstakeAmount] = useState("");

    const requestLoading = requestUnstakeState.status !== "idle" && requestUnstakeState.status !== "done" && requestUnstakeState.status !== "error";

    const withdrawLoading = unstakeState.status !== "idle" && unstakeState.status !== "done" && unstakeState.status !== "error";

    const anyLoading = requestLoading || withdrawLoading;

    const hasPosition = !!ifPosition && ifPosition.estimatedSol > 0;
    const hasPendingRequest = !!ifPosition && Number(ifPosition.lastWithdrawRequestShares) > 0;
    const canWithdraw = !!ifPosition?.canWithdraw;
    const shouldStayOnWithdrawStep = unstakeState.status === "done";
    const showRequestStep = !shouldStayOnWithdrawStep && !isLoadingPosition && hasPosition && !hasPendingRequest;
    const showCooldownStep = !shouldStayOnWithdrawStep && !isLoadingPosition && hasPendingRequest && !canWithdraw;
    const showWithdrawStep = !isLoadingPosition && (shouldStayOnWithdrawStep || (hasPendingRequest && canWithdraw));

    const cooldownEndsDate = hasPendingRequest && ifPosition!.cooldownEndsAt > 0 ? new Date(ifPosition!.cooldownEndsAt * 1000).toLocaleString("en-US") : null;

    const unstakeAmountNum = parseFloat(unstakeAmount);
    const maxUnstake = ifPosition?.estimatedSol ?? 0;
    const isUnstakeValid = !isNaN(unstakeAmountNum) && unstakeAmountNum >= IF_MIN_STAKE_SOL && unstakeAmountNum <= maxUnstake;
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
        if (open) {
            setUnstakeAmount("");
            resetRequestUnstakeState();
            resetUnstakeState();
        }
    }, [open, resetRequestUnstakeState, resetUnstakeState]);

    const handleClose = () => {
        setUnstakeAmount("");
        resetRequestUnstakeState();
        resetUnstakeState();
        onClose();
    };

    const handleWithdrawAction = () => {
        if (unstakeState.status === "done") {
            setUnstakeAmount("");
            resetRequestUnstakeState();
            resetUnstakeState();
            return;
        }

        void handleUnstake();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                if (!anyLoading) handleClose();
            }}
        >
            <DialogContent
                className="overflow-hidden border-0 p-0 text-slate-950 sm:max-w-md dark:text-white"
                style={{
                    background: isDark ? "linear-gradient(145deg, #110d20 0%, #080612 100%)" : "#ffffff",
                    boxShadow: isDark ? "0 25px 60px rgba(249,115,22,0.15)" : "0 25px 60px rgba(15,23,42,0.18)"
                }}
            >
                {/* Header gradient bar */}
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
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Unstake SOL</DialogTitle>
                    </DialogHeader>

                    {/* Loading state */}
                    {isLoadingPosition && (
                        <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-gray-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-[13px]">Loading position...</span>
                        </div>
                    )}

                    {/* No position */}
                    {!isLoadingPosition && !hasPosition && !hasPendingRequest && (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <span className="text-4xl">🔍</span>
                            <p className="text-[13px] text-slate-500 dark:text-gray-400">
                                No IF position found.
                                <br />
                                Stake SOL first.
                            </p>
                        </div>
                    )}

                    {/* Current IF position */}
                    {!isLoadingPosition && hasPosition && (
                        <div className="space-y-1 rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-4 dark:bg-purple-500/8">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400/70">Current Position</p>
                            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                ≈ {ifPosition!.estimatedSol.toFixed(6)} <span className="text-base font-semibold text-slate-500 dark:text-gray-400">SOL</span>
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-gray-500">{ifPosition!.ifShares} IF Shares</p>
                        </div>
                    )}

                    {/* Step 1: Request Remove (no pending request yet) */}
                    {showRequestStep && (
                        <div className="space-y-3">
                            <div className="flex gap-2.5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-3.5 py-3 text-[12px] text-yellow-700 dark:bg-yellow-500/6 dark:text-yellow-300">
                                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-400" />
                                <span className="leading-relaxed">
                                    <strong className="text-slate-900 dark:text-white">Submit a withdrawal request.</strong> Once the cooldown ends, you can
                                    withdraw your SOL.
                                </span>
                            </div>

                            {/* Amount input */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[13px] font-semibold text-slate-600 dark:text-gray-400">Amount to unstake</label>
                                    <button
                                        className="cursor-pointer text-[12px] font-bold text-orange-400 transition-colors hover:text-orange-300 disabled:cursor-not-allowed"
                                        onClick={() => setUnstakeAmount(maxUnstake.toFixed(6))}
                                        disabled={requestLoading}
                                    >
                                        MAX
                                    </button>
                                </div>
                                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-orange-500/50 dark:border-white/10 dark:bg-white/5">
                                    <NumbericInput
                                        mode="string"
                                        decimals={9}
                                        formatter={UNSTAKE_AMOUNT_FORMATTER}
                                        min={0}
                                        value={unstakeAmount}
                                        onChange={setUnstakeAmount}
                                        placeholder="0.00"
                                        containerClassName="flex-1"
                                        className="flex-1 bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-white/20"
                                        disabled={requestLoading}
                                    />
                                    <span className="ml-2 text-[14px] font-semibold text-slate-500 dark:text-gray-400">SOL</span>
                                </div>
                                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-gray-600">
                                    Available: {maxUnstake.toFixed(6)} SOL · Min {IF_MIN_STAKE_SOL} SOL
                                </p>
                            </div>

                            {requestUnstakeState.error && (
                                <div className="flex gap-2 text-[12px] text-red-400 rounded-xl bg-red-400/8 px-3.5 py-2.5 border border-red-400/20">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    {requestUnstakeState.error}
                                </div>
                            )}

                            <button
                                className="w-full cursor-pointer rounded-2xl py-3.5 text-[13px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                                style={{
                                    background:
                                        !requestLoading && isUnstakeValid ? "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" : "rgba(255,255,255,0.05)",
                                    boxShadow: !requestLoading && isUnstakeValid ? "0 4px 20px rgba(249,115,22,0.25)" : "none"
                                }}
                                onClick={() => ifPosition && handleRequestUnstake(unstakeAmountNum, ifPosition)}
                                disabled={requestLoading || !walletPubkey || !isUnstakeValid || !ifPosition}
                            >
                                {requestLoading ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {REQUEST_LABELS[requestUnstakeState.status]}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <ArrowUpFromLine className="h-4 w-4" />
                                        {REQUEST_LABELS[requestUnstakeState.status]}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Pending — waiting for cooldown */}
                    {showCooldownStep && (
                        <div className="space-y-3">
                            <div className="space-y-2 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-4 dark:bg-orange-500/8">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-400" />
                                    <p className="text-[13px] font-bold text-orange-700 dark:text-orange-300">Awaiting cooldown</p>
                                </div>
                                <p className="text-[12px] leading-relaxed text-slate-600 dark:text-gray-400">
                                    Withdrawal request of{" "}
                                    <strong className="text-slate-900 dark:text-white">{ifPosition!.lastWithdrawRequestValue.toFixed(6)} SOL</strong> is in the
                                    cooldown period.
                                    {cooldownEndsDate && (
                                        <span className="mt-1 block font-semibold text-orange-700/80 dark:text-orange-300/70">
                                            Available at: {cooldownEndsDate}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <p className="text-center text-[11px] text-slate-500 dark:text-gray-600">The Withdraw button will unlock once the cooldown ends.</p>
                        </div>
                    )}

                    {/* Step 3: Ready to withdraw */}
                    {showWithdrawStep && (
                        <div className="space-y-3">
                            <div className="space-y-2 rounded-2xl border border-green-500/25 bg-green-500/10 px-4 py-4 dark:bg-green-500/8">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    <p className="text-[13px] font-bold text-green-700 dark:text-green-300">
                                        {shouldStayOnWithdrawStep ? "Withdraw complete!" : "Cooldown complete!"}
                                    </p>
                                </div>
                                <p className="text-[12px] text-slate-600 dark:text-gray-400">
                                    {shouldStayOnWithdrawStep ? (
                                        <>Your SOL has been withdrawn to your wallet.</>
                                    ) : (
                                        <>
                                            You can now withdraw{" "}
                                            <strong className="text-slate-900 dark:text-white">{ifPosition!.lastWithdrawRequestValue.toFixed(6)} SOL</strong> to
                                            your wallet.
                                        </>
                                    )}
                                </p>
                            </div>

                            {unstakeState.error && (
                                <div className="flex gap-2 text-[12px] text-red-400 rounded-xl bg-red-400/8 px-3.5 py-2.5 border border-red-400/20">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    {unstakeState.error}
                                </div>
                            )}
                            {unstakeState.status === "done" && unstakeState.signature && (
                                <p className="text-[12px] text-green-400 rounded-xl bg-green-400/8 px-3.5 py-2.5 border border-green-400/20">
                                    Withdrawn successfully!{" "}
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
                                    background: !withdrawLoading ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "rgba(255,255,255,0.05)",
                                    boxShadow: !withdrawLoading ? "0 4px 20px rgba(34,197,94,0.25)" : "none"
                                }}
                                onClick={handleWithdrawAction}
                                disabled={withdrawLoading || !walletPubkey}
                            >
                                {withdrawLoading ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {WITHDRAW_LABELS[unstakeState.status]}
                                    </span>
                                ) : (
                                    WITHDRAW_LABELS[unstakeState.status]
                                )}
                            </button>
                        </div>
                    )}

                    {/* Cancel button */}
                    <button
                        className="w-full cursor-pointer rounded-2xl border border-slate-200 py-3 text-[13px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white"
                        onClick={handleClose}
                        disabled={anyLoading}
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
