"use client";

import { useState, useCallback } from "react";
import bs58 from "bs58";
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { IF_CONFIG, IF_MIN_STAKE_SOL, getSolscanTxUrl } from "../constants/program";
import { getStakingConnection } from "./useIFProgram";
import { getIFPdas, IFPosition } from "./useIFPositions";
import { buildAddStakeIx, buildRequestUnstakeIx, buildCancelRequestIx, buildRemoveStakeIx } from "../lib/if-instructions";
import { buildPoolUpdateIxs, getStakePoolAccounts } from "../lib/spl-pool-update";

export type IFStakeStatus = "idle" | "creating" | "signing" | "confirming" | "done" | "error";

interface IFStakeState {
    status: IFStakeStatus;
    signature: string | null;
    error: string | null;
}

const INIT_STATE: IFStakeState = { status: "idle", signature: null, error: null };
const ZERO = BigInt(0);

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

// ─── Core: build → sign → send ────────────────────────────────────────────────
// Uses VersionedTransaction (v0) to avoid Phantom's legacy `_bn` serialisation path.
async function buildSignSend(walletPubkey: string, instructions: TransactionInstruction[]): Promise<string> {
    const conn = getStakingConnection();
    const phantom = (window as any).phantom?.solana ?? (window as any).solana;
    if (!phantom) throw new Error("Phantom wallet not found.");

    const { blockhash } = await conn.getLatestBlockhash("confirmed");

    const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(walletPubkey),
        recentBlockhash: blockhash,
        instructions
    }).compileToV0Message();

    const vtx = new VersionedTransaction(messageV0);
    const signed = await phantom.signTransaction(vtx);
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
            const logs: string[] | undefined = (sendErr as any)?.logs;
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

    const checkWallet = () => {
        if (!IF_CONFIG.isEnabled) {
            toast.error(IF_CONFIG.unavailableReason ?? `${IF_CONFIG.label} staking is unavailable.`);
            return false;
        }

        if (!connected || !walletPubkey) {
            toast.error("Wallet not connected. Please connect and try again.");
            return false;
        }
        return true;
    };

    // ── Stake SOL ──────────────────────────────────────────────────────────────
    const handleStake = useCallback(
        async (amountSol: number) => {
            setStakeState(INIT_STATE);
            if (amountSol < IF_MIN_STAKE_SOL) {
                toast.error(`Minimum stake is ${IF_MIN_STAKE_SOL} SOL.`);
                return;
            }
            if (!checkWallet()) return;
            setStakeState((s) => ({ ...s, status: "creating" }));

            try {
                setStakeState((s) => ({ ...s, status: "signing" }));
                const config = IF_CONFIG;
                const conn = getStakingConnection();
                const stakePool = await getStakePoolAccounts(conn, config);
                const { ifPda, ifStakePda, vaultTA } = getIFPdas(walletPubkey!);
                const owner = new PublicKey(walletPubkey!);
                const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));

                const ix = buildAddStakeIx(config, stakePool, { owner, insuranceFund: ifPda, vaultTokenAccount: vaultTA, ifStake: ifStakePda }, lamports);

                const updateIxs = await buildPoolUpdateIxs(conn, stakePool);
                const txSig = await buildSignSend(walletPubkey!, [...updateIxs, ix]);

                setStakeState({ status: "done", signature: txSig, error: null });
                toast.success(`Successfully staked ${amountSol} SOL!`, {
                    duration: 8000,
                    action: {
                        label: "Solscan",
                        onClick: () => window.open(getSolscanTxUrl(txSig), "_blank")
                    }
                });
                onSuccess?.();
            } catch (err) {
                const { message, isRejected } = parseError(err);
                setStakeState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
            }
        },
        [connected, walletPubkey]
    );  

    // ── Request Unstake (start cooldown) ──────────────────────────────────────
    const handleRequestUnstake = useCallback(
        async (amountSol: number, position: IFPosition) => {
            setRequestUnstakeState(INIT_STATE);
            if (!checkWallet()) return;
            setRequestUnstakeState((s) => ({ ...s, status: "creating" }));

            try {
                setRequestUnstakeState((s) => ({ ...s, status: "signing" }));
                const config = IF_CONFIG;
                const { ifPda, ifStakePda, vaultTA } = getIFPdas(walletPubkey!);
                const owner = new PublicKey(walletPubkey!);

                const requestedJitoUnits = BigInt(Math.floor(amountSol * LAMPORTS_PER_SOL));
                const totalShares = BigInt(position.totalShares);
                const vaultUnits = BigInt(position.vaultJitoTokenUnits);
                const userShares = BigInt(position.ifShares);

                let sharesToUnstake: bigint;
                if (vaultUnits === ZERO || totalShares === ZERO) {
                    sharesToUnstake = userShares;
                } else {
                    sharesToUnstake = (requestedJitoUnits * totalShares) / vaultUnits;
                    if (sharesToUnstake > userShares) sharesToUnstake = userShares;
                }

                const ix = buildRequestUnstakeIx(config, { owner, insuranceFund: ifPda, ifStake: ifStakePda, vaultTokenAccount: vaultTA }, sharesToUnstake);

                const txSig = await buildSignSend(walletPubkey!, [ix]);

                setRequestUnstakeState({ status: "done", signature: txSig, error: null });
                toast.success("Unstake request submitted. Wait for the cooldown to complete.", {
                    duration: 10000
                });
                onSuccess?.();
            } catch (err) {
                const { message, isRejected } = parseError(err);
                setRequestUnstakeState({ status: "error", signature: null, error: isRejected ? null : message });
                if (isRejected) toast.info("Transaction cancelled.");
                else toast.error(message, { duration: 8000 });
            }
        },
        [connected, walletPubkey]
    );  

    // ── Withdraw after cooldown ────────────────────────────────────────────────
    const handleUnstake = useCallback(async () => {
        setUnstakeState(INIT_STATE);
        if (!checkWallet()) return;
        setUnstakeState((s) => ({ ...s, status: "creating" }));

        try {
            setUnstakeState((s) => ({ ...s, status: "signing" }));
            const config = IF_CONFIG;
            const conn = getStakingConnection();
            const stakePool = await getStakePoolAccounts(conn, config);
            const { ifPda, vaultPda, ifStakePda, vaultTA } = getIFPdas(walletPubkey!);
            const owner = new PublicKey(walletPubkey!);

            const ix = buildRemoveStakeIx(config, stakePool, {
                owner,
                insuranceFund: ifPda,
                ifStake: ifStakePda,
                vault: vaultPda,
                vaultTokenAccount: vaultTA
            });

            const updateIxs = await buildPoolUpdateIxs(conn, stakePool);
            const txSig = await buildSignSend(walletPubkey!, [...updateIxs, ix]);

            setUnstakeState({ status: "done", signature: txSig, error: null });
            toast.success("SOL successfully withdrawn from Insurance Fund!", {
                duration: 8000,
                action: {
                    label: "Solscan",
                    onClick: () => window.open(getSolscanTxUrl(txSig), "_blank")
                }
            });
            onSuccess?.();
        } catch (err) {
            const { message, isRejected } = parseError(err);
            setUnstakeState({ status: "error", signature: null, error: isRejected ? null : message });
            if (isRejected) toast.info("Transaction cancelled.");
            else toast.error(message, { duration: 8000 });
        }
    }, [connected, walletPubkey]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cancel pending unstake request ────────────────────────────────────────
    const handleCancelRequest = useCallback(async () => {
        setCancelRequestState(INIT_STATE);
        if (!checkWallet()) return;
        setCancelRequestState((s) => ({ ...s, status: "creating" }));

        try {
            setCancelRequestState((s) => ({ ...s, status: "signing" }));
            const config = IF_CONFIG;
            const { ifPda, ifStakePda } = getIFPdas(walletPubkey!);
            const owner = new PublicKey(walletPubkey!);

            const ix = buildCancelRequestIx(config, { owner, insuranceFund: ifPda, ifStake: ifStakePda });
            const txSig = await buildSignSend(walletPubkey!, [ix]);

            setCancelRequestState({ status: "done", signature: txSig, error: null });
            toast.success("Unstake request cancelled. Your SOL remains staked.");
            onSuccess?.();
        } catch (err) {
            const { message, isRejected } = parseError(err);
            setCancelRequestState({ status: "error", signature: null, error: isRejected ? null : message });
            if (isRejected) toast.info("Transaction cancelled.");
            else toast.error(message, { duration: 8000 });
        }
    }, [connected, walletPubkey]); // eslint-disable-line react-hooks/exhaustive-deps

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
