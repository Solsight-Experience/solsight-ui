"use client";

import { useCallback, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { IF_CONFIG, IF_MIN_STAKE_SOL, getSolscanTxUrl } from "../constants/program";
import { buildSignSend, parseStakingError, type SignTransactionFn } from "../lib/build-sign-send";
import type { StakeStatus, StakeActionSuccessPayload } from "./useLiquidStaking";
import useClusterStore from "@/stores/cluster.store";

export type { StakeActionSuccessPayload };

interface StakeState {
    status: StakeStatus;
    signature: string | null;
    error: string | null;
}

const INIT_STATE: StakeState = { status: "idle", signature: null, error: null };

export function useNativeStaking(
    connected: boolean,
    walletPubkey: string | null,
    signTransaction: SignTransactionFn | null,
    ensureWalletReadyForUserAction: ((actionLabel?: string) => boolean) | undefined,
    onSuccess?: (payload?: StakeActionSuccessPayload) => void
) {
    const [stakeState, setStakeState] = useState<StakeState>(INIT_STATE);
    const [unstakeState, setUnstakeState] = useState<StakeState>(INIT_STATE);
    const [withdrawState, setWithdrawState] = useState<StakeState>(INIT_STATE);

    const resetStakeState = useCallback(() => setStakeState(INIT_STATE), []);
    const resetUnstakeState = useCallback(() => setUnstakeState(INIT_STATE), []);
    const resetWithdrawState = useCallback(() => setWithdrawState(INIT_STATE), []);

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

    const handleStakeNative = useCallback(
        async (voteAccount: string, amountSol: number, minStakeSol: number = IF_MIN_STAKE_SOL) => {
            setStakeState(INIT_STATE);
            if (amountSol < minStakeSol) {
                toast.error(`Minimum stake is ${minStakeSol} SOL.`);
                return false;
            }
            if (!checkWallet("stake SOL")) return false;
            setStakeState((s) => ({ ...s, status: "signing" }));

            try {
                const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));
                const { signature } = await buildSignSend(
                    { mode: "native", action: "stake", wallet: walletPubkey!, amountLamports: lamports.toString(), voteAccount },
                    signTransaction!
                );

                setStakeState({ status: "done", signature, error: null });
                toast.success(`Successfully delegated ${amountSol} SOL!`, {
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
        [checkWallet, onSuccess, signTransaction, walletPubkey]
    );

    const handleUnstakeNative = useCallback(
        async (nativeStakeAddress: string) => {
            setUnstakeState(INIT_STATE);
            if (!checkWallet("unstake")) return false;
            setUnstakeState((s) => ({ ...s, status: "signing" }));

            try {
                const { signature } = await buildSignSend({ mode: "native", action: "unstake", wallet: walletPubkey!, nativeStakeAddress }, signTransaction!);

                setUnstakeState({ status: "done", signature, error: null });
                toast.success("Deactivation started. This stake account will be withdrawable once the current epoch ends.", { duration: 10000 });
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
        [checkWallet, onSuccess, signTransaction, walletPubkey]
    );

    const handleWithdrawNative = useCallback(
        async (nativeStakeAddress: string, amountLamports: string) => {
            setWithdrawState(INIT_STATE);
            if (!checkWallet("withdraw SOL")) return false;
            setWithdrawState((s) => ({ ...s, status: "signing" }));

            try {
                const { signature } = await buildSignSend(
                    { mode: "native", action: "withdraw", wallet: walletPubkey!, nativeStakeAddress, amountLamports },
                    signTransaction!
                );

                setWithdrawState({ status: "done", signature, error: null });
                toast.success("SOL successfully withdrawn!", {
                    duration: 8000,
                    action: { label: "Solscan", onClick: () => window.open(getSolscanTxUrl(signature), "_blank") }
                });
                onSuccess?.({ signature });
                return true;
            } catch (err) {
                const { message, isRejected } = parseStakingError(err);
                setWithdrawState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
                return false;
            }
        },
        [checkWallet, onSuccess, signTransaction, walletPubkey]
    );

    return {
        stakeState,
        unstakeState,
        withdrawState,
        resetStakeState,
        resetUnstakeState,
        resetWithdrawState,
        handleStakeNative,
        handleUnstakeNative,
        handleWithdrawNative
    };
}
