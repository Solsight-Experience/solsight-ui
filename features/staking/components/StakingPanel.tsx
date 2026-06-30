"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { TrendingUp, Zap, Wallet, Loader2, PlugZap, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useActionableWallet } from "@/features/wallets/hooks/useActionableWallet";
import { useSolBalance } from "../hooks/useDevnetSolBalance";
import { StakeModal } from "./StakeModal";
import { UnstakeModal } from "./UnstakeModal";
import { IF_CONFIG } from "../constants/program";
import { useIFPositions } from "../hooks/useIFPositions";
import { useIFProgram } from "../hooks/useIFProgram";
import { useIFStaking, type StakeActionSuccessPayload } from "../hooks/useIFStaking";
import { useStakeHistoryRefreshStore } from "../lib/stake-history-refresh.store";

export function StakingPanel() {
    const { resolvedTheme } = useTheme();
    const networkLabel = IF_CONFIG.label;
    const {
        connected,
        publicKey,
        actionablePublicKey,
        isReadyForUserAction,
        isWalletLinkedToUser,
        isConnecting,
        connectWallet,
        signTransaction,
        ensureWalletReadyForUserAction
    } = useActionableWallet();
    const { data: solBalanceData, refetch: refetchBalance } = useSolBalance(actionablePublicKey ?? undefined);
    const publishHistoryRefresh = useStakeHistoryRefreshStore((state) => state.publishRefresh);

    const [stakeOpen, setStakeOpen] = useState(false);
    const [unstakeOpen, setUnstakeOpen] = useState(false);

    const solBalance = solBalanceData ?? 0;

    const { isLoading: clientLoading, isReady: clientReady, error: programError } = useIFProgram(isReadyForUserAction, actionablePublicKey);
    const { data: ifPosition, isLoading: positionLoading, refetch: refetchPosition } = useIFPositions(isReadyForUserAction, actionablePublicKey);

    const refetchAll = useCallback(
        (payload?: StakeActionSuccessPayload) => {
            void refetchPosition();
            void refetchBalance();
            publishHistoryRefresh(actionablePublicKey, payload?.signature);
        },
        [actionablePublicKey, publishHistoryRefresh, refetchBalance, refetchPosition]
    );

    const { cancelRequestState, handleCancelRequest } = useIFStaking(
        isReadyForUserAction,
        actionablePublicKey,
        signTransaction,
        ensureWalletReadyForUserAction,
        refetchAll
    );
    const cancelLoading = cancelRequestState.status === "signing" || cancelRequestState.status === "confirming";

    const stakedSol = ifPosition?.estimatedSol ?? 0;
    const hasPendingUnstake = !!ifPosition && Number(ifPosition.lastWithdrawRequestShares) > 0;
    const isDark = resolvedTheme === "dark";

    return (
        <div className="w-full">
            <div
                className="space-y-5 rounded-3xl border p-6 backdrop-blur-md"
                style={{
                    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(226,232,240,0.80)",
                    background: isDark ? "linear-gradient(145deg, rgba(20,10,40,0.95) 0%, rgba(10,8,30,0.98) 100%)" : "rgba(255,255,255,0.85)",
                    boxShadow: isDark ? "none" : "0 24px 80px rgba(15,23,42,0.12)"
                }}
            >
                {/* Header row */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Image
                            src="/icons/sol.png"
                            alt="SOL"
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-full ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20"
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 ring-2 ring-white text-[9px] font-bold text-white dark:ring-[#0a0818]">
                            {IF_CONFIG.network.slice(0, 1).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Solana</h2>
                            <span className="text-base font-bold text-slate-500 dark:text-gray-500">SOL</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <PlugZap className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-purple-400 font-bold text-sm">Insurance Fund</span>
                            <span className="text-xs text-slate-500 dark:text-gray-600">· {networkLabel}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-400">
                            <Zap className="h-3 w-3" />
                            IF Yield
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-white/10" />

                {/* Program loading indicator */}
                {isReadyForUserAction && clientLoading && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-[12px] text-purple-700 dark:bg-purple-500/5 dark:text-purple-300">
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                        <span>Connecting to {networkLabel}...</span>
                    </div>
                )}
                {isReadyForUserAction && programError && !clientLoading && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] text-red-700 dark:bg-red-500/5 dark:text-red-300">
                        <span className="flex-shrink-0">⚠️</span>
                        <span className="flex-1">{programError}</span>
                    </div>
                )}
                {connected && !isWalletLinkedToUser && publicKey && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-700 dark:bg-amber-500/5 dark:text-amber-300">
                        <span className="flex-shrink-0">⚠️</span>
                        <span className="flex-1">This wallet is not connected to your account yet. Connect it before viewing staking balances or staking.</span>
                    </div>
                )}

                {/* Balances */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 dark:bg-purple-500/5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400/70 mb-1">Staked (IF)</p>
                        <p className="text-xl font-extrabold leading-none text-slate-900 dark:text-white">
                            {positionLoading || clientLoading ? (
                                <span className="inline-block h-6 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
                            ) : (
                                <>{stakedSol.toFixed(6)}</>
                            )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">jitoSOL</p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 dark:bg-blue-500/5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70 mb-1">Wallet</p>
                        <p className="text-xl font-extrabold leading-none text-slate-900 dark:text-white">{solBalance.toFixed(4)}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">SOL</p>
                    </div>
                </div>

                {/* Pending unstake badge */}
                {hasPendingUnstake && (
                    <div className="flex items-start gap-2 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 dark:bg-orange-500/8">
                        <Zap className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-orange-700 dark:text-orange-300">Unstake Request Pending</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-gray-500">
                                {ifPosition!.lastWithdrawRequestValue.toFixed(6)} SOL in cooldown.
                                {ifPosition!.canWithdraw ? (
                                    <span className="ml-1 font-semibold text-green-600 dark:text-green-400">Ready to withdraw!</span>
                                ) : (
                                    <span className="ml-1">Cancel to stake again.</span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={handleCancelRequest}
                            disabled={cancelLoading}
                            className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-700 transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-orange-300"
                        >
                            {cancelLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            Cancel
                        </button>
                    </div>
                )}

                {/* Earn banner */}
                <div className="flex gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/12 to-purple-500/12 p-4 dark:from-indigo-500/8 dark:to-purple-500/8">
                    <TrendingUp className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">Earn Protocol Fees</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600 dark:text-gray-400">
                            Your SOL enters the <strong className="text-indigo-700 dark:text-indigo-300">Insurance Fund</strong>. You receive IF Shares and earn
                            fees from protocol trading activity.
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                {!isReadyForUserAction ? (
                    <button
                        className="w-full cursor-pointer rounded-2xl py-4 text-[15px] font-bold tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                            boxShadow: "0 4px 24px rgba(139,92,246,0.35)"
                        }}
                        onClick={() => connectWallet()}
                        disabled={isConnecting}
                    >
                        <Wallet className="inline h-4 w-4 mr-2 -mt-0.5" />
                        {isConnecting ? "Connecting..." : connected && !isWalletLinkedToUser ? "Connect Wallet To Account" : "Connect Wallet"}
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            className="flex-1 cursor-pointer rounded-2xl border border-slate-300/90 bg-white/60 py-3.5 text-[14px] font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:border-orange-500/50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98] dark:border-white/15 dark:bg-transparent dark:text-gray-300 dark:hover:text-orange-300"
                            onClick={() => setUnstakeOpen(true)}
                            disabled={!clientReady || (stakedSol === 0 && !hasPendingUnstake)}
                        >
                            Unstake
                        </button>
                        <button
                            className="flex-1 cursor-pointer rounded-2xl py-3.5 text-[14px] font-bold tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
                            style={{
                                background: hasPendingUnstake
                                    ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                                    : "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                                boxShadow: hasPendingUnstake ? "none" : "0 4px 20px rgba(139,92,246,0.30)"
                            }}
                            onClick={() => {
                                if (hasPendingUnstake) {
                                    toast.warning("Cancel your pending unstake request before staking again.", { duration: 5000 });
                                    return;
                                }
                                setStakeOpen(true);
                            }}
                            disabled={!clientReady || clientLoading}
                        >
                            {clientLoading ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Connecting...
                                </span>
                            ) : (
                                "Stake SOL"
                            )}
                        </button>
                    </div>
                )}
            </div>

            <StakeModal
                open={stakeOpen}
                onClose={() => setStakeOpen(false)}
                walletPubkey={actionablePublicKey}
                solBalance={solBalance}
                connected={isReadyForUserAction}
                signTransaction={signTransaction}
                ensureWalletReadyForUserAction={ensureWalletReadyForUserAction}
                onSuccess={refetchAll}
            />
            <UnstakeModal
                open={unstakeOpen}
                onClose={() => setUnstakeOpen(false)}
                walletPubkey={actionablePublicKey}
                ifPosition={ifPosition ?? null}
                isLoadingPosition={positionLoading}
                connected={isReadyForUserAction}
                signTransaction={signTransaction}
                ensureWalletReadyForUserAction={ensureWalletReadyForUserAction}
                onSuccess={refetchAll}
            />
        </div>
    );
}
