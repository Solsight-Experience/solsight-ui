"use client";

import { useEffect, useMemo, useRef } from "react";
import { COMMON_TOKENS } from "@/lib/constants";
import { useTokenUIStore } from "../../stores/token.stores";
import type { TokenDetail } from "../../types/token.types";

export interface BuyPayTokenOption {
    mint: string;
    symbol: string;
    logoUri: string;
    decimals?: number;
    balance: number;
}

interface PortfolioPosition {
    balance: number;
    token: {
        address: string;
        symbol?: string;
        name?: string;
        logo_uri?: string;
        decimals?: number;
    };
}

interface PortfolioWallet {
    balance_sol?: number;
}

interface PositionsData {
    positions?: PortfolioPosition[];
}

export interface UseTradingTokenOptionsParams {
    token: TokenDetail;
    selectedWallet: PortfolioWallet | null;
    positionsData: PositionsData | undefined;
    ownedTokenPosition: { balance: number } | null;
    onMintChanged: () => void;
}

export interface UseTradingTokenOptionsResult {
    buyPayTokenOptions: BuyPayTokenOption[];
    selectableBuyPayTokenOptions: BuyPayTokenOption[];
    selectableSellReceiveTokenOptions: BuyPayTokenOption[];
    selectedBuyPayToken: BuyPayTokenOption | null;
    selectedSellReceiveToken: BuyPayTokenOption | null;
    isViewingSolToken: boolean;

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
    resolvedTokenDecimals: number;
}

export function useTradingTokenOptions(params: UseTradingTokenOptionsParams): UseTradingTokenOptionsResult {
    const { token, selectedWallet, positionsData, ownedTokenPosition, onMintChanged } = params;

    const tradeMode = useTokenUIStore((s) => s.tradeMode);
    const selectedBuyPayMint = useTokenUIStore((s) => s.selectedBuyPayMint);
    const setSelectedBuyPayMint = useTokenUIStore((s) => s.setSelectedBuyPayMint);
    const selectedSellReceiveMint = useTokenUIStore((s) => s.selectedSellReceiveMint);
    const setSelectedSellReceiveMint = useTokenUIStore((s) => s.setSelectedSellReceiveMint);
    const setPayAmount = useTokenUIStore((s) => s.setPayAmount);
    const setReceiveAmount = useTokenUIStore((s) => s.setReceiveAmount);

    const isViewingSolToken = token.address.toLowerCase() === COMMON_TOKENS.SOL.mint.toLowerCase();
    const resolvedTokenDecimals = token.decimals ?? 9;

    const previousBuyPayMintRef = useRef(selectedBuyPayMint);
    const previousSellReceiveMintRef = useRef(selectedSellReceiveMint);

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

    const selectableBuyPayTokenOptions = useMemo(
        () => buyPayTokenOptions.filter((option) => option.mint.toLowerCase() !== token.address.toLowerCase()),
        [buyPayTokenOptions, token.address]
    );
    const selectableSellReceiveTokenOptions = selectableBuyPayTokenOptions;

    useEffect(() => {
        if (tradeMode !== "buy") return;
        if (!selectableBuyPayTokenOptions.length) {
            if (selectedBuyPayMint) setSelectedBuyPayMint("");
            return;
        }
        if (isViewingSolToken && !selectedBuyPayMint) return;
        if (!selectableBuyPayTokenOptions.some((option) => option.mint === selectedBuyPayMint)) {
            setSelectedBuyPayMint(selectableBuyPayTokenOptions[0].mint);
        }
    }, [tradeMode, selectableBuyPayTokenOptions, selectedBuyPayMint, isViewingSolToken]);

    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (!selectableSellReceiveTokenOptions.length) {
            if (selectedSellReceiveMint) setSelectedSellReceiveMint("");
            return;
        }
        if (isViewingSolToken && !selectedSellReceiveMint) return;
        if (!selectableSellReceiveTokenOptions.some((option) => option.mint === selectedSellReceiveMint)) {
            setSelectedSellReceiveMint(selectableSellReceiveTokenOptions[0].mint);
        }
    }, [tradeMode, selectableSellReceiveTokenOptions, selectedSellReceiveMint, isViewingSolToken]);

    const selectedBuyPayToken = useMemo<BuyPayTokenOption | null>(
        () => selectableBuyPayTokenOptions.find((option) => option.mint === selectedBuyPayMint) ?? null,
        [selectableBuyPayTokenOptions, selectedBuyPayMint]
    );

    const selectedSellReceiveToken = useMemo<BuyPayTokenOption | null>(
        () => selectableSellReceiveTokenOptions.find((option) => option.mint === selectedSellReceiveMint) ?? null,
        [selectableSellReceiveTokenOptions, selectedSellReceiveMint]
    );

    useEffect(() => {
        if (tradeMode !== "buy") return;
        if (selectedBuyPayMint === previousBuyPayMintRef.current) return;

        previousBuyPayMintRef.current = selectedBuyPayMint;
        onMintChanged();
        setPayAmount("");
        setReceiveAmount("");
    }, [tradeMode, selectedBuyPayMint, setPayAmount, setReceiveAmount]);

    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (selectedSellReceiveMint === previousSellReceiveMintRef.current) return;

        previousSellReceiveMintRef.current = selectedSellReceiveMint;
        onMintChanged();
        setPayAmount("");
        setReceiveAmount("");
    }, [tradeMode, selectedSellReceiveMint, setPayAmount, setReceiveAmount]);

    const payToken = tradeMode === "buy" ? (selectedBuyPayToken?.symbol ?? "") : token.symbol;
    const receiveToken = tradeMode === "buy" ? token.symbol : (selectedSellReceiveToken?.symbol ?? "");
    const payTokenLogo = tradeMode === "buy" ? (selectedBuyPayToken?.logoUri ?? "") : token.logo_uri;
    const receiveTokenLogo = tradeMode === "buy" ? token.logo_uri : (selectedSellReceiveToken?.logoUri ?? "");

    const portfolioTokenBalance = ownedTokenPosition?.balance ?? 0;
    const payBalance = tradeMode === "buy" ? String(selectedBuyPayToken?.balance ?? 0) : String(portfolioTokenBalance);
    const receiveBalance = tradeMode === "buy" ? String(portfolioTokenBalance) : String(selectedSellReceiveToken?.balance ?? 0);
    const payDecimals = tradeMode === "buy" ? (selectedBuyPayToken?.decimals ?? COMMON_TOKENS.SOL.decimals) : resolvedTokenDecimals;
    const receiveDecimals = tradeMode === "buy" ? resolvedTokenDecimals : (selectedSellReceiveToken?.decimals ?? COMMON_TOKENS.SOL.decimals);

    const payMint = tradeMode === "buy" ? (selectedBuyPayToken?.mint ?? "") : token.address;
    const receiveMint = tradeMode === "buy" ? token.address : (selectedSellReceiveToken?.mint ?? "");

    return {
        buyPayTokenOptions,
        selectableBuyPayTokenOptions,
        selectableSellReceiveTokenOptions,
        selectedBuyPayToken,
        selectedSellReceiveToken,
        isViewingSolToken,
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
        resolvedTokenDecimals
    };
}
