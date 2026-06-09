"use client";

import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IF_CONFIG } from "../constants/program";
import { getIFPdas } from "./useIFPositions";
import { getStakingConnection } from "./useIFProgram";

export type StakeActionType = "stake" | "unstake" | "withdraw" | "cancel";
export type StakeRecordStatus = "pending" | "confirmed" | "failed" | "cooling_down" | "withdrawn";

export interface StakeRecord {
    id: string;
    stakeAccountAddress: string;
    createdAt: string;
    actionType: StakeActionType;
    status: StakeRecordStatus;
    amountSol: string;
    signature: string;
}

interface StakeHistoryResult {
    records: StakeRecord[];
    total: number;
}

function classifyLogs(logs: string[]): StakeActionType | null {
    for (const log of logs) {
        if (log.includes("Instruction: AddInsuranceFundStake")) return "stake";
        if (log.includes("Instruction: RequestRemoveInsuranceFundStake")) return "unstake";
        if (log.includes("Instruction: RemoveInsuranceFundStake")) return "withdraw";
        if (log.includes("Instruction: CancelRequestRemoveInsuranceFundStake")) return "cancel";
    }
    return null;
}

/**
 * Parse SOL amount from Anchor instruction data.
 * addInsuranceFundStake: 8 bytes discriminator + 8 bytes u64 LE (solAmount)
 * requestRemoveInsuranceFundStake: 8 bytes discriminator + 16 bytes u128 LE (shares)
 */
function parseAmountFromIxData(data: Uint8Array, actionType: StakeActionType): string {
    try {
        if (actionType === "stake" && data.length >= 16) {
            const view = new DataView(data.buffer, data.byteOffset);
            const lo = view.getUint32(8, true);
            const hi = view.getUint32(12, true);
            const lamports = lo + hi * 4294967296;
            const sol = lamports / LAMPORTS_PER_SOL;
            return sol > 0 ? sol.toFixed(6) : "0";
        }
    } catch {
        // ignore parse errors
    }
    return "0";
}

export function useIFStakeHistory(walletPubkey: string | null, page: number, pageSize: number) {
    return useQuery<StakeHistoryResult>({
        queryKey: ["if-stake-history", walletPubkey, page, pageSize],
        enabled: !!walletPubkey && IF_CONFIG.isEnabled,
        staleTime: 120_000,
        queryFn: async (): Promise<StakeHistoryResult> => {
            if (!walletPubkey) return { records: [], total: 0 };

            const conn: Connection = getStakingConnection();
            const { ifStakePda } = getIFPdas(walletPubkey);
            const ifProgramPk = new PublicKey(IF_CONFIG.ifProgramId);

            const allSigs = await conn.getSignaturesForAddress(ifStakePda, { limit: 100 });
            const total = allSigs.length;
            const start = (page - 1) * pageSize;
            const pageSigs = allSigs.slice(start, start + pageSize);

            const records: StakeRecord[] = [];

            for (const sigInfo of pageSigs) {
                try {
                    const tx = await conn.getTransaction(sigInfo.signature, {
                        maxSupportedTransactionVersion: 0,
                        commitment: "confirmed"
                    });
                    if (!tx) continue;

                    const logs = tx.meta?.logMessages ?? [];
                    const actionType = classifyLogs(logs);
                    if (!actionType) continue;

                    // Parse amount from our program's instruction
                    let amountSol = "0";
                    try {
                        const msg = tx.transaction.message;
                        const compiledIxs = (msg as any).compiledInstructions as Array<{ programIdIndex: number; data: Uint8Array }> | undefined;
                        const staticKeys = (msg as any).staticAccountKeys as PublicKey[] | undefined;

                        if (compiledIxs && staticKeys) {
                            for (const ix of compiledIxs) {
                                const ixPubkey = staticKeys[ix.programIdIndex];
                                if (ixPubkey && ixPubkey.equals(ifProgramPk) && ix.data) {
                                    amountSol = parseAmountFromIxData(ix.data, actionType);
                                    break;
                                }
                            }
                        }
                    } catch {
                        // ignore
                    }

                    const status: StakeRecordStatus = tx.meta?.err
                        ? "failed"
                        : actionType === "unstake"
                          ? "cooling_down"
                          : actionType === "withdraw"
                            ? "withdrawn"
                            : "confirmed";

                    records.push({
                        id: sigInfo.signature,
                        stakeAccountAddress: ifStakePda.toBase58(),
                        createdAt: new Date((sigInfo.blockTime ?? 0) * 1000).toISOString(),
                        actionType,
                        status,
                        amountSol,
                        signature: sigInfo.signature
                    });
                } catch {
                    // skip individual fetch failures
                }
            }

            return { records, total };
        }
    });
}
