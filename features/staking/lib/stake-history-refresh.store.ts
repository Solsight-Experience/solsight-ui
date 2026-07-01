"use client";

import { create } from "zustand";

interface StakeHistoryRefreshState {
    refreshVersion: number;
    walletPubkey: string | null;
    expectedSignature: string | null;
    publishRefresh: (walletPubkey: string | null, expectedSignature?: string | null) => void;
}

export const useStakeHistoryRefreshStore = create<StakeHistoryRefreshState>((set) => ({
    refreshVersion: 0,
    walletPubkey: null,
    expectedSignature: null,
    publishRefresh: (walletPubkey, expectedSignature = null) =>
        set((state) => ({
            refreshVersion: state.refreshVersion + 1,
            walletPubkey,
            expectedSignature
        }))
}));
