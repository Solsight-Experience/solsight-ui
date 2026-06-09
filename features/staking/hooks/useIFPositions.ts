"use client";

import { useQuery } from "@tanstack/react-query";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { IF_CONFIG } from "../constants/program";
import { getStakingConnection } from "./useIFProgram";

const encoder = new TextEncoder();
const ZERO = BigInt(0);
const U32_FACTOR = BigInt(0x100000000);
const U64_FACTOR = BigInt(2) ** BigInt(64);

export interface IFPosition {
    ifShares: string;
    totalShares: string;
    vaultJitoTokenUnits: string;
    estimatedSol: number;
    lastWithdrawRequestShares: string;
    /** jitoSOL token units converted to SOL (devnet 1:1) */
    lastWithdrawRequestValue: number;
    lastWithdrawRequestTs: number;
    cooldownEndsAt: number;
    canWithdraw: boolean;
    unstakingPeriod: number;
}

// ─── PDA helpers ──────────────────────────────────────────────────────────────
export function getIFPdas(walletPubkey: string) {
    if (!IF_CONFIG.isEnabled) {
        throw new Error(IF_CONFIG.unavailableReason ?? `${IF_CONFIG.label} staking is unavailable.`);
    }

    const ifProgramPk = new PublicKey(IF_CONFIG.ifProgramId);
    const ifAuthorityPk = new PublicKey(IF_CONFIG.ifAuthority);
    const poolMintPk = new PublicKey(IF_CONFIG.poolMint);

    const [ifPda] = PublicKey.findProgramAddressSync([encoder.encode("insurance_fund"), ifAuthorityPk.toBuffer()], ifProgramPk);
    const [vaultPda] = PublicKey.findProgramAddressSync([encoder.encode("if_vault"), ifPda.toBuffer()], ifProgramPk);
    const [ifStakePda] = PublicKey.findProgramAddressSync([encoder.encode("if_stake"), ifPda.toBuffer(), new PublicKey(walletPubkey).toBuffer()], ifProgramPk);
    const vaultTA = getAssociatedTokenAddressSync(poolMintPk, vaultPda, true);
    return { ifPda, vaultPda, ifStakePda, vaultTA };
}

// ─── Manual Borsh decoders (DataView — works in both Node and browser) ────────
function readU64LE(data: Uint8Array, offset: number): bigint {
    const view = new DataView(data.buffer, data.byteOffset);
    const lo = BigInt(view.getUint32(offset, true));
    const hi = BigInt(view.getUint32(offset + 4, true));
    return lo + hi * U32_FACTOR;
}

function readI64LE(data: Uint8Array, offset: number): bigint {
    const view = new DataView(data.buffer, data.byteOffset);
    const lo = BigInt(view.getUint32(offset, true));
    const hi = BigInt(view.getInt32(offset + 4, true));
    return lo | (BigInt(hi) << BigInt(32));
}

function readU128LE(data: Uint8Array, offset: number): bigint {
    return readU64LE(data, offset) + readU64LE(data, offset + 8) * U64_FACTOR;
}

/**
 * InsuranceFund layout (after 8-byte discriminator):
 * authority[32] vault[32] vaultTokenAccount[32]
 * totalShares u128[16]  unstakingPeriod i64[8]  totalRevenue u64[8]
 * ifPaused bool[1]  bump u8[1]  vaultBump u8[1]
 */
function decodeInsuranceFund(data: Uint8Array) {
    const o = 8 + 32 + 32 + 32; // skip discriminator + 3 pubkeys
    const totalShares = readU128LE(data, o);
    const unstakingPeriod = readI64LE(data, o + 16);
    return { totalShares, unstakingPeriod: Number(unstakingPeriod) };
}

/**
 * IFStakeAccount layout (after 8-byte discriminator):
 * authority[32]  ifShares u128[16]
 * lastWithdrawRequestShares u128[16]  lastWithdrawRequestValue u64[8]
 * lastWithdrawRequestTs i64[8]  bump u8[1]
 */
function decodeIFStakeAccount(data: Uint8Array) {
    const o = 8 + 32;
    const ifShares = readU128LE(data, o);
    const lastWithdrawRequestShares = readU128LE(data, o + 16);
    const lastWithdrawRequestValue = readU64LE(data, o + 32);
    const lastWithdrawRequestTs = readI64LE(data, o + 40);
    return { ifShares, lastWithdrawRequestShares, lastWithdrawRequestValue, lastWithdrawRequestTs };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useIFPositions(connected: boolean, walletPubkey: string | null) {
    return useQuery<IFPosition | null>({
        queryKey: ["if-position", walletPubkey],
        enabled: !!walletPubkey && connected && IF_CONFIG.isEnabled,
        staleTime: 30_000,
        refetchInterval: 60_000,
        queryFn: async (): Promise<IFPosition | null> => {
            if (!walletPubkey) return null;
            const conn = getStakingConnection();
            const { ifPda, ifStakePda, vaultTA } = getIFPdas(walletPubkey);

            const [ifInfo, stakeInfo, vaultBalance] = await Promise.all([
                conn.getAccountInfo(ifPda),
                conn.getAccountInfo(ifStakePda),
                conn.getTokenAccountBalance(vaultTA).catch(() => null)
            ]);

            if (!ifInfo) return null; // Fund is not initialized for the configured network yet.
            if (!stakeInfo) return null; // User hasn't staked

            const fund = decodeInsuranceFund(ifInfo.data as Uint8Array);
            const stake = decodeIFStakeAccount(stakeInfo.data as Uint8Array);
            const vaultJitoUnits = vaultBalance ? BigInt(vaultBalance.value.amount) : ZERO;

            // estimatedSol: shares * pool token units / totalShares / LAMPORTS_PER_SOL.
            // The IF program stores value in pool-token units.
            let estimatedSol = 0;
            if (fund.totalShares > ZERO && vaultJitoUnits > ZERO) {
                estimatedSol = Number((stake.ifShares * vaultJitoUnits) / fund.totalShares) / LAMPORTS_PER_SOL;
            }

            const now = Math.floor(Date.now() / 1000);
            const cooldownEndsAt = stake.lastWithdrawRequestShares > ZERO ? Number(stake.lastWithdrawRequestTs) + fund.unstakingPeriod : 0;
            const canWithdraw = stake.lastWithdrawRequestShares > ZERO && now >= cooldownEndsAt;

            return {
                ifShares: stake.ifShares.toString(),
                totalShares: fund.totalShares.toString(),
                vaultJitoTokenUnits: vaultJitoUnits.toString(),
                estimatedSol,
                lastWithdrawRequestShares: stake.lastWithdrawRequestShares.toString(),
                lastWithdrawRequestValue: Number(stake.lastWithdrawRequestValue) / LAMPORTS_PER_SOL,
                lastWithdrawRequestTs: Number(stake.lastWithdrawRequestTs),
                cooldownEndsAt,
                canWithdraw,
                unstakingPeriod: fund.unstakingPeriod
            };
        }
    });
}
