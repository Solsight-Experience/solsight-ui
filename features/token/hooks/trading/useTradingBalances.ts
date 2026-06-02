"use client";

import { useCallback, useMemo } from "react";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import { usePositions, useWallets } from "@/features/portfolio/hooks/portfolio.hooks";

export function useTradingBalances({ tokenAddress }: { tokenAddress: string }) {
    const { publicKey } = useWallet();

    const { data: walletsData, isLoading: isWalletsLoading, refetch: refetchWallets } = useWallets();

    const selectedWalletAddress = useMemo(() => {
        const wallets = walletsData?.wallets ?? [];
        if (!wallets.length) return publicKey ?? "";
        const connectedWallet = publicKey ? wallets.find((wallet) => wallet.address.toLowerCase() === publicKey.toLowerCase()) : null;
        if (connectedWallet) return connectedWallet.address;
        const defaultWallet = wallets.find((wallet) => wallet.is_default);
        if (defaultWallet) return defaultWallet.address;
        return publicKey ?? wallets[0].address;
    }, [walletsData?.wallets, publicKey]);

    const {
        data: positionsData,
        isLoading: isPositionsLoading,
        error: positionsError,
        refetch: refetchPositions
    } = usePositions(selectedWalletAddress, {
        sort_by: "value",
        show_zero_balance: true
    });

    const selectedWallet = useMemo(
        () => walletsData?.wallets?.find((wallet) => wallet.address.toLowerCase() === selectedWalletAddress.toLowerCase()) ?? null,
        [walletsData?.wallets, selectedWalletAddress]
    );

    const ownedTokenPosition = useMemo(
        () => positionsData?.positions?.find((position) => position.token.address.toLowerCase() === tokenAddress.toLowerCase()) ?? null,
        [positionsData?.positions, tokenAddress]
    );

    const balancesLoading = isWalletsLoading || (!!selectedWalletAddress && isPositionsLoading);

    const refreshBalancesAfterSwap = useCallback(async () => {
        await Promise.all([refetchWallets(), refetchPositions()]);
        // Backend portfolio aggregation can lag shortly after on-chain confirmation.
        window.setTimeout(() => {
            refetchWallets();
            refetchPositions();
        }, 2000);
    }, [refetchWallets, refetchPositions]);

    return {
        selectedWalletAddress,
        selectedWallet,
        ownedTokenPosition,
        balancesLoading,
        positionsError,
        refreshBalancesAfterSwap,
        walletsData,
        positionsData
    };
}
