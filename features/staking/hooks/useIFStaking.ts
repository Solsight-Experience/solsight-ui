"use client";

import { useState, useCallback } from "react";
import bs58 from "bs58";
import { VersionedTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { IF_CONFIG, IF_MIN_STAKE_SOL, getSolscanTxUrl } from "../constants/program";
import { getStakingConnection } from "./useIFProgram";
import { IFPosition } from "./useIFPositions";
import { buildStakingTransaction, type StakingTransactionAction } from "../lib/staking-api";
import useClusterStore from "@/stores/cluster.store";

export type IFStakeStatus = "idle" | "creating" | "signing" | "confirming" | "done" | "error";

interface IFStakeState {
    status: IFStakeStatus;
    signature: string | null;
    error: string | null;
}

const INIT_STATE: IFStakeState = { status: "idle", signature: null, error: null };

type StakingWalletProvider = {
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
    network?: string;
};

type WindowWithSolana = Window &
    typeof globalThis & {
        phantom?: { solana?: StakingWalletProvider };
        solana?: StakingWalletProvider;
    };

function hasTransactionLogs(value: unknown): value is { logs?: string[] } {
    return typeof value === "object" && value !== null && "logs" in value;
}

function getWalletProvider(): StakingWalletProvider | undefined {
    if (typeof window === "undefined") return undefined;
    const walletWindow = window as WindowWithSolana;
    return walletWindow.phantom?.solana ?? walletWindow.solana ?? undefined;
}

function base64ToBytes(value: string): Uint8Array {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function normalizeWalletNetwork(network?: string): "mainnet" | "devnet" | null {
    if (!network) return null;
    const normalized = network.toLowerCase();
    if (normalized === "devnet") return "devnet";
    if (normalized === "mainnet" || normalized === "mainnet-beta") return "mainnet";
    return null;
}

// ─── Error classification ──────────────────────────────────────────────────────
function parseError(err: unknown): { message: string; isRejected: boolean } {
    const raw = ((err as Error)?.message ?? String(err)).toLowerCase();

    // Log raw error for debugging (check browser console)
    console.error("[IFStaking] raw error:", (err as Error)?.message ?? String(err));

    if (raw.includes("rejected") || raw.includes("cancelled") || raw.includes("user rejected")) {
        return { message: "", isRejected: true };
    }
    // Drift custom errors — match BEFORE generic 'insufficient' check
    if (raw.includes("0x1778") || raw.includes("ifstakingdisabled")) {
        return { message: "Insurance Fund staking is currently paused.", isRejected: false };
    }
    if (raw.includes("0x1774") || raw.includes("amounttoosmall")) {
        return { message: `Minimum stake is ${IF_MIN_STAKE_SOL} SOL.`, isRejected: false };
    }
    if (raw.includes("0x1779") || raw.includes("withdrawrequestinprogress")) {
        return { message: "Cancel your pending unstake request before staking again.", isRejected: false };
    }
    if (raw.includes("0x177a") || raw.includes("cooldownnotelapsed")) {
        return { message: "Cooldown period has not elapsed yet.", isRejected: false };
    }
    if (raw.includes("0x177b") || raw.includes("noactivestake")) {
        return { message: "No active stake position found.", isRejected: false };
    }
    // Generic Solana errors — use word boundary to avoid matching 0x1770, 0x1774 etc.
    if (raw.includes("insufficient funds") || raw.includes("insufficient lamports") || /\b0x1\b/.test(raw)) {
        return { message: "Not enough SOL. Please add more SOL to your wallet.", isRejected: false };
    }
    if (raw.includes("blockhash") || raw.includes("expired")) {
        return { message: "Transaction expired. Please try again.", isRejected: false };
    }
    if (raw.includes("rate limit") || raw.includes("429")) {
        return { message: "RPC rate limit reached. Please wait a moment.", isRejected: false };
    }
    if (raw.includes("simulation failed") || raw.includes("0x")) {
        // Extract hex error code if present to show in message
        const codeMatch = ((err as Error)?.message ?? "").match(/0x[0-9a-fA-F]+/);
        const code = codeMatch ? ` (code: ${codeMatch[0]})` : "";
        return { message: `Transaction failed${code}. Check browser console for details.`, isRejected: false };
    }
    return { message: "Something went wrong. Please try again.", isRejected: false };
}

// ─── Core: API build → wallet sign → send ─────────────────────────────────────
// The backend owns transaction construction; the browser only signs with the user's wallet.
async function buildSignSend(walletPubkey: string, action: StakingTransactionAction, amountLamports?: bigint): Promise<string> {
    const conn = getStakingConnection();
    const provider = getWalletProvider();
    if (!provider) throw new Error("Wallet provider not found.");

    const providerNetwork = normalizeWalletNetwork(provider.network);
    if (providerNetwork && providerNetwork !== IF_CONFIG.network) {
        throw new Error(`Wallet is on ${providerNetwork}, but staking is configured for ${IF_CONFIG.network}.`);
    }

    const built = await buildStakingTransaction({
        action,
        wallet: walletPubkey,
        amountLamports: amountLamports?.toString()
    });
    const vtx = VersionedTransaction.deserialize(base64ToBytes(built.transaction));
    const signed = await provider.signTransaction(vtx);
    // Transaction ID = base58 of first signature (derived before send for "already processed" handling)
    const txSig = bs58.encode(signed.signatures[0]);
    try {
        await conn.sendRawTransaction(signed.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed"
        });
    } catch (sendErr: unknown) {
        const errMsg = ((sendErr as Error)?.message ?? "").toLowerCase();
        if (errMsg.includes("already been processed") || errMsg.includes("already processed")) {
            // Tx was already submitted and landed — fall through to polling below.
            console.warn("[IFStaking] tx already processed, verifying on-chain:", txSig);
        } else {
            const logs = hasTransactionLogs(sendErr) ? sendErr.logs : undefined;
            if (logs?.length) {
                console.error("[IFStaking] simulation logs:\n", logs.join("\n"));
            }
            throw sendErr;
        }
    }
    // Poll getSignatureStatuses instead of confirmTransaction — avoids the race condition
    // where the block-height monitor fires before the WebSocket notification on devnet.
    // devnet typically confirms in < 2 s; poll every second for up to 20 attempts (20 s).
    for (let attempt = 0; attempt < 20; attempt++) {
        const { value } = await conn.getSignatureStatuses([txSig], { searchTransactionHistory: true });
        const status = value[0];
        if (status) {
            if (status.err) throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
            if (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized") {
                return txSig;
            }
        }
        await new Promise<void>((r) => setTimeout(r, 1000));
    }
    throw new Error("Transaction confirmation timed out. Check Solscan to verify the status.");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useIFStaking(connected: boolean, walletPubkey: string | null, onSuccess?: () => void) {
    const [stakeState, setStakeState] = useState<IFStakeState>(INIT_STATE);
    const [requestUnstakeState, setRequestUnstakeState] = useState<IFStakeState>(INIT_STATE);
    const [unstakeState, setUnstakeState] = useState<IFStakeState>(INIT_STATE);
    const [cancelRequestState, setCancelRequestState] = useState<IFStakeState>(INIT_STATE);

    const checkWallet = useCallback(() => {
        if (!IF_CONFIG.isEnabled) {
            toast.error(IF_CONFIG.unavailableReason ?? `${IF_CONFIG.label} staking is unavailable.`);
            return false;
        }

        if (!connected || !walletPubkey) {
            toast.error("Wallet not connected. Please connect and try again.");
            return false;
        }
        const selectedCluster = useClusterStore.getState().cluster;
        if (selectedCluster !== IF_CONFIG.network) {
            toast.error(`Switch the app cluster to ${IF_CONFIG.label} before staking.`);
            return false;
        }
        return true;
    }, [connected, walletPubkey]);

    // ── Stake SOL ──────────────────────────────────────────────────────────────
    const handleStake = useCallback(
        async (amountSol: number) => {
            setStakeState(INIT_STATE);
            if (amountSol < IF_MIN_STAKE_SOL) {
                toast.error(`Minimum stake is ${IF_MIN_STAKE_SOL} SOL.`);
                return false;
            }
            if (!checkWallet()) return false;
            setStakeState((s) => ({ ...s, status: "creating" }));

            try {
                setStakeState((s) => ({ ...s, status: "signing" }));
                const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));
                const txSig = await buildSignSend(walletPubkey!, "stake", lamports);

                setStakeState({ status: "done", signature: txSig, error: null });
                toast.success(`Successfully staked ${amountSol} SOL!`, {
                    duration: 8000,
                    action: {
                        label: "Solscan",
                        onClick: () => window.open(getSolscanTxUrl(txSig), "_blank")
                    }
                });
                onSuccess?.();
                return true;
            } catch (err) {
                const { message, isRejected } = parseError(err);
                setStakeState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
                return false;
            }
        },
        [checkWallet, onSuccess, walletPubkey]
    );

    // ── Request Unstake (start cooldown) ──────────────────────────────────────
    const handleRequestUnstake = useCallback(
        async (amountSol: number, position: IFPosition) => {
            void position;
            setRequestUnstakeState(INIT_STATE);
            if (!checkWallet()) return false;
            setRequestUnstakeState((s) => ({ ...s, status: "creating" }));

            try {
                setRequestUnstakeState((s) => ({ ...s, status: "signing" }));
                const requestedLamports = BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));
                const txSig = await buildSignSend(walletPubkey!, "request-unstake", requestedLamports);

                setRequestUnstakeState({ status: "done", signature: txSig, error: null });
                toast.success("Unstake request submitted. Wait for the cooldown to complete.", {
                    duration: 10000
                });
                onSuccess?.();
                return true;
            } catch (err) {
                const { message, isRejected } = parseError(err);
                setRequestUnstakeState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
                return false;
            }
        },
        [checkWallet, onSuccess, walletPubkey]
    );

    // ── Withdraw after cooldown ────────────────────────────────────────────────
    const handleUnstake = useCallback(async () => {
        setUnstakeState(INIT_STATE);
        if (!checkWallet()) return false;
        setUnstakeState((s) => ({ ...s, status: "creating" }));

        try {
            setUnstakeState((s) => ({ ...s, status: "signing" }));
            const txSig = await buildSignSend(walletPubkey!, "unstake");

            setUnstakeState({ status: "done", signature: txSig, error: null });
            toast.success("SOL successfully withdrawn from Insurance Fund!", {
                duration: 8000,
                action: {
                    label: "Solscan",
                    onClick: () => window.open(getSolscanTxUrl(txSig), "_blank")
                }
            });
            onSuccess?.();
            return true;
        } catch (err) {
            const { message, isRejected } = parseError(err);
            setUnstakeState({ status: "error", signature: null, error: isRejected ? null : message });
            if (isRejected) toast.info("Transaction cancelled.");
            else toast.error(message, { duration: 8000 });
            return false;
        }
    }, [checkWallet, onSuccess, walletPubkey]);

    // ── Cancel pending unstake request ────────────────────────────────────────
    const handleCancelRequest = useCallback(async () => {
        setCancelRequestState(INIT_STATE);
        if (!checkWallet()) return false;
        setCancelRequestState((s) => ({ ...s, status: "creating" }));

        try {
            setCancelRequestState((s) => ({ ...s, status: "signing" }));
            const txSig = await buildSignSend(walletPubkey!, "cancel-request");

            setCancelRequestState({ status: "done", signature: txSig, error: null });
            toast.success("Unstake request cancelled. Your SOL remains staked.");
            onSuccess?.();
            return true;
        } catch (err) {
            const { message, isRejected } = parseError(err);
            setCancelRequestState({ status: "error", signature: null, error: isRejected ? null : message });
            if (isRejected) toast.info("Transaction cancelled.");
            else toast.error(message, { duration: 8000 });
            return false;
        }
    }, [checkWallet, onSuccess, walletPubkey]);

    return {
        stakeState,
        requestUnstakeState,
        unstakeState,
        cancelRequestState,
        handleStake,
        handleRequestUnstake,
        handleUnstake,
        handleCancelRequest
    };
}
