"use client";

import React, { useState } from "react";
import { TrendingUp, Zap, Wallet, Loader2, PlugZap, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useStakingWallet } from "../hooks/useStakingWallet";
import { useSolBalance } from "../hooks/useDevnetSolBalance";
import { StakeModal } from "./StakeModal";
import { UnstakeModal } from "./UnstakeModal";
import { IF_CONFIG } from "../constants/program";
import { useIFPositions } from "../hooks/useIFPositions";
import { useIFProgram } from "../hooks/useIFProgram";
import { useIFStaking } from "../hooks/useIFStaking";

export function StakingPanel() {
    const networkLabel = IF_CONFIG.label;
    const { connected, publicKey, isConnecting, connect } = useStakingWallet();
    const { data: solBalanceData, refetch: refetchBalance } = useSolBalance(publicKey ?? undefined);
    const queryClient = useQueryClient();

    const [stakeOpen, setStakeOpen] = useState(false);
    const [unstakeOpen, setUnstakeOpen] = useState(false);

    const solBalance = solBalanceData ?? 0;

    const { isLoading: clientLoading, isReady: clientReady, error: programError } = useIFProgram(connected, publicKey);
    const { data: ifPosition, isLoading: positionLoading, refetch: refetchPosition } = useIFPositions(connected, publicKey);

    const refetchAll = () => {
        refetchPosition();
        refetchBalance();
        // Invalidate all pages of stake history so the list updates immediately
        queryClient.invalidateQueries({ queryKey: ["if-stake-history", publicKey] });
    };

    const { cancelRequestState, handleCancelRequest } = useIFStaking(connected, publicKey, refetchAll);
    const cancelLoading = cancelRequestState.status === "signing" || cancelRequestState.status === "confirming";

    const stakedSol = ifPosition?.estimatedSol ?? 0;
    const hasPendingUnstake = !!ifPosition && Number(ifPosition.lastWithdrawRequestShares) > 0;

    return (
        <div className="w-full">
            <div
                className="rounded-3xl border border-white/10 p-6 space-y-5 backdrop-blur-md"
                style={{
                    background: "linear-gradient(145deg, rgba(20,10,40,0.95) 0%, rgba(10,8,30,0.98) 100%)"
                }}
            >
                {/* Header row */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                            alt="SOL"
                            className="w-14 h-14 rounded-full ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20"
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 ring-2 ring-[#0a0818] text-[9px] font-bold text-white">
                            {IF_CONFIG.network.slice(0, 1).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">Solana</h2>
                            <span className="text-base font-bold text-gray-500">SOL</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <PlugZap className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-purple-400 font-bold text-sm">Insurance Fund</span>
                            <span className="text-gray-600 text-xs">· {networkLabel}</span>
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
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Program loading indicator */}
                {connected && clientLoading && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-[12px] text-purple-300">
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                        <span>Connecting to {networkLabel}...</span>
                    </div>
                )}
                {connected && programError && !clientLoading && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[12px] text-red-300">
                        <span className="flex-shrink-0">⚠️</span>
                        <span className="flex-1">{programError}</span>
                    </div>
                )}

                {/* Balances */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400/70 mb-1">Staked (IF)</p>
                        <p className="text-xl font-extrabold text-white leading-none">
                            {positionLoading || clientLoading ? (
                                <span className="inline-block h-6 w-20 animate-pulse rounded-lg bg-white/10" />
                            ) : (
                                <>{stakedSol.toFixed(6)}</>
                            )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">SOL</p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70 mb-1">Wallet</p>
                        <p className="text-xl font-extrabold text-white leading-none">{solBalance.toFixed(4)}</p>
                        <p className="text-xs text-gray-500 mt-1">SOL</p>
                    </div>
                </div>

                {/* Pending unstake badge */}
                {hasPendingUnstake && (
                    <div className="flex items-start gap-2 rounded-2xl border border-orange-500/25 bg-orange-500/8 px-4 py-3">
                        <Zap className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-orange-300">Unstake Request Pending</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                {ifPosition!.lastWithdrawRequestValue.toFixed(6)} SOL in cooldown.
                                {ifPosition!.canWithdraw ? (
                                    <span className="ml-1 text-green-400 font-semibold">Ready to withdraw!</span>
                                ) : (
                                    <span className="ml-1">Cancel to stake again.</span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={handleCancelRequest}
                            disabled={cancelLoading}
                            className="flex items-center gap-1.5 flex-shrink-0 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-300 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {cancelLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            Cancel
                        </button>
                    </div>
                )}

                {/* Earn banner */}
                <div className="flex gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/8 to-purple-500/8 p-4">
                    <TrendingUp className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[13px] font-bold text-white">Earn Protocol Fees</p>
                        <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
                            Your SOL enters the <strong className="text-indigo-300">Insurance Fund</strong>. You receive IF Shares and earn fees from protocol
                            trading activity.
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                {!connected ? (
                    <button
                        className="w-full rounded-2xl py-4 text-[15px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                            boxShadow: "0 4px 24px rgba(139,92,246,0.35)"
                        }}
                        onClick={connect}
                        disabled={isConnecting}
                    >
                        <Wallet className="inline h-4 w-4 mr-2 -mt-0.5" />
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            className="flex-1 rounded-2xl border border-white/15 py-3.5 text-[14px] font-semibold text-gray-300 backdrop-blur-sm transition-all duration-200 hover:border-orange-500/50 hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                            onClick={() => setUnstakeOpen(true)}
                            disabled={!clientReady || (stakedSol === 0 && !hasPendingUnstake)}
                        >
                            Unstake
                        </button>
                        <button
                            className="flex-1 rounded-2xl py-3.5 text-[14px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
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
                walletPubkey={publicKey}
                solBalance={solBalance}
                connected={connected}
                onSuccess={refetchAll}
            />
            <UnstakeModal
                open={unstakeOpen}
                onClose={() => setUnstakeOpen(false)}
                walletPubkey={publicKey}
                ifPosition={ifPosition ?? null}
                isLoadingPosition={positionLoading}
                connected={connected}
                onSuccess={refetchAll}
            />
        </div>
    );
}
