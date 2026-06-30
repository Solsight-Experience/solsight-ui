"use client";

import React, { useEffect, useState } from "react";
import { History, ExternalLink, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine, Wallet, Copy, Check } from "lucide-react";
import { useIFStakeHistory, StakeRecord, StakeActionType, StakeRecordStatus } from "../hooks/useIFStakeHistory";
import { getSolscanTxUrl } from "../constants/program";
import { useStakeHistoryRefreshStore } from "../lib/stake-history-refresh.store";

interface StakeHistoryProps {
    walletPubkey: string | null;
}

const ACTION_CONFIG: Record<StakeActionType, { label: string; icon: React.ReactNode; color: string }> = {
    stake: {
        label: "Stake",
        icon: <ArrowDownToLine className="h-3.5 w-3.5" />,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/25"
    },
    unstake: {
        label: "Unstake",
        icon: <ArrowUpFromLine className="h-3.5 w-3.5" />,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/25"
    },
    withdraw: {
        label: "Withdraw",
        icon: <Wallet className="h-3.5 w-3.5" />,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/25"
    },
    cancel: {
        label: "Cancel",
        icon: <History className="h-3.5 w-3.5" />,
        color: "text-gray-400 bg-gray-500/10 border-gray-500/25"
    }
};

const STATUS_CONFIG: Record<StakeRecordStatus, { label: string; dot: string; text: string }> = {
    pending: { label: "Pending", dot: "bg-yellow-400", text: "text-yellow-400" },
    confirmed: { label: "Confirmed", dot: "bg-green-400", text: "text-green-400" },
    failed: { label: "Failed", dot: "bg-red-400", text: "text-red-400" },
    cooling_down: { label: "Cooling down", dot: "bg-orange-400", text: "text-orange-400" },
    withdrawn: { label: "Withdrawn", dot: "bg-blue-400", text: "text-blue-400" }
};

function shortenAddr(addr: string) {
    return addr.slice(0, 5) + "…" + addr.slice(-4);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

const PAGE_SIZE = 8;
const HISTORY_REFRESH_INTERVAL_MS = 1500;
const HISTORY_REFRESH_ATTEMPTS = 2;
const HISTORY_REFRESH_ATTEMPTS_WITH_SIGNATURE = 6;

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (
        <button
            onClick={handleCopy}
            title="Copy address"
            className="ml-1.5 flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-gray-500 dark:hover:border-white/25 dark:hover:text-white"
        >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
        </button>
    );
}

export function StakeHistory({ walletPubkey }: StakeHistoryProps) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, refetch } = useIFStakeHistory(walletPubkey, page, PAGE_SIZE);
    const refreshVersion = useStakeHistoryRefreshStore((state) => state.refreshVersion);
    const refreshedWalletPubkey = useStakeHistoryRefreshStore((state) => state.walletPubkey);
    const expectedSignature = useStakeHistoryRefreshStore((state) => state.expectedSignature);

    const records = data?.records ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    useEffect(() => {
        if (!walletPubkey || refreshedWalletPubkey !== walletPubkey) return;

        if (page !== 1) {
            setPage(1);
            return;
        }

        let cancelled = false;
        let timeoutId: number | null = null;

        const pollUntilVisible = async () => {
            const maxAttempts = expectedSignature ? HISTORY_REFRESH_ATTEMPTS_WITH_SIGNATURE : HISTORY_REFRESH_ATTEMPTS;

            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
                const result = await refetch();
                if (cancelled) return;

                const records = result.data?.records ?? [];
                if (!expectedSignature || records.some((record) => record.signature === expectedSignature)) {
                    return;
                }

                await new Promise<void>((resolve) => {
                    timeoutId = window.setTimeout(() => resolve(), HISTORY_REFRESH_INTERVAL_MS);
                });
                if (cancelled) return;
            }
        };

        void pollUntilVisible();

        return () => {
            cancelled = true;
            if (timeoutId !== null) window.clearTimeout(timeoutId);
        };
    }, [expectedSignature, page, refreshedWalletPubkey, refetch, refreshVersion, walletPubkey]);

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(20,10,40,0.95)_0%,rgba(10,8,30,0.98)_100%)] dark:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/8">
                <div className="flex items-center gap-2.5">
                    <History className="h-4 w-4 text-purple-400" />
                    <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">Stake History</h3>
                    {total > 0 && (
                        <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
                            {total}
                        </span>
                    )}
                </div>
            </div>

            {!walletPubkey ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                    <Wallet className="h-8 w-8 text-slate-400 dark:text-gray-600" />
                    <p className="text-sm text-slate-500 dark:text-gray-500">Connect wallet to view history</p>
                </div>
            ) : isLoading ? (
                <div className="space-y-2 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-red-400 text-sm">Failed to load history</p>
                </div>
            ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                    <History className="h-8 w-8 text-slate-400 dark:text-gray-700" />
                    <p className="text-sm text-slate-500 dark:text-gray-500">No transactions yet</p>
                    <p className="text-xs text-slate-400 dark:text-gray-600">Your stake and unstake history will appear here</p>
                </div>
            ) : (
                <>
                    <div className="hidden grid-cols-[1fr_100px_110px_100px_44px] gap-3 border-b border-slate-200 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-600 sm:grid">
                        <span>Stake Account</span>
                        <span>Amount</span>
                        <span>Type</span>
                        <span>Status</span>
                        <span />
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-white/5">
                        {records.map((r: StakeRecord) => {
                            const action = ACTION_CONFIG[r.actionType];
                            const status = STATUS_CONFIG[r.status];
                            return (
                                <div
                                    key={r.id}
                                    className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025] sm:grid-cols-[1fr_100px_110px_100px_44px]"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center">
                                            <p className="font-mono text-[12px] font-medium text-slate-700 dark:text-gray-300">
                                                {shortenAddr(r.stakeAccountAddress)}
                                            </p>
                                            <CopyButton text={r.stakeAccountAddress} />
                                        </div>
                                        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-gray-600">{formatDate(r.createdAt)}</p>
                                    </div>

                                    <div className="text-right sm:text-left">
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                                            {Number(r.amountSol) > 0 ? `${Number(r.amountSol).toFixed(4)}` : "—"}
                                        </p>
                                        {Number(r.amountSol) > 0 && <p className="text-[11px] text-slate-400 dark:text-gray-600">SOL</p>}
                                    </div>

                                    <div className="hidden sm:flex">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${action.color}`}
                                        >
                                            {action.icon}
                                            {action.label}
                                        </span>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                        <span className={`text-[12px] font-medium ${status.text}`}>{status.label}</span>
                                    </div>

                                    <div className="hidden sm:flex justify-end">
                                        <a
                                            href={getSolscanTxUrl(r.signature)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-gray-500 dark:hover:border-white/25 dark:hover:text-white"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    </div>

                                    <div className="flex sm:hidden flex-col items-end gap-1.5">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${action.color}`}
                                        >
                                            {action.icon}
                                            {action.label}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                            <span className={`text-[10px] font-medium ${status.text}`}>{status.label}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {records.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3.5 dark:border-white/8">
                            <p className="text-[12px] text-slate-500 dark:text-gray-600">
                                Page {page} / {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/25 dark:hover:text-white"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/25 dark:hover:text-white"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
