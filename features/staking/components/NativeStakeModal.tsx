"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Info, ShieldCheck, AlertCircle } from "lucide-react";
import { IF_CONFIG, IF_MIN_STAKE_SOL, IF_RESERVE_SOL, getSolscanTxUrl } from "../constants/program";
import { useNativeStaking, type StakeActionSuccessPayload } from "../hooks/useNativeStaking";
import { useStakingValidators, useStakeMinimumDelegation } from "../hooks/useStakingPosition";
import { shortenAddr } from "../lib/format";
import { StakeAmountInput } from "./StakeAmountInput";
import type { VersionedTransaction } from "@solana/web3.js";

interface NativeStakeModalProps {
    open: boolean;
    onClose: () => void;
    walletPubkey: string | null;
    solBalance: number;
    connected: boolean;
    signTransaction: ((tx: VersionedTransaction) => Promise<VersionedTransaction>) | null;
    ensureWalletReadyForUserAction: (actionLabel?: string) => boolean;
    onSuccess?: (payload?: StakeActionSuccessPayload) => void;
}

export function NativeStakeModal({
    open,
    onClose,
    walletPubkey,
    solBalance,
    connected,
    signTransaction,
    ensureWalletReadyForUserAction,
    onSuccess
}: NativeStakeModalProps) {
    const { resolvedTheme } = useTheme();
    const [amount, setAmount] = useState("");
    const [voteAccount, setVoteAccount] = useState<string | null>(null);
    const networkLabel = IF_CONFIG.label;

    const { data: validators, isLoading: validatorsLoading } = useStakingValidators();
    const { data: minStakeSol = IF_MIN_STAKE_SOL } = useStakeMinimumDelegation();
    const { stakeState, resetStakeState, handleStakeNative } = useNativeStaking(
        connected,
        walletPubkey,
        signTransaction,
        ensureWalletReadyForUserAction,
        onSuccess
    );

    const loading = stakeState.status === "signing" || stakeState.status === "confirming";
    const maxStakeable = Math.max(0, solBalance - IF_RESERVE_SOL);

    useEffect(() => {
        if (open) {
            setAmount("");
            resetStakeState();
            setVoteAccount(null);
        }
    }, [open, resetStakeState]);

    useEffect(() => {
        if (!voteAccount && validators && validators.length > 0) {
            setVoteAccount(validators[0].voteAccount);
        }
    }, [validators, voteAccount]);

    const handleClose = () => {
        setAmount("");
        resetStakeState();
        onClose();
    };

    const amountNum = parseFloat(amount);
    const isValid = !isNaN(amountNum) && amountNum >= minStakeSol && !!voteAccount;
    const isDark = resolvedTheme === "dark";

    const handleSubmit = async () => {
        if (!voteAccount) return;
        const didStake = await handleStakeNative(voteAccount, amountNum, minStakeSol);
        if (didStake) setAmount("");
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
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Stake to a Validator</DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/8 px-4 py-3.5">
                        <ShieldCheck className="h-9 w-9 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">Native Delegation</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-400">SOL Market · {networkLabel} · Direct validator stake</p>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] font-semibold text-slate-600 dark:text-gray-400">Validator</label>
                        {validatorsLoading ? (
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[13px] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Assigning a validator...
                            </div>
                        ) : !validators || validators.length === 0 ? (
                            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3.5 text-[12px] text-yellow-700 dark:bg-yellow-500/6 dark:text-yellow-300">
                                No approved validators available right now.
                            </div>
                        ) : (
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/10 dark:bg-white/5">
                                <span className="text-[14px] font-semibold text-slate-900 dark:text-white">{voteAccount ? shortenAddr(voteAccount) : "—"}</span>
                                <span className="text-[11px] font-semibold text-purple-400">Auto-assigned</span>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/8 dark:bg-white/4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">Available Balance</p>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {solBalance.toFixed(4)} <span className="text-lg font-semibold text-slate-500 dark:text-gray-400">SOL</span>
                        </p>
                    </div>

                    <StakeAmountInput
                        label="Amount to stake"
                        amount={amount}
                        onAmountChange={setAmount}
                        onMax={() => setAmount(maxStakeable.toFixed(6))}
                        disabled={loading}
                        accent="purple"
                        helperText={
                            <>
                                Minimum {minStakeSol} SOL · Reserve {IF_RESERVE_SOL} SOL for transaction fees
                            </>
                        }
                    />

                    <div className="flex gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-3 text-[12px] text-blue-700 dark:bg-blue-500/6 dark:text-blue-300">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                        <span className="leading-relaxed">
                            Your SOL is delegated directly to this validator via a stake account you fully control. Unstaking follows Solana&apos;s normal
                            epoch-based (de)activation wait — not instant.
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
                                    {stakeState.status === "signing" ? "Waiting for signature..." : "Confirming on-chain..."}
                                </span>
                            ) : (
                                "Stake SOL"
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
