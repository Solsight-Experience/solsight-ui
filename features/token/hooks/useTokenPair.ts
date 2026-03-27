import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import { usePositions, useWallets } from "@/features/portfolio/hooks/portfolio.hooks";
import { COMMON_TOKENS } from "@/lib/constants";
import type { TokenDetail } from "../types/token.types";

export type BuyPayTokenOption = {
    mint: string;
    symbol: string;
    logoUri: string;
    decimals?: number;
    balance: number;
};

export interface UseTokenPairResult {
    payToken: string;
    receiveToken: string;
    payTokenLogo: string;
    receiveTokenLogo: string;
    payBalance: string;
    receiveBalance: string;
    payDecimals: number;
    receiveDecimals: number;
    payMint: string;
    receiveMint: string;
    selectablePayTokens: BuyPayTokenOption[];
    selectableReceiveTokens: BuyPayTokenOption[];
    selectedBuyPayMint: string;
    selectedSellReceiveMint: string;
    setSelectedBuyPayMint: (mint: string) => void;
    setSelectedSellReceiveMint: (mint: string) => void;
    selectedBuyPayToken: BuyPayTokenOption | null;
    selectedSellReceiveToken: BuyPayTokenOption | null;
    buyTokenDecimalsByMint: Record<string, number>;
    getOptionDecimals: (option: BuyPayTokenOption) => number;
    resolvedTokenDecimals: number;
    balancesLoading: boolean;
    positionsError: Error | null;
    ownedTokenPosition: { balance: number } | null;
    selectedWalletAddress: string;
    refetchWallets: () => void;
    refetchPositions: () => void;
}

export function useTokenPair(token: TokenDetail, tradeMode: "buy" | "sell", isViewingSolToken: boolean): UseTokenPairResult {
    const { publicKey } = useWallet();

    const [selectedBuyPayMint, setSelectedBuyPayMint] = useState<string>(isViewingSolToken ? "" : COMMON_TOKENS.SOL.mint);
    const [selectedSellReceiveMint, setSelectedSellReceiveMint] = useState<string>(isViewingSolToken ? "" : COMMON_TOKENS.SOL.mint);
    const [buyTokenDecimalsByMint, setBuyTokenDecimalsByMint] = useState<Record<string, number>>({});
    const [fetchedDecimals, setFetchedDecimals] = useState<number | null>(null);

    const previousBuyPayMintRef = useRef(selectedBuyPayMint);
    const previousSellReceiveMintRef = useRef(selectedSellReceiveMint);

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
        () => positionsData?.positions?.find((position) => position.token.address.toLowerCase() === token.address.toLowerCase()) ?? null,
        [positionsData?.positions, token.address]
    );

    // Fetch decimals for the main token if not provided (via backend)
    useEffect(() => {
        if (token.decimals != null) return;
        fetch(`/api/v1/tokens/${token.address}/info`)
            .then((r) => r.json())
            .then((data: { decimals?: number }) => {
                if (typeof data?.decimals === "number") setFetchedDecimals(data.decimals);
            })
            .catch(() => {});
    }, [token.address, token.decimals]);

    const resolvedTokenDecimals = token.decimals ?? fetchedDecimals ?? 9;

    const buyPayTokenOptions = useMemo<BuyPayTokenOption[]>(() => {
        const solOption: BuyPayTokenOption = {
            mint: COMMON_TOKENS.SOL.mint,
            symbol: COMMON_TOKENS.SOL.symbol,
            logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
            decimals: COMMON_TOKENS.SOL.decimals,
            balance: selectedWallet?.balance_sol ?? 0
        };

        const walletTokenOptions =
            positionsData?.positions
                ?.filter((position) => {
                    const mint = position.token.address?.toLowerCase();
                    return Boolean(mint) && mint !== token.address.toLowerCase() && position.balance > 0;
                })
                .map((position) => ({
                    mint: position.token.address,
                    symbol: position.token.symbol || position.token.name || position.token.address.slice(0, 8),
                    logoUri: position.token.logo_uri || token.logo_uri,
                    decimals: position.token.decimals,
                    balance: position.balance
                })) ?? [];

        const unique = new Map<string, BuyPayTokenOption>();
        [solOption, ...walletTokenOptions].forEach((option) => {
            const key = option.mint.toLowerCase();
            if (!unique.has(key)) unique.set(key, option);
        });

        return Array.from(unique.values());
    }, [positionsData?.positions, selectedWallet?.balance_sol, token.address, token.logo_uri]);

    const selectablePayTokens = useMemo(
        () => buyPayTokenOptions.filter((option) => option.mint.toLowerCase() !== token.address.toLowerCase()),
        [buyPayTokenOptions, token.address]
    );
    const selectableReceiveTokens = selectablePayTokens;

    // Auto-select pay token for buy mode
    useEffect(() => {
        if (tradeMode !== "buy") return;
        if (!selectablePayTokens.length) {
            if (selectedBuyPayMint) setSelectedBuyPayMint("");
            return;
        }
        if (isViewingSolToken && !selectedBuyPayMint) return;
        if (!selectablePayTokens.some((option) => option.mint === selectedBuyPayMint)) {
            setSelectedBuyPayMint(selectablePayTokens[0].mint);
        }
    }, [tradeMode, selectablePayTokens, selectedBuyPayMint, isViewingSolToken]);

    // Auto-select receive token for sell mode
    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (!selectableReceiveTokens.length) {
            if (selectedSellReceiveMint) setSelectedSellReceiveMint("");
            return;
        }
        if (isViewingSolToken && !selectedSellReceiveMint) return;
        if (!selectableReceiveTokens.some((option) => option.mint === selectedSellReceiveMint)) {
            setSelectedSellReceiveMint(selectableReceiveTokens[0].mint);
        }
    }, [tradeMode, selectableReceiveTokens, selectedSellReceiveMint, isViewingSolToken]);

    const selectedBuyPayToken = useMemo<BuyPayTokenOption | null>(
        () => selectablePayTokens.find((option) => option.mint === selectedBuyPayMint) ?? null,
        [selectablePayTokens, selectedBuyPayMint]
    );

    const selectedSellReceiveToken = useMemo<BuyPayTokenOption | null>(
        () => selectableReceiveTokens.find((option) => option.mint === selectedSellReceiveMint) ?? null,
        [selectableReceiveTokens, selectedSellReceiveMint]
    );

    // Fetch decimals for buy pay token (via backend)
    useEffect(() => {
        if (tradeMode !== "buy") return;
        if (!selectedBuyPayToken) return;
        const selectedMint = selectedBuyPayToken.mint;
        if (selectedMint === COMMON_TOKENS.SOL.mint) return;
        if (selectedBuyPayToken.decimals != null) return;
        if (buyTokenDecimalsByMint[selectedMint] != null) return;

        fetch(`/api/v1/tokens/${selectedMint}/info`)
            .then((r) => r.json())
            .then((data: { decimals?: number }) => {
                if (typeof data?.decimals === "number") {
                    setBuyTokenDecimalsByMint((prev) => ({ ...prev, [selectedMint]: data.decimals as number }));
                }
            })
            .catch(() => {});
    }, [tradeMode, selectedBuyPayToken, buyTokenDecimalsByMint]);

    // Fetch decimals for sell receive token (via backend)
    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (!selectedSellReceiveToken) return;
        const selectedMint = selectedSellReceiveToken.mint;
        if (selectedMint === COMMON_TOKENS.SOL.mint) return;
        if (selectedSellReceiveToken.decimals != null) return;
        if (buyTokenDecimalsByMint[selectedMint] != null) return;

        fetch(`/api/v1/tokens/${selectedMint}/info`)
            .then((r) => r.json())
            .then((data: { decimals?: number }) => {
                if (typeof data?.decimals === "number") {
                    setBuyTokenDecimalsByMint((prev) => ({ ...prev, [selectedMint]: data.decimals as number }));
                }
            })
            .catch(() => {});
    }, [tradeMode, selectedSellReceiveToken, buyTokenDecimalsByMint]);

    const payToken = tradeMode === "buy" ? (selectedBuyPayToken?.symbol ?? "") : token.symbol;
    const receiveToken = tradeMode === "buy" ? token.symbol : (selectedSellReceiveToken?.symbol ?? "");
    const payTokenLogo = tradeMode === "buy" ? (selectedBuyPayToken?.logoUri ?? "") : token.logo_uri;
    const receiveTokenLogo = tradeMode === "buy" ? token.logo_uri : (selectedSellReceiveToken?.logoUri ?? "");

    const portfolioTokenBalance = ownedTokenPosition?.balance ?? 0;
    const payBalance = tradeMode === "buy" ? String(selectedBuyPayToken?.balance ?? 0) : String(portfolioTokenBalance);
    const receiveBalance = tradeMode === "buy" ? String(portfolioTokenBalance) : String(selectedSellReceiveToken?.balance ?? 0);

    const balancesLoading = isWalletsLoading || (!!selectedWalletAddress && isPositionsLoading);

    const payDecimals =
        tradeMode === "buy"
            ? (selectedBuyPayToken?.decimals ??
              (selectedBuyPayToken ? buyTokenDecimalsByMint[selectedBuyPayToken.mint] : undefined) ??
              COMMON_TOKENS.SOL.decimals)
            : resolvedTokenDecimals;

    const receiveDecimals =
        tradeMode === "buy"
            ? resolvedTokenDecimals
            : (selectedSellReceiveToken?.decimals ??
              (selectedSellReceiveToken ? buyTokenDecimalsByMint[selectedSellReceiveToken.mint] : undefined) ??
              COMMON_TOKENS.SOL.decimals);

    const payMint = tradeMode === "buy" ? (selectedBuyPayToken?.mint ?? "") : token.address;
    const receiveMint = tradeMode === "buy" ? token.address : (selectedSellReceiveToken?.mint ?? "");

    const getOptionDecimals = (option: BuyPayTokenOption): number =>
        option.decimals ?? buyTokenDecimalsByMint[option.mint] ?? (option.mint === COMMON_TOKENS.SOL.mint ? COMMON_TOKENS.SOL.decimals : 6);

    // Track previous mints for external consumers (e.g. quote reset on mint change)
    previousBuyPayMintRef.current = selectedBuyPayMint;
    previousSellReceiveMintRef.current = selectedSellReceiveMint;

    return {
        payToken,
        receiveToken,
        payTokenLogo,
        receiveTokenLogo,
        payBalance,
        receiveBalance,
        payDecimals,
        receiveDecimals,
        payMint,
        receiveMint,
        selectablePayTokens,
        selectableReceiveTokens,
        selectedBuyPayMint,
        selectedSellReceiveMint,
        setSelectedBuyPayMint,
        setSelectedSellReceiveMint,
        selectedBuyPayToken,
        selectedSellReceiveToken,
        buyTokenDecimalsByMint,
        getOptionDecimals,
        resolvedTokenDecimals,
        balancesLoading,
        positionsError: positionsError as Error | null,
        ownedTokenPosition,
        selectedWalletAddress,
        refetchWallets,
        refetchPositions
    };
}
