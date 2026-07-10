"use client";

import bs58 from "bs58";
import { VersionedTransaction } from "@solana/web3.js";
import { getNativeSolanaProvider } from "@/features/wallets/hooks/useWallet";
import { IF_CONFIG } from "../constants/program";
import { getStakingConnection } from "../hooks/useIFProgram";
import { buildStakingTransaction, type BuildStakingTransactionRequest, type BuiltStakingTransaction } from "./staking-api";

export type SignTransactionFn = (tx: VersionedTransaction) => Promise<VersionedTransaction>;

function hasTransactionLogs(value: unknown): value is { logs?: string[] } {
    return typeof value === "object" && value !== null && "logs" in value;
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

// ─── Core: API build → wallet sign → send ─────────────────────────────────────
// The backend owns transaction construction; the browser only signs with the user's wallet.
export async function buildSignSend(
    request: BuildStakingTransactionRequest,
    signTransaction: SignTransactionFn
): Promise<{ signature: string; built: BuiltStakingTransaction }> {
    const conn = getStakingConnection();
    const provider = getNativeSolanaProvider();

    const providerNetwork = normalizeWalletNetwork(provider?.network);
    if (providerNetwork && providerNetwork !== IF_CONFIG.network) {
        throw new Error(`Wallet is on ${providerNetwork}, but staking is configured for ${IF_CONFIG.network}.`);
    }

    const built = await buildStakingTransaction(request);
    const vtx = VersionedTransaction.deserialize(base64ToBytes(built.transaction));
    const signed = await signTransaction(vtx);
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
            console.warn("[Staking] tx already processed, verifying on-chain:", txSig);
        } else {
            const logs = hasTransactionLogs(sendErr) ? sendErr.logs : undefined;
            if (logs?.length) {
                console.error("[Staking] simulation logs:\n", logs.join("\n"));
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
                return { signature: txSig, built };
            }
        }
        await new Promise<void>((r) => setTimeout(r, 1000));
    }
    throw new Error("Transaction confirmation timed out. Check Solscan to verify the status.");
}

// ─── Error classification ──────────────────────────────────────────────────────
export function parseStakingError(err: unknown): { message: string; isRejected: boolean } {
    const raw = ((err as Error)?.message ?? String(err)).toLowerCase();

    console.error("[Staking] raw error:", (err as Error)?.message ?? String(err));

    if (raw.includes("rejected") || raw.includes("cancelled") || raw.includes("user rejected")) {
        return { message: "", isRejected: true };
    }
    // staking-program error.rs codes (0x1770-based Anchor custom error range)
    if (raw.includes("unauthorized")) {
        return { message: "You are not authorized to perform this action.", isRejected: false };
    }
    if (raw.includes("amounttoosmall")) {
        return { message: "Amount is too small.", isRejected: false };
    }
    if (raw.includes("stakingdisabled")) {
        return { message: "Staking is currently paused.", isRejected: false };
    }
    if (raw.includes("invalidstakepoolconfig") || raw.includes("invalidpoolmint")) {
        return { message: "Staking configuration error. Please try again later.", isRejected: false };
    }
    if (raw.includes("missingwithdrawstakeaccounts")) {
        return { message: "Unable to complete unstake right now. Please try a smaller amount or try again later.", isRejected: false };
    }
    if (raw.includes("validatornotapproved")) {
        return { message: "This validator is not approved for native staking.", isRejected: false };
    }
    // Generic Solana errors — use word boundary to avoid matching 0x1770, 0x1774 etc.
    if (raw.includes("insufficient funds") || raw.includes("insufficient lamports") || /\b0x1\b/.test(raw)) {
        return { message: "Not enough SOL. Please add more SOL to your wallet.", isRejected: false };
    }
    // Native Stake program's InsufficientDelegation — amount is below the cluster's minimum delegation.
    if (/\b0xc\b/.test(raw)) {
        return { message: "Stake amount is below the network's minimum delegation. Please increase the amount.", isRejected: false };
    }
    if (raw.includes("blockhash") || raw.includes("expired")) {
        return { message: "Transaction expired. Please try again.", isRejected: false };
    }
    if (raw.includes("rate limit") || raw.includes("429")) {
        return { message: "RPC rate limit reached. Please wait a moment.", isRejected: false };
    }
    if (raw.includes("simulation failed") || raw.includes("0x")) {
        const codeMatch = ((err as Error)?.message ?? "").match(/0x[0-9a-fA-F]+/);
        const code = codeMatch ? ` (code: ${codeMatch[0]})` : "";
        return { message: `Transaction failed${code}. Check browser console for details.`, isRejected: false };
    }
    return { message: "Something went wrong. Please try again.", isRejected: false };
}
