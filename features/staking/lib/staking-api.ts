"use client";

import apiClient from "@/lib/network-requests/api-client";

export type StakingMode = "liquid" | "native";
export type StakingTransactionAction = "stake" | "unstake" | "withdraw";

export interface BuildStakingTransactionRequest {
    mode: StakingMode;
    action: StakingTransactionAction;
    wallet: string;
    amountLamports?: string;
    voteAccount?: string;
    nativeStakeAddress?: string;
}

export interface BuiltStakingTransaction {
    mode: StakingMode;
    action: StakingTransactionAction;
    network: "mainnet" | "devnet";
    transaction: string;
    blockhash: string;
    lastValidBlockHeight: number;
    nativeStakeAddress?: string;
}

export interface LiquidPositionResponse {
    poolTokenAmount: string;
    estimatedSol: number;
    poolTokenAccount: string;
}

export type NativeStakeStatus = "activating" | "active" | "deactivating" | "inactive";

export interface NativeStakeAccountResponse {
    address: string;
    voteAccount: string;
    lamports: string;
    estimatedSol: number;
    status: NativeStakeStatus;
}

export interface NativeStakePositionsPage {
    items: NativeStakeAccountResponse[];
    total: number;
    page: number;
    pageSize: number;
}

export interface StakingPositionResponse {
    liquid: LiquidPositionResponse | null;
    native: NativeStakePositionsPage;
}

export interface StakingValidatorResponse {
    voteAccount: string;
}

export type StakeActionType = "stake_liquid" | "unstake_liquid" | "stake_native" | "unstake_native" | "withdraw_native";
export type StakeRecordStatus = "pending" | "confirmed" | "failed";

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
    nextCursor: string | null;
}

export function buildStakingTransaction(request: BuildStakingTransactionRequest): Promise<BuiltStakingTransaction> {
    return apiClient.post<BuiltStakingTransaction>("/staking/transaction", request);
}

export function executeStakingTransaction(signedTransactionBase64: string, lastValidBlockHeight: number): Promise<{ signature: string }> {
    return apiClient.post<{ signature: string }>("/staking/execute", { signedTransaction: signedTransactionBase64, lastValidBlockHeight });
}

export function getStakingPosition(wallet: string, page: number, pageSize: number): Promise<StakingPositionResponse> {
    return apiClient.get<StakingPositionResponse>("/staking/position", {
        params: { wallet, page, pageSize }
    });
}

export function getStakingHistory(wallet: string, before: string | null, pageSize: number): Promise<StakingHistoryResponse> {
    return apiClient.get<StakingHistoryResponse>("/staking/history", {
        params: { wallet, before: before ?? undefined, pageSize }
    });
}

export function getStakingValidators(): Promise<StakingValidatorResponse[]> {
    return apiClient.get<StakingValidatorResponse[]>("/staking/validators");
}
