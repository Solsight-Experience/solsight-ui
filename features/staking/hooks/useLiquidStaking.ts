"use client";

import { useCallback, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { IF_CONFIG, IF_MIN_STAKE_SOL, getSolscanTxUrl } from "../constants/program";
import { DEFAULT_STAKING_PROTOCOL, type StakingProtocolId } from "../constants/protocols";
import { buildSignSend, parseStakingError, type SignTransactionFn } from "../lib/build-sign-send";
import useClusterStore from "@/stores/cluster.store";

export type StakeStatus = "idle" | "signing" | "confirming" | "done" | "error";

export interface StakeActionSuccessPayload {
    signature?: string | null;
}

interface StakeState {
    status: StakeStatus;
    signature: string | null;
    error: string | null;
}

const INIT_STATE: StakeState = { status: "idle", signature: null, error: null };

export function useLiquidStaking(
    connected: boolean,
    walletPubkey: string | null,
    signTransaction: SignTransactionFn | null,
    ensureWalletReadyForUserAction: ((actionLabel?: string) => boolean) | undefined,
    onSuccess?: (payload?: StakeActionSuccessPayload) => void,
    protocol: StakingProtocolId = DEFAULT_STAKING_PROTOCOL
) {
    const [stakeState, setStakeState] = useState<StakeState>(INIT_STATE);
    const [unstakeState, setUnstakeState] = useState<StakeState>(INIT_STATE);

    const resetStakeState = useCallback(() => setStakeState(INIT_STATE), []);
    const resetUnstakeState = useCallback(() => setUnstakeState(INIT_STATE), []);

    const checkWallet = useCallback(
        (actionLabel = "continue") => {
            if (!IF_CONFIG.isEnabled) {
                toast.error(IF_CONFIG.unavailableReason ?? `${IF_CONFIG.label} staking is unavailable.`);
                return false;
            }
            if (!ensureWalletReadyForUserAction?.(actionLabel)) return false;
            if (!connected || !walletPubkey || !signTransaction) {
                toast.error("Wallet not connected. Please connect and try again.");
                return false;
            }
            const selectedCluster = useClusterStore.getState().cluster;
            if (selectedCluster !== IF_CONFIG.network) {
                toast.error(`Switch the app cluster to ${IF_CONFIG.label} before staking.`);
                return false;
            }
            return true;
        },
        [connected, ensureWalletReadyForUserAction, signTransaction, walletPubkey]
    );

    const handleStake = useCallback(
        async (amountSol: number) => {
            setStakeState(INIT_STATE);
            if (amountSol < IF_MIN_STAKE_SOL) {
                toast.error(`Minimum stake is ${IF_MIN_STAKE_SOL} SOL.`);
                return false;
            }
            if (!checkWallet("stake SOL")) return false;
            setStakeState((s) => ({ ...s, status: "signing" }));

            try {
                const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));
                const { signature } = await buildSignSend(
                    { mode: "liquid", action: "stake", wallet: walletPubkey!, protocol, amountLamports: lamports.toString() },
                    signTransaction!
                );

                setStakeState({ status: "done", signature, error: null });
                toast.success(`Successfully staked ${amountSol} SOL!`, {
                    duration: 8000,
                    action: { label: "Solscan", onClick: () => window.open(getSolscanTxUrl(signature), "_blank") }
                });
                onSuccess?.({ signature });
                return true;
            } catch (err) {
                const { message, isRejected } = parseStakingError(err);
                setStakeState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
                return false;
            }
        },
        [checkWallet, onSuccess, protocol, signTransaction, walletPubkey]
    );

    const handleUnstake = useCallback(
        async (amountSol: number) => {
            setUnstakeState(INIT_STATE);
            if (amountSol < IF_MIN_STAKE_SOL) {
                toast.error(`Minimum unstake is ${IF_MIN_STAKE_SOL} SOL.`);
                return false;
            }
            if (!checkWallet("unstake SOL")) return false;
            setUnstakeState((s) => ({ ...s, status: "signing" }));

            try {
                const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));
                const { signature, built } = await buildSignSend(
                    { mode: "liquid", action: "unstake", wallet: walletPubkey!, protocol, amountLamports: lamports.toString() },
                    signTransaction!
                );

                setUnstakeState({ status: "done", signature, error: null });
                if (built.nativeStakeAddress) {
                    toast.success("Pool reserve was low, so your unstake was routed to a new native stake position instead of instant SOL.", {
                        duration: 12000,
                        action: { label: "Solscan", onClick: () => window.open(getSolscanTxUrl(signature), "_blank") }
                    });
                } else {
                    toast.success("SOL successfully unstaked!", {
                        duration: 8000,
                        action: { label: "Solscan", onClick: () => window.open(getSolscanTxUrl(signature), "_blank") }
                    });
                }
                onSuccess?.({ signature });
                return true;
            } catch (err) {
                const { message, isRejected } = parseStakingError(err);
                setUnstakeState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
                return false;
            }
        },
        [checkWallet, onSuccess, protocol, signTransaction, walletPubkey]
    );

    return { stakeState, unstakeState, resetStakeState, resetUnstakeState, handleStake, handleUnstake };
}
