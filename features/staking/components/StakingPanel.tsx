"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TrendingUp, Zap, Wallet, PlugZap, Layers, Landmark } from "lucide-react";
import { useActionableWallet } from "@/features/wallets/hooks/useActionableWallet";
import { useSolBalance } from "../hooks/useDevnetSolBalance";
import { StakeModal } from "./StakeModal";
import { UnstakeModal } from "./UnstakeModal";
import { NativeStakeModal } from "./NativeStakeModal";
import { NativeStakeList } from "./NativeStakeList";
import { IF_CONFIG, NATIVE_STAKE_PAGE_SIZE } from "../constants/program";
import { useStakingPosition } from "../hooks/useStakingPosition";
import { useIFProgram } from "../hooks/useIFProgram";
import type { StakeActionSuccessPayload } from "../hooks/useLiquidStaking";
import { useStakeHistoryRefreshStore } from "../lib/stake-history-refresh.store";

type StakingViewMode = "liquid" | "native";

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

    const [mode, setMode] = useState<StakingViewMode>("liquid");
    const [stakeOpen, setStakeOpen] = useState(false);
    const [unstakeOpen, setUnstakeOpen] = useState(false);
    const [nativePage, setNativePage] = useState(1);

    const solBalance = solBalanceData ?? 0;

    const { isReady: clientReady, error: programError } = useIFProgram(isReadyForUserAction, actionablePublicKey);
    const {
        data: position,
        isLoading: positionLoading,
        refetch: refetchPosition
    } = useStakingPosition(isReadyForUserAction, actionablePublicKey, nativePage, NATIVE_STAKE_PAGE_SIZE);

    const refetchAll = useCallback(
        (payload?: StakeActionSuccessPayload) => {
            setNativePage(1);
            void refetchPosition();
            void refetchBalance();
            publishHistoryRefresh(actionablePublicKey, payload?.signature);
        },
        [actionablePublicKey, publishHistoryRefresh, refetchBalance, refetchPosition]
    );

    const liquidPosition = position?.liquid ?? null;
    const nativePositions = position?.native ?? { items: [], total: 0, page: nativePage, pageSize: NATIVE_STAKE_PAGE_SIZE };
    // poolTokenAmount is the actual jitoSOL held (raw units); estimatedSol is that same
    // balance converted to its current SOL value via the pool's exchange rate — the two
    // diverge once the pool has accrued staking rewards, so they're shown separately.
    const jitoSolAmount = liquidPosition ? Number(liquidPosition.poolTokenAmount) / LAMPORTS_PER_SOL : 0;
    const stakedSol = liquidPosition?.estimatedSol ?? 0;
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
                            <span className="text-purple-400 font-bold text-sm">Staking</span>
                            <span className="text-xs text-slate-500 dark:text-gray-600">· {networkLabel}</span>
                        </div>
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 dark:border-white/8 dark:bg-white/4">
                    <button
                        onClick={() => setMode("liquid")}
                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition-all ${
                            mode === "liquid"
                                ? "bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300"
                                : "text-slate-500 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300"
                        }`}
                    >
                        <Layers className="h-3.5 w-3.5" />
                        Liquid (jitoSOL)
                    </button>
                    <button
                        onClick={() => setMode("native")}
                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition-all ${
                            mode === "native"
                                ? "bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300"
                                : "text-slate-500 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300"
                        }`}
                    >
                        <Landmark className="h-3.5 w-3.5" />
                        Native (Validator)
                    </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-white/10" />

                {isReadyForUserAction && programError && (
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

                {mode === "liquid" ? (
                    <>
                        {/* Balances */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 dark:bg-purple-500/5">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400/70 mb-1">Staked</p>
                                <p className="text-xl font-extrabold leading-none text-slate-900 dark:text-white">
                                    {positionLoading ? (
                                        <span className="inline-block h-6 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
                                    ) : (
                                        <>{jitoSolAmount.toFixed(6)}</>
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                                    jitoSOL {!positionLoading && liquidPosition && <>· ≈ {stakedSol.toFixed(4)} SOL</>}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 dark:bg-blue-500/5">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70 mb-1">Wallet</p>
                                <p className="text-xl font-extrabold leading-none text-slate-900 dark:text-white">{solBalance.toFixed(4)}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">SOL</p>
                            </div>
                        </div>

                        <div className="flex gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/12 to-purple-500/12 p-4 dark:from-indigo-500/8 dark:to-purple-500/8">
                            <TrendingUp className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Instant jitoSOL Swap</p>
                                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600 dark:text-gray-400">
                                    Your SOL is swapped into <strong className="text-indigo-700 dark:text-indigo-300">jitoSOL</strong>, held in your own wallet.
                                    No lockup — unstake back to SOL any time.
                                </p>
                            </div>
                        </div>

                        {!isReadyForUserAction ? (
                            <button
                                className="w-full cursor-pointer rounded-2xl py-4 text-[15px] font-bold tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)", boxShadow: "0 4px 24px rgba(139,92,246,0.35)" }}
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
                                    disabled={!clientReady || jitoSolAmount === 0}
                                >
                                    Unstake
                                </button>
                                <button
                                    className="flex-1 cursor-pointer rounded-2xl py-3.5 text-[14px] font-bold tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
                                    style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)", boxShadow: "0 4px 20px rgba(139,92,246,0.30)" }}
                                    onClick={() => setStakeOpen(true)}
                                    disabled={!clientReady}
                                >
                                    Stake SOL
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 dark:bg-blue-500/5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70 mb-1">Wallet</p>
                            <p className="text-xl font-extrabold leading-none text-slate-900 dark:text-white">{solBalance.toFixed(4)}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">SOL</p>
                        </div>

                        <div className="flex gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/12 to-purple-500/12 p-4 dark:from-indigo-500/8 dark:to-purple-500/8">
                            <Zap className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Direct Validator Delegation</p>
                                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600 dark:text-gray-400">
                                    Your SOL is delegated to an approved validator via a stake account only you control. Subject to Solana&apos;s normal
                                    epoch-based (de)activation wait.
                                </p>
                            </div>
                        </div>

                        <NativeStakeList
                            native={nativePositions}
                            isLoading={positionLoading}
                            walletPubkey={actionablePublicKey}
                            connected={isReadyForUserAction}
                            signTransaction={signTransaction}
                            ensureWalletReadyForUserAction={ensureWalletReadyForUserAction}
                            onSuccess={refetchAll}
                            onPageChange={setNativePage}
                        />

                        {!isReadyForUserAction ? (
                            <button
                                className="w-full cursor-pointer rounded-2xl py-4 text-[15px] font-bold tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)", boxShadow: "0 4px 24px rgba(139,92,246,0.35)" }}
                                onClick={() => connectWallet()}
                                disabled={isConnecting}
                            >
                                <Wallet className="inline h-4 w-4 mr-2 -mt-0.5" />
                                {isConnecting ? "Connecting..." : connected && !isWalletLinkedToUser ? "Connect Wallet To Account" : "Connect Wallet"}
                            </button>
                        ) : (
                            <button
                                className="w-full cursor-pointer rounded-2xl py-3.5 text-[14px] font-bold tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
                                style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)", boxShadow: "0 4px 20px rgba(139,92,246,0.30)" }}
                                onClick={() => setStakeOpen(true)}
                                disabled={!clientReady}
                            >
                                Stake to a Validator
                            </button>
                        )}
                    </>
                )}
            </div>

            {mode === "liquid" ? (
                <>
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
                        liquidPosition={liquidPosition}
                        isLoadingPosition={positionLoading}
                        connected={isReadyForUserAction}
                        signTransaction={signTransaction}
                        ensureWalletReadyForUserAction={ensureWalletReadyForUserAction}
                        onSuccess={refetchAll}
                    />
                </>
            ) : (
                <NativeStakeModal
                    open={stakeOpen}
                    onClose={() => setStakeOpen(false)}
                    walletPubkey={actionablePublicKey}
                    solBalance={solBalance}
                    connected={isReadyForUserAction}
                    signTransaction={signTransaction}
                    ensureWalletReadyForUserAction={ensureWalletReadyForUserAction}
                    onSuccess={refetchAll}
                />
            )}
        </div>
    );
}
