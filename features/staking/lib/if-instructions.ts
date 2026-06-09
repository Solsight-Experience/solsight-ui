"use client";

/**
 * Manual Anchor instruction builders for the Insurance Fund program.
 *
 * WHY: @coral-xyz/anchor has its own nested node_modules with:
 *   bs58 → base-x → safe-buffer
 * In Turbopack's browser build, safe-buffer's Buffer ends up as a different
 * module instance than globalThis.Buffer, so `Buffer.isBuffer()` always
 * returns false → TypeError: Expected Buffer inside base-x encode().
 *
 * By building instructions manually we bypass the Anchor Program class and
 * its entire dependency chain.  We only use @solana/web3.js which has no
 * Buffer.isBuffer() issues in this environment.
 *
 * Discriminators = sha256("global:<snake_case_name>")[0..8]
 * Pre-computed with: crypto.createHash('sha256').update('global:name').digest().slice(0,8)
 */

import {
    PublicKey,
    TransactionInstruction,
    SystemProgram,
    SYSVAR_CLOCK_PUBKEY,
    SYSVAR_STAKE_HISTORY_PUBKEY,
    StakeProgram,
    type AccountMeta
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { IFConfig } from "../constants/program";
import type { StakePoolAccounts } from "./spl-pool-update";

const U64_MASK = (BigInt(1) << BigInt(64)) - BigInt(1);

// ─── Pre-computed 8-byte discriminators ──────────────────────────────────────
const DISC = {
    // sha256("global:add_insurance_fund_stake")[0..8]
    addInsuranceFundStake: new Uint8Array([251, 144, 115, 11, 222, 47, 62, 236]),
    // sha256("global:request_remove_insurance_fund_stake")[0..8]
    requestRemoveInsuranceFundStake: new Uint8Array([142, 70, 204, 92, 73, 106, 180, 52]),
    // sha256("global:cancel_request_remove_insurance_fund_stake")[0..8]
    cancelRequestRemoveInsuranceFundStake: new Uint8Array([97, 235, 78, 62, 212, 42, 241, 127]),
    // sha256("global:remove_insurance_fund_stake")[0..8]
    removeInsuranceFundStake: new Uint8Array([128, 166, 142, 9, 254, 187, 143, 174])
} as const;

// ─── Borsh primitives (pure DataView — zero Buffer dependency) ────────────────

/** u64 little-endian (8 bytes) */
function u64LE(value: bigint): Uint8Array {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setBigUint64(0, value, /* littleEndian */ true);
    return new Uint8Array(buf);
}

/** u128 little-endian (16 bytes) */
function u128LE(value: bigint): Uint8Array {
    const buf = new ArrayBuffer(16);
    const view = new DataView(buf);
    view.setBigUint64(0, value & U64_MASK, true);
    view.setBigUint64(8, value >> BigInt(64), true);
    return new Uint8Array(buf);
}

function concat(...parts: Uint8Array[]): Uint8Array {
    const total = parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of parts) {
        out.set(p, off);
        off += p.length;
    }
    return out;
}

// ─── Instruction builders ─────────────────────────────────────────────────────

export interface AddStakeAccounts {
    owner: PublicKey;
    insuranceFund: PublicKey;
    vaultTokenAccount: PublicKey;
    ifStake: PublicKey;
}

/** addInsuranceFundStake(solAmount: u64) */
export function buildAddStakeIx(config: IFConfig, stakePool: StakePoolAccounts, accs: AddStakeAccounts, solLamports: bigint): TransactionInstruction {
    const data = concat(DISC.addInsuranceFundStake, u64LE(solLamports));
    const keys: AccountMeta[] = [
        { pubkey: accs.owner, isSigner: true, isWritable: true },
        { pubkey: accs.insuranceFund, isSigner: false, isWritable: true },
        { pubkey: accs.vaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: accs.ifStake, isSigner: false, isWritable: true },
        { pubkey: stakePool.stakePool, isSigner: false, isWritable: true },
        { pubkey: stakePool.withdrawAuthority, isSigner: false, isWritable: false },
        { pubkey: stakePool.reserveStake, isSigner: false, isWritable: true },
        { pubkey: stakePool.managerFeeAccount, isSigner: false, isWritable: true },
        { pubkey: stakePool.poolMint, isSigner: false, isWritable: true },
        { pubkey: stakePool.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ];
    return new TransactionInstruction({ programId: new PublicKey(config.ifProgramId), keys, data: data as any });
}

export interface RequestUnstakeAccounts {
    owner: PublicKey;
    insuranceFund: PublicKey;
    ifStake: PublicKey;
    vaultTokenAccount: PublicKey;
}

/** requestRemoveInsuranceFundStake(shares: u128) */
export function buildRequestUnstakeIx(config: IFConfig, accs: RequestUnstakeAccounts, shares: bigint): TransactionInstruction {
    const data = concat(DISC.requestRemoveInsuranceFundStake, u128LE(shares));
    const keys: AccountMeta[] = [
        { pubkey: accs.owner, isSigner: true, isWritable: true },
        { pubkey: accs.insuranceFund, isSigner: false, isWritable: false },
        { pubkey: accs.ifStake, isSigner: false, isWritable: true },
        { pubkey: accs.vaultTokenAccount, isSigner: false, isWritable: false }
    ];
    return new TransactionInstruction({ programId: new PublicKey(config.ifProgramId), keys, data: data as any });
}

export interface CancelRequestAccounts {
    owner: PublicKey;
    insuranceFund: PublicKey;
    ifStake: PublicKey;
}

/** cancelRequestRemoveInsuranceFundStake() */
export function buildCancelRequestIx(config: IFConfig, accs: CancelRequestAccounts): TransactionInstruction {
    const keys: AccountMeta[] = [
        { pubkey: accs.owner, isSigner: true, isWritable: false },
        { pubkey: accs.insuranceFund, isSigner: false, isWritable: false },
        { pubkey: accs.ifStake, isSigner: false, isWritable: true }
    ];
    return new TransactionInstruction({ programId: new PublicKey(config.ifProgramId), keys, data: DISC.cancelRequestRemoveInsuranceFundStake as any });
}

export interface RemoveStakeAccounts {
    owner: PublicKey;
    insuranceFund: PublicKey;
    ifStake: PublicKey;
    vault: PublicKey;
    vaultTokenAccount: PublicKey;
}

/** removeInsuranceFundStake() */
export function buildRemoveStakeIx(config: IFConfig, stakePool: StakePoolAccounts, accs: RemoveStakeAccounts): TransactionInstruction {
    const keys: AccountMeta[] = [
        { pubkey: accs.owner, isSigner: true, isWritable: true },
        { pubkey: accs.insuranceFund, isSigner: false, isWritable: true },
        { pubkey: accs.ifStake, isSigner: false, isWritable: true },
        { pubkey: accs.vault, isSigner: false, isWritable: true },
        { pubkey: accs.vaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: stakePool.stakePool, isSigner: false, isWritable: true },
        { pubkey: stakePool.withdrawAuthority, isSigner: false, isWritable: false },
        { pubkey: stakePool.reserveStake, isSigner: false, isWritable: true },
        { pubkey: stakePool.managerFeeAccount, isSigner: false, isWritable: true },
        { pubkey: stakePool.poolMint, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_STAKE_HISTORY_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: StakeProgram.programId, isSigner: false, isWritable: false },
        { pubkey: stakePool.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ];
    return new TransactionInstruction({ programId: new PublicKey(config.ifProgramId), keys, data: DISC.removeInsuranceFundStake as any });
}
