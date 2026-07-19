"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Coins, AlertCircle, CheckCircle2 } from "lucide-react";
import useClusterStore from "@/stores/cluster.store";
import { useLinkedWallet } from "@/features/wallets/hooks/useLinkedWallet";
import { usePackages, useQuota } from "../hooks/useQuota";
import { usePurchaseCredits } from "../hooks/usePurchaseCredits";
import type { PaymentPackage } from "../types";
import type { PurchaseStatus } from "../hooks/usePurchaseCredits";

interface PurchaseCreditsModalProps {
    open: boolean;
    onClose: () => void;
}

const STATUS_LABELS: Record<PurchaseStatus, string> = {
    idle: "Buy credits",
    creating: "Creating order...",
    signing: "Waiting for signature...",
    submitting: "Confirming on-chain...",
    done: "Buy credits",
    error: "Buy credits"
};

function formatSol(lamports: string): string {
    return (Number(lamports) / 1_000_000_000).toString();
}

export function PurchaseCreditsModal({ open, onClose }: PurchaseCreditsModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const cluster = useClusterStore((s) => s.cluster);

    const { connected, publicKey, signTransaction, ensureWalletReadyForUserAction } = useLinkedWallet();
    const { data: quota } = useQuota();
    const freeRemaining = quota ? Math.max(quota.freeLimit - quota.freeUsed, 0) : null;
    const { data: packages, isLoading: packagesLoading } = usePackages();
    const { state, reset, handlePurchase } = usePurchaseCredits(connected, publicKey, signTransaction, ensureWalletReadyForUserAction);

    const loading = state.status !== "idle" && state.status !== "done" && state.status !== "error";

    useEffect(() => {
        if (open) reset();
    }, [open, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSelect = async (pkg: PaymentPackage) => {
        await handlePurchase(pkg);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                if (!loading) handleClose();
            }}
        >
            <DialogContent
                className="overflow-hidden border-0 p-0 gap-0 text-slate-950 sm:max-w-md dark:text-white"
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
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Buy Credits</DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/8 px-4 py-3.5">
                        <Coins className="h-9 w-9 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">AI Chat Credits</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-400">
                                {quota
                                    ? `${freeRemaining}/${quota.freeLimit} free chats today · ${quota.paidCredits} credit${quota.paidCredits === 1 ? "" : "s"} left`
                                    : "Loading quota..."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {packagesLoading && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                            </div>
                        )}

                        {packages?.map((pkg) => (
                            <Button
                                key={pkg.code}
                                type="button"
                                variant="ghost"
                                onClick={() => handleSelect(pkg)}
                                disabled={loading}
                                className="h-auto w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition-colors hover:border-purple-500/40 hover:bg-slate-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/5"
                            >
                                <div>
                                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">{pkg.credits} credits</p>
                                    <p className="text-[11px] text-slate-500 dark:text-gray-400">One-time purchase · never expires</p>
                                </div>
                                <p className="text-[15px] font-bold text-purple-400">{formatSol(pkg.lamports)} SOL</p>
                            </Button>
                        ))}
                    </div>

                    {loading && (
                        <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {STATUS_LABELS[state.status]}
                        </div>
                    )}

                    {state.error && (
                        <div className="flex gap-2 text-[12px] text-red-400 rounded-xl bg-red-400/8 px-3.5 py-2.5 border border-red-400/20">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            {state.error}
                        </div>
                    )}
                    {state.status === "done" && (
                        <div className="flex gap-2 text-[12px] text-green-400 rounded-xl bg-green-400/8 px-3.5 py-2.5 border border-green-400/20">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            Purchased {state.creditsAdded} credits successfully!
                        </div>
                    )}

                    <p className="text-[10px] text-center text-slate-400 dark:text-gray-600">
                        Paying on {cluster === "devnet" ? "Devnet" : "Mainnet"} · switch network in Settings if needed
                    </p>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        disabled={loading}
                        className="h-auto w-full rounded-2xl border border-slate-200 bg-transparent py-3 text-[13px] font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-transparent hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white"
                    >
                        {state.status === "done" ? "Close" : "Cancel"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PurchaseCreditsModal;
