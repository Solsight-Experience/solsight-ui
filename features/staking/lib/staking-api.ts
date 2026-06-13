"use client";

import apiClient from "@/lib/api-client";

export type StakingTransactionAction = "stake" | "request-unstake" | "unstake" | "cancel-request";

export interface BuildStakingTransactionRequest {
    action: StakingTransactionAction;
    wallet: string;
    amountLamports?: string;
}

export interface BuiltStakingTransaction {
    action: StakingTransactionAction;
    network: "mainnet" | "devnet";
    transaction: string;
    blockhash: string;
    lastValidBlockHeight: number;
}

export interface StakingFundSnapshot {
    authority: string;
    stakePool: string;
    stakePoolProgram: string;
    poolMint: string;
    withdrawAuthority: string;
    reserveStake: string;
    managerFeeAccount: string;
    vault: string;
    vaultTokenAccount: string;
    totalShares: string;
    unstakingPeriod: number;
    totalRevenue: string;
    ifPaused: boolean;
}

export interface StakingPositionResponse {
    ifShares: string;
    totalShares: string;
    vaultJitoTokenUnits: string;
    estimatedSol: number;
    lastWithdrawRequestShares: string;
    lastWithdrawRequestValue: number;
    lastWithdrawRequestTs: number;
    cooldownEndsAt: number;
    canWithdraw: boolean;
    unstakingPeriod: number;
    fund: StakingFundSnapshot;
}

export type StakeActionType = "stake" | "unstake" | "withdraw" | "cancel";
export type StakeRecordStatus = "pending" | "confirmed" | "failed" | "cooling_down" | "withdrawn";

export interface StakeHistoryRecord {
    id: string;
    stakeAccountAddress: string;
    createdAt: string;
    actionType: StakeActionType;
    status: StakeRecordStatus;
    amountSol: string;
    signature: string;
}

export interface StakingHistoryResponse {
    records: StakeHistoryRecord[];
    total: number;
}

export function buildStakingTransaction(request: BuildStakingTransactionRequest): Promise<BuiltStakingTransaction> {
    return apiClient.post<BuiltStakingTransaction>("/api/staking/transaction", request);
}

export function getStakingPosition(wallet: string): Promise<StakingPositionResponse | null> {
    return apiClient.get<StakingPositionResponse | null>("/api/staking/position", {
        params: { wallet }
    });
}

export function getStakingHistory(wallet: string, page: number, pageSize: number): Promise<StakingHistoryResponse> {
    return apiClient.get<StakingHistoryResponse>("/api/staking/history", {
        params: { wallet, page, pageSize }
    });
}
