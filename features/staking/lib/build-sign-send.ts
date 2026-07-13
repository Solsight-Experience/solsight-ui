"use client";

import { VersionedTransaction } from "@solana/web3.js";
import { IF_CONFIG } from "../constants/program";
import { buildStakingTransaction, executeStakingTransaction, type BuildStakingTransactionRequest, type BuiltStakingTransaction } from "./staking-api";

export type SignTransactionFn = (tx: VersionedTransaction) => Promise<VersionedTransaction>;

function base64ToBytes(value: string): Uint8Array {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// ─── Core: API build → wallet sign → API send ─────────────────────────────────
// The backend owns both transaction construction AND broadcast/confirmation (same as swap) —
// the browser only signs with the user's wallet. This avoids sending sendRawTransaction directly
// from the browser to a public RPC endpoint, which gets 403'd (origin-restricted / rate-limited).
export async function buildSignSend(
    request: BuildStakingTransactionRequest,
    signTransaction: SignTransactionFn,
    walletNetwork?: "mainnet" | "devnet" | null
): Promise<{ signature: string; built: BuiltStakingTransaction }> {
    if (walletNetwork && walletNetwork !== IF_CONFIG.network) {
        throw new Error(`Wallet is on ${walletNetwork}, but staking is configured for ${IF_CONFIG.network}.`);
    }

    const built = await buildStakingTransaction(request);
    const vtx = VersionedTransaction.deserialize(base64ToBytes(built.transaction));
    const signed = await signTransaction(vtx);
    const signedTransactionBase64 = Buffer.from(signed.serialize()).toString("base64");

    const { signature } = await executeStakingTransaction(signedTransactionBase64);
    return { signature, built };
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
