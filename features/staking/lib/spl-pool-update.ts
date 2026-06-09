"use client";

import {
    Connection,
    PublicKey,
    TransactionInstruction,
    SYSVAR_CLOCK_PUBKEY,
    SYSVAR_STAKE_HISTORY_PUBKEY,
    StakeProgram,
    type AccountMeta
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { IFConfig } from "../constants/program";

const transientSeed = new TextEncoder().encode("transient");
const withdrawSeed = new TextEncoder().encode("withdraw");

export interface StakePoolAccounts {
    programId: PublicKey;
    stakePool: PublicKey;
    withdrawAuthority: PublicKey;
    validatorList: PublicKey;
    reserveStake: PublicKey;
    managerFeeAccount: PublicKey;
    poolMint: PublicKey;
}

interface ValidatorEntry {
    stakeAccount: PublicKey;
    transientStakeAccount: PublicKey;
}

function pubkeyAt(data: Uint8Array, offset: number): PublicKey {
    return new PublicKey(new Uint8Array(data.buffer, data.byteOffset + offset, 32));
}

export async function getStakePoolAccounts(conn: Connection, config: IFConfig): Promise<StakePoolAccounts> {
    const programId = new PublicKey(config.stakePoolProgramId);
    const stakePool = new PublicKey(config.stakePool);
    const info = await conn.getAccountInfo(stakePool);
    if (!info || info.data.length < 226) {
        throw new Error(`${config.label} stake pool account not found.`);
    }

    const data = info.data;
    const [withdrawAuthority] = PublicKey.findProgramAddressSync([stakePool.toBuffer(), withdrawSeed], programId);

    return {
        programId,
        stakePool,
        withdrawAuthority,
        validatorList: pubkeyAt(data, 98),
        reserveStake: pubkeyAt(data, 130),
        poolMint: pubkeyAt(data, 162),
        managerFeeAccount: pubkeyAt(data, 194)
    };
}

async function getValidatorEntries(conn: Connection, stakePool: StakePoolAccounts): Promise<ValidatorEntry[]> {
    const info = await conn.getAccountInfo(stakePool.validatorList);
    if (!info || info.data.length < 9) return [];

    const d = info.data;
    const dv = new DataView(d.buffer, d.byteOffset);
    const count = dv.getUint32(5, true);
    const entries: ValidatorEntry[] = [];

    for (let i = 0; i < count; i += 1) {
        const base = 9 + i * 73;
        if (base + 73 > d.byteLength) break;

        const transientSeedSuffix = dv.getBigUint64(base + 24, true);
        const validatorSeedSuffix = dv.getUint32(base + 36, true);
        const status = dv.getUint8(base + 40);
        if (status === 2) continue;

        const voteAccount = pubkeyAt(d, base + 41);
        const stakeSeeds: Uint8Array[] = [voteAccount.toBytes(), stakePool.stakePool.toBytes()];

        if (validatorSeedSuffix !== 0) {
            const suffix = new ArrayBuffer(4);
            new DataView(suffix).setUint32(0, validatorSeedSuffix, true);
            stakeSeeds.push(new Uint8Array(suffix));
        }

        const [stakeAccount] = PublicKey.findProgramAddressSync(stakeSeeds, stakePool.programId);

        const transientSuffix = new ArrayBuffer(8);
        new DataView(transientSuffix).setBigUint64(0, transientSeedSuffix, true);
        const [transientStakeAccount] = PublicKey.findProgramAddressSync(
            [transientSeed, voteAccount.toBytes(), stakePool.stakePool.toBytes(), new Uint8Array(transientSuffix)],
            stakePool.programId
        );

        entries.push({ stakeAccount, transientStakeAccount });
    }

    return entries;
}

function buildUpdateValidatorListIx(stakePool: StakePoolAccounts, validators: ValidatorEntry[]): TransactionInstruction {
    const data = new Uint8Array(6);
    data[0] = 6;

    const keys: AccountMeta[] = [
        { pubkey: stakePool.stakePool, isSigner: false, isWritable: false },
        { pubkey: stakePool.withdrawAuthority, isSigner: false, isWritable: false },
        { pubkey: stakePool.validatorList, isSigner: false, isWritable: true },
        { pubkey: stakePool.reserveStake, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_STAKE_HISTORY_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: StakeProgram.programId, isSigner: false, isWritable: false },
        ...validators.flatMap((validator) => [
            { pubkey: validator.stakeAccount, isSigner: false, isWritable: true } as AccountMeta,
            { pubkey: validator.transientStakeAccount, isSigner: false, isWritable: true } as AccountMeta
        ])
    ];

    return new TransactionInstruction({ programId: stakePool.programId, keys, data: data as any });
}

function buildUpdateStakePoolBalanceIx(stakePool: StakePoolAccounts): TransactionInstruction {
    const keys: AccountMeta[] = [
        { pubkey: stakePool.stakePool, isSigner: false, isWritable: true },
        { pubkey: stakePool.withdrawAuthority, isSigner: false, isWritable: false },
        { pubkey: stakePool.validatorList, isSigner: false, isWritable: true },
        { pubkey: stakePool.reserveStake, isSigner: false, isWritable: true },
        { pubkey: stakePool.managerFeeAccount, isSigner: false, isWritable: true },
        { pubkey: stakePool.poolMint, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
    ];

    return new TransactionInstruction({ programId: stakePool.programId, keys, data: new Uint8Array([7]) as any });
}

export async function buildPoolUpdateIxs(conn: Connection, stakePool: StakePoolAccounts): Promise<TransactionInstruction[]> {
    const validators = await getValidatorEntries(conn, stakePool);
    return [buildUpdateValidatorListIx(stakePool, validators), buildUpdateStakePoolBalanceIx(stakePool)];
}
