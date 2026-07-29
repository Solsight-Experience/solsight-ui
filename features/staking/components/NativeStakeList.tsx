"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Loader2, Wallet } from "lucide-react";
import { AddressFormatter } from "@/lib/formatters";
import { useNativeStaking, type StakeActionSuccessPayload } from "../hooks/useNativeStaking";
import type { NativeStakePositionsPage, NativeStakeStatus } from "../lib/staking-api";
import type { VersionedTransaction } from "@solana/web3.js";

const addressFormatter = new AddressFormatter(5, 4);

interface NativeStakeListProps {
    native: NativeStakePositionsPage;
    isLoading: boolean;
    walletPubkey: string | null;
    connected: boolean;
    signTransaction: ((tx: VersionedTransaction) => Promise<VersionedTransaction>) | null;
    ensureWalletReadyForUserAction: (actionLabel?: string) => boolean;
    onSuccess?: (payload?: StakeActionSuccessPayload) => void;
    onPageChange: (page: number) => void;
}

const STATUS_CONFIG: Record<NativeStakeStatus, { label: string; dot: string; text: string }> = {
    activating: { label: "Activating", dot: "bg-yellow-400", text: "text-yellow-400" },
    active: { label: "Active", dot: "bg-green-400", text: "text-green-400" },
    deactivating: { label: "Deactivating", dot: "bg-orange-400", text: "text-orange-400" },
    inactive: { label: "Withdrawable", dot: "bg-blue-400", text: "text-blue-400" }
};

export function NativeStakeList({
    native,
    isLoading,
    walletPubkey,
    connected,
    signTransaction,
    ensureWalletReadyForUserAction,
    onSuccess,
    onPageChange
}: NativeStakeListProps) {
    const { unstakeState, withdrawState, handleUnstakeNative, handleWithdrawNative } = useNativeStaking(
        connected,
        walletPubkey,
        signTransaction,
        ensureWalletReadyForUserAction,
        onSuccess
    );

    const unstaking = unstakeState.status === "signing" || unstakeState.status === "confirming";
    const withdrawing = withdrawState.status === "signing" || withdrawState.status === "confirming";
    const { items: positions, total, page, pageSize } = native;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-8 text-slate-500 dark:border-white/8 dark:bg-white/4 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[13px]">Loading positions...</span>
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-8 text-center dark:border-white/8 dark:bg-white/4">
                <Wallet className="h-6 w-6 text-slate-400 dark:text-gray-600" />
                <p className="text-[13px] text-slate-500 dark:text-gray-400">No native stake positions yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {positions.map((position) => {
                const status = STATUS_CONFIG[position.status];
                return (
                    <div
                        key={position.address}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/8 dark:bg-white/4"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-slate-900 dark:text-white">{position.estimatedSol.toFixed(6)} SOL</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">Validator {addressFormatter.format(position.voteAccount)}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                <span className={`text-[11px] font-medium ${status.text}`}>{status.label}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {position.status === "active" && (
                                <button
                                    onClick={() => handleUnstakeNative(position.address)}
                                    disabled={unstaking}
                                    className="cursor-pointer rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-700 transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-orange-300"
                                >
                                    {unstaking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Unstake"}
                                </button>
                            )}
                            {position.status === "inactive" && (
                                <button
                                    onClick={() => handleWithdrawNative(position.address, position.withdrawableLamports)}
                                    disabled={withdrawing}
                                    className="cursor-pointer rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[11px] font-semibold text-green-700 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-300"
                                >
                                    {withdrawing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Withdraw"}
                                </button>
                            )}
                            {(position.status === "activating" || position.status === "deactivating") && (
                                <span className="text-[11px] text-slate-400 dark:text-gray-600">Waiting on epoch...</span>
                            )}
                        </div>
                    </div>
                );
            })}

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Prev
                    </button>
                    <span className="text-[12px] text-slate-500 dark:text-gray-500">
                        Page {page} of {totalPages} · {total} total
                    </span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                    >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
