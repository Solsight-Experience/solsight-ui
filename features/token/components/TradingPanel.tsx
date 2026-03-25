import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTokenUIStore } from "../stores/token.stores";
import type { TokenDetail } from "../types/token.types";
import { COMMON_TOKENS } from "@/lib/constants";
import { copyToClipboard } from "../utils/token.utils";
import { Check, ChevronDown, Copy, Loader2 } from "lucide-react";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import { usePositions, useWallets } from "@/features/portfolio/hooks/portfolio.hooks";
import { toast } from "sonner";
import {
    executeJupiterSwap,
    fetchJupiterQuote,
    formatDisplay,
    formatFromBaseUnits,
    formatInputValue,
    getSwapApiConfig,
    isValidAmount,
    parseInputNumber,
    sanitizeInput,
    toBaseUnits
} from "@/features/swap";
import { LimitOrderService } from "@/features/limit-orders";
import { VersionedTransaction } from "@solana/web3.js";

interface TradingPanelProps {
    token: TokenDetail;
}

type PhantomProvider = {
    isPhantom?: boolean;
    signTransaction: (tx: unknown) => Promise<{ serialize(): Uint8Array }>;
};

type BuyPayTokenOption = {
    mint: string;
    symbol: string;
    logoUri: string;
    decimals?: number;
    balance: number;
};

export const TradingPanel: React.FC<TradingPanelProps> = ({ token }) => {
  const {
    tradeMode,
    setTradeMode,
    orderType,
    setOrderType,
    payAmount,
    setPayAmount,
    receiveAmount,
    setReceiveAmount,
    slippageBps,
    setSlippageBps,
    limitPrice,
    setLimitPrice,
    resetTradingPanel,
  } = useTokenUIStore();
  const { connectWallet, isConnecting, connected, publicKey } = useWallet();

  const [lastEdited, setLastEdited] = useState<'pay' | 'receive' | null>(null);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [selectedBuyPayMint, setSelectedBuyPayMint] = useState<string>(COMMON_TOKENS.SOL.mint);
  const [selectedSellReceiveMint, setSelectedSellReceiveMint] = useState<string>(COMMON_TOKENS.SOL.mint);
  const [buyTokenDecimalsByMint, setBuyTokenDecimalsByMint] = useState<Record<string, number>>({});
  const [swapState, setSwapState] = useState<{
    loading: boolean;
    error: string | null;
    signature: string | null;
  }>({
    loading: false,
    error: null,
    signature: null,
  });
  const [quoteState, setQuoteState] = useState<{
    loading: boolean;
    error: string | null;
    priceImpactPct: number | null;
    otherAmountThreshold: string | null;
    routeLabel: string | null;
    routeDetails: string[];
    routePathTokens: Array<{ display: string; full?: string }>;
    rawQuote: Record<string, unknown> | null;
  }>({
    loading: false,
    error: null,
    priceImpactPct: null,
    otherAmountThreshold: null,
    routeLabel: null,
    routeDetails: [],
    routePathTokens: [],
    rawQuote: null,
  });

  const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);

  // Fetch SOL price in USD
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then((r) => r.json())
      .then((data) => {
        if (data?.solana?.usd) {
          setSolPriceUsd(data.solana.usd);
        }
      })
      .catch((err) => console.error('Failed to fetch SOL price:', err));
  }, []);

  const swapConfig = useMemo(() => getSwapApiConfig(), []);
  const internalUpdateRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const previousBuyPayMintRef = useRef(selectedBuyPayMint);
  const previousSellReceiveMintRef = useRef(selectedSellReceiveMint);
  const noSwapOptionsNotifiedRef = useRef(false);
  const isViewingSolToken = token.address.toLowerCase() === COMMON_TOKENS.SOL.mint.toLowerCase();

  useEffect(() => {
    resetTradingPanel();
    setLastEdited(null);
    setQuoteState({
      loading: false,
      error: null,
      priceImpactPct: null,
      otherAmountThreshold: null,
      routeLabel: null,
      routeDetails: [],
      routePathTokens: [],
      rawQuote: null,
    });
    setCopiedMint(null);
    setSelectedBuyPayMint(isViewingSolToken ? '' : COMMON_TOKENS.SOL.mint);
    setSelectedSellReceiveMint(isViewingSolToken ? '' : COMMON_TOKENS.SOL.mint);
    setSwapState({ loading: false, error: null, signature: null });
  }, [token.address, resetTradingPanel, isViewingSolToken]);

  const [fetchedDecimals, setFetchedDecimals] = useState<number | null>(null);
  const {
    data: walletsData,
    isLoading: isWalletsLoading,
    refetch: refetchWallets,
  } = useWallets();
  useEffect(() => {
    if (token.decimals != null) return;
    fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${token.address}`)
      .then((r) => r.json())
      .then((data: Array<{ id: string; decimals: number }>) => {
        const found = Array.isArray(data) ? data.find((item) => item.id === token.address) : null;
        if (found && typeof found.decimals === 'number') setFetchedDecimals(found.decimals);
      })
      .catch(() => {});
  }, [token.address, token.decimals]);

  const resolvedTokenDecimals = token.decimals ?? fetchedDecimals ?? 9;
  const selectedWalletAddress = useMemo(() => {
    const wallets = walletsData?.wallets ?? [];
    if (!wallets.length) return publicKey ?? '';
    const connectedWallet = publicKey
      ? wallets.find((wallet) => wallet.address.toLowerCase() === publicKey.toLowerCase())
      : null;
    if (connectedWallet) return connectedWallet.address;
    const defaultWallet = wallets.find((wallet) => wallet.is_default);
    if (defaultWallet) return defaultWallet.address;
    return publicKey ?? wallets[0].address;
  }, [walletsData?.wallets, publicKey]);

  const {
    data: positionsData,
    isLoading: isPositionsLoading,
    error: positionsError,
    refetch: refetchPositions,
  } = usePositions(selectedWalletAddress, {
    sort_by: 'value',
    show_zero_balance: true,
  });

  const refreshBalancesAfterSwap = async () => {
    await Promise.all([refetchWallets(), refetchPositions()]);

    // Backend portfolio aggregation can lag shortly after on-chain confirmation.
    window.setTimeout(() => {
      refetchWallets();
      refetchPositions();
    }, 2000);
  };

  const selectedWallet = useMemo(
    () =>
      walletsData?.wallets?.find(
        (wallet) => wallet.address.toLowerCase() === selectedWalletAddress.toLowerCase()
      ) ?? null,
    [walletsData?.wallets, selectedWalletAddress]
  );

  const ownedTokenPosition = useMemo(
    () =>
      positionsData?.positions?.find(
        (position) => position.token.address.toLowerCase() === token.address.toLowerCase()
      ) ?? null,
    [positionsData?.positions, token.address]
  );

  const buyPayTokenOptions = useMemo<BuyPayTokenOption[]>(() => {
    const solOption: BuyPayTokenOption = {
      mint: COMMON_TOKENS.SOL.mint,
      symbol: COMMON_TOKENS.SOL.symbol,
      logoUri:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      decimals: COMMON_TOKENS.SOL.decimals,
      balance: selectedWallet?.balance_sol ?? 0,
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
          balance: position.balance,
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
    if (tradeMode !== 'buy') return;
    if (!selectableBuyPayTokenOptions.length) {
      if (selectedBuyPayMint) setSelectedBuyPayMint('');
      return;
    }
    if (isViewingSolToken && !selectedBuyPayMint) return;
    if (!selectableBuyPayTokenOptions.some((option) => option.mint === selectedBuyPayMint)) {
      setSelectedBuyPayMint(selectableBuyPayTokenOptions[0].mint);
    }
  }, [tradeMode, selectableBuyPayTokenOptions, selectedBuyPayMint, isViewingSolToken]);

  useEffect(() => {
    if (tradeMode !== 'sell') return;
    if (!selectableSellReceiveTokenOptions.length) {
      if (selectedSellReceiveMint) setSelectedSellReceiveMint('');
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
    if (tradeMode !== 'buy') return;
    if (selectedBuyPayMint === previousBuyPayMintRef.current) return;

    previousBuyPayMintRef.current = selectedBuyPayMint;
    setLastEdited(null);
    setPayAmount('');
    setReceiveAmount('');
    setQuoteState((prev) => ({
      ...prev,
      loading: false,
      error: null,
      priceImpactPct: null,
      otherAmountThreshold: null,
      routeLabel: null,
      routeDetails: [],
      routePathTokens: [],
      rawQuote: null,
    }));
  }, [tradeMode, selectedBuyPayMint, setPayAmount, setReceiveAmount]);

  useEffect(() => {
    if (tradeMode !== 'sell') return;
    if (selectedSellReceiveMint === previousSellReceiveMintRef.current) return;

    previousSellReceiveMintRef.current = selectedSellReceiveMint;
    setLastEdited(null);
    setPayAmount('');
    setReceiveAmount('');
    setQuoteState((prev) => ({
      ...prev,
      loading: false,
      error: null,
      priceImpactPct: null,
      otherAmountThreshold: null,
      routeLabel: null,
      routeDetails: [],
      routePathTokens: [],
      rawQuote: null,
    }));
  }, [tradeMode, selectedSellReceiveMint, setPayAmount, setReceiveAmount]);

  useEffect(() => {
    if (tradeMode !== 'buy') return;
    if (!selectedBuyPayToken) return;

    const selectedMint = selectedBuyPayToken.mint;
    if (selectedMint === COMMON_TOKENS.SOL.mint) return;
    if (selectedBuyPayToken.decimals != null) return;
    if (buyTokenDecimalsByMint[selectedMint] != null) return;

    fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${selectedMint}`)
      .then((r) => r.json())
      .then((data: Array<{ id: string; decimals: number }>) => {
        const found = Array.isArray(data) ? data.find((item) => item.id === selectedMint) : null;
        if (found && typeof found.decimals === 'number') {
          setBuyTokenDecimalsByMint((prev) => ({
            ...prev,
            [selectedMint]: found.decimals,
          }));
        }
      })
      .catch(() => {});
  }, [tradeMode, selectedBuyPayToken, buyTokenDecimalsByMint]);

  useEffect(() => {
    if (tradeMode !== 'sell') return;
    if (!selectedSellReceiveToken) return;

    const selectedMint = selectedSellReceiveToken.mint;
    if (selectedMint === COMMON_TOKENS.SOL.mint) return;
    if (selectedSellReceiveToken.decimals != null) return;
    if (buyTokenDecimalsByMint[selectedMint] != null) return;

    fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${selectedMint}`)
      .then((r) => r.json())
      .then((data: Array<{ id: string; decimals: number }>) => {
        const found = Array.isArray(data) ? data.find((item) => item.id === selectedMint) : null;
        if (found && typeof found.decimals === 'number') {
          setBuyTokenDecimalsByMint((prev) => ({
            ...prev,
            [selectedMint]: found.decimals,
          }));
        }
      })
      .catch(() => {});
  }, [tradeMode, selectedSellReceiveToken, buyTokenDecimalsByMint]);

  const payToken = tradeMode === 'buy' ? selectedBuyPayToken?.symbol ?? '' : token.symbol;
  const receiveToken = tradeMode === 'buy' ? token.symbol : selectedSellReceiveToken?.symbol ?? '';
  const payTokenLogo = tradeMode === 'buy' ? selectedBuyPayToken?.logoUri ?? '' : token.logo_uri;
  const receiveTokenLogo =
    tradeMode === 'buy'
      ? token.logo_uri
      : selectedSellReceiveToken?.logoUri ?? '';

  const portfolioTokenBalance = ownedTokenPosition?.balance ?? 0;
  const payBalance =
    tradeMode === 'buy' ? String(selectedBuyPayToken?.balance ?? 0) : String(portfolioTokenBalance);
  const receiveBalance =
    tradeMode === 'buy' ? String(portfolioTokenBalance) : String(selectedSellReceiveToken?.balance ?? 0);
  const balancesLoading = isWalletsLoading || (!!selectedWalletAddress && isPositionsLoading);
  const payDecimals =
    tradeMode === 'buy'
      ? selectedBuyPayToken?.decimals ??
        (selectedBuyPayToken ? buyTokenDecimalsByMint[selectedBuyPayToken.mint] : undefined) ??
        COMMON_TOKENS.SOL.decimals
      : resolvedTokenDecimals;
  const receiveDecimals =
    tradeMode === 'buy'
      ? resolvedTokenDecimals
      : selectedSellReceiveToken?.decimals ??
        (selectedSellReceiveToken ? buyTokenDecimalsByMint[selectedSellReceiveToken.mint] : undefined) ??
        COMMON_TOKENS.SOL.decimals;

  const payMint = tradeMode === 'buy' ? selectedBuyPayToken?.mint ?? '' : token.address;
  const receiveMint = tradeMode === 'buy' ? token.address : selectedSellReceiveToken?.mint ?? '';
  const getOptionDecimals = (option: BuyPayTokenOption): number =>
    option.decimals ??
    buyTokenDecimalsByMint[option.mint] ??
    (option.mint === COMMON_TOKENS.SOL.mint ? COMMON_TOKENS.SOL.decimals : 6);

  const formattedQuote = useMemo(() => {
    if (!quoteState.otherAmountThreshold) {
      return '--';
    }
    const value = formatFromBaseUnits(
      quoteState.otherAmountThreshold,
      lastEdited === 'receive' ? payDecimals : receiveDecimals
    );
    return formatDisplay(value, lastEdited === 'receive' ? payDecimals : receiveDecimals);
  }, [quoteState.otherAmountThreshold, lastEdited, payDecimals, receiveDecimals]);

  const validation = useMemo(() => {
    if (!connected || !publicKey) return { error: null };
    if (balancesLoading || positionsError) return { error: null };
    if (tradeMode === 'buy' && !selectedBuyPayToken) return { error: 'You cannot swap because you have insufficient funds.' };
    if (tradeMode === 'sell' && !selectedSellReceiveToken) return { error: 'You cannot swap because you have insufficient funds.' };

    const payValue = parseInputNumber(payAmount);
    const receiveValue = parseInputNumber(receiveAmount);
    const payBalanceValue = parseInputNumber(payBalance);

    if (lastEdited === 'pay') {
      if (!payAmount) return { error: null };
      if (payValue <= 0) return { error: 'Amount must be greater than 0.' };
      if (payValue > payBalanceValue) return { error: 'Insufficient balance.' };
      return { error: null };
    }

    if (lastEdited === 'receive') {
      if (!receiveAmount) return { error: null };
      if (receiveValue <= 0) return { error: 'Amount must be greater than 0.' };
      if (payAmount && payValue > payBalanceValue) return { error: 'Insufficient balance.' };
      return { error: null };
    }

    return { error: null };
  }, [
    connected,
    publicKey,
    balancesLoading,
    positionsError,
    tradeMode,
    selectedBuyPayToken,
    selectedSellReceiveToken,
    lastEdited,
    payAmount,
    receiveAmount,
    payBalance,
  ]);

  useEffect(() => {
    const hasNoSwapOptions =
      (tradeMode === 'buy' && selectableBuyPayTokenOptions.length === 0) ||
      (tradeMode === 'sell' && selectableSellReceiveTokenOptions.length === 0);
    if (!hasNoSwapOptions) {
      noSwapOptionsNotifiedRef.current = false;
      return;
    }
    if (noSwapOptionsNotifiedRef.current) return;
    noSwapOptionsNotifiedRef.current = true;
    toast.error('You cannot swap because you have insufficient funds.');
  }, [tradeMode, selectableBuyPayTokenOptions.length, selectableSellReceiveTokenOptions.length]);

  // When switching tabs between Limit and Market, force recalculation
  useEffect(() => {
    // Force recalculation by setting internal flag
    internalUpdateRef.current = false;
    
    if (orderType === 'market') {
      // Clear limit price when switching back to market (optional, but ensures clean state)
      // and ensure lastEdited is set so quote re-runs
      if (payAmount) setLastEdited('pay');
      else if (receiveAmount) setLastEdited('receive');
    } else if (orderType === 'limit') {
      // It will auto recalculate in the limit effect since dependency `orderType` is passed
      if (payAmount) setLastEdited('pay');
      else if (receiveAmount) setLastEdited('receive');
    }
    // Note: Do not add payAmount/receiveAmount to dependencies to avoid infinite loops when they change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

  useEffect(() => {
    if (orderType === 'limit') return;

    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
      return;
    }

    if (!lastEdited) {
      setQuoteState((prev) => ({
        ...prev,
        error: null,
        priceImpactPct: null,
        otherAmountThreshold: null,
        routeLabel: null,
        routeDetails: [],
        routePathTokens: [],
        rawQuote: null,
      }));
      return;
    }

    const sourceAmount = lastEdited === 'pay' ? payAmount : receiveAmount;
    if (!isValidAmount(sourceAmount)) {
      setQuoteState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        priceImpactPct: null,
        otherAmountThreshold: null,
        routeLabel: null,
        routeDetails: [],
        routePathTokens: [],
        rawQuote: null,
      }));
      // Sync empty state to the other field
      if (lastEdited === 'pay' && receiveAmount !== '') setReceiveAmount('');
      if (lastEdited === 'receive' && payAmount !== '') setPayAmount('');
      return;
    }

    if (!payMint || !receiveMint) {
      setQuoteState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        priceImpactPct: null,
        otherAmountThreshold: null,
        routeLabel: null,
        routeDetails: [],
        routePathTokens: [],
        rawQuote: null
    });

    const swapConfig = useMemo(() => getSwapApiConfig(), []);
    const internalUpdateRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);
    const previousBuyPayMintRef = useRef(selectedBuyPayMint);
    const previousSellReceiveMintRef = useRef(selectedSellReceiveMint);
    const noSwapOptionsNotifiedRef = useRef(false);
    const isViewingSolToken = token.address.toLowerCase() === COMMON_TOKENS.SOL.mint.toLowerCase();

    useEffect(() => {
        resetTradingPanel();
        setLastEdited(null);
        setQuoteState({
            loading: false,
            error: null,
            priceImpactPct: null,
            otherAmountThreshold: null,
            routeLabel: null,
            routeDetails: [],
            routePathTokens: [],
            rawQuote: null
        });
        setCopiedMint(null);
        setSelectedBuyPayMint(isViewingSolToken ? "" : COMMON_TOKENS.SOL.mint);
        setSelectedSellReceiveMint(isViewingSolToken ? "" : COMMON_TOKENS.SOL.mint);
        setSwapState({ loading: false, error: null, signature: null });
    }, [token.address, resetTradingPanel, isViewingSolToken]);

    const [fetchedDecimals, setFetchedDecimals] = useState<number | null>(null);
    const { data: walletsData, isLoading: isWalletsLoading, refetch: refetchWallets } = useWallets();
    useEffect(() => {
        if (token.decimals != null) return;
        fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${token.address}`)
            .then((r) => r.json())
            .then((data: Array<{ id: string; decimals: number }>) => {
                const found = Array.isArray(data) ? data.find((item) => item.id === token.address) : null;
                if (found && typeof found.decimals === "number") setFetchedDecimals(found.decimals);
            })
            .catch(() => {});
    }, [token.address, token.decimals]);

    const resolvedTokenDecimals = token.decimals ?? fetchedDecimals ?? 9;
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

    const refreshBalancesAfterSwap = async () => {
        await Promise.all([refetchWallets(), refetchPositions()]);

        // Backend portfolio aggregation can lag shortly after on-chain confirmation.
        window.setTimeout(() => {
            refetchWallets();
            refetchPositions();
        }, 2000);
    };

    const selectedWallet = useMemo(
        () => walletsData?.wallets?.find((wallet) => wallet.address.toLowerCase() === selectedWalletAddress.toLowerCase()) ?? null,
        [walletsData?.wallets, selectedWalletAddress]
    );

    const ownedTokenPosition = useMemo(
        () => positionsData?.positions?.find((position) => position.token.address.toLowerCase() === token.address.toLowerCase()) ?? null,
        [positionsData?.positions, token.address]
    );

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
        setLastEdited(null);
        setPayAmount("");
        setReceiveAmount("");
        setQuoteState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            priceImpactPct: null,
            otherAmountThreshold: null,
            routeLabel: null,
            routeDetails: [],
            routePathTokens: [],
            rawQuote: null
        }));
    }, [tradeMode, selectedBuyPayMint, setPayAmount, setReceiveAmount]);

    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (selectedSellReceiveMint === previousSellReceiveMintRef.current) return;

        previousSellReceiveMintRef.current = selectedSellReceiveMint;
        setLastEdited(null);
        setPayAmount("");
        setReceiveAmount("");
        setQuoteState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            priceImpactPct: null,
            otherAmountThreshold: null,
            routeLabel: null,
            routeDetails: [],
            routePathTokens: [],
            rawQuote: null
        }));
    }, [tradeMode, selectedSellReceiveMint, setPayAmount, setReceiveAmount]);

    useEffect(() => {
        if (tradeMode !== "buy") return;
        if (!selectedBuyPayToken) return;

        const selectedMint = selectedBuyPayToken.mint;
        if (selectedMint === COMMON_TOKENS.SOL.mint) return;
        if (selectedBuyPayToken.decimals != null) return;
        if (buyTokenDecimalsByMint[selectedMint] != null) return;

        fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${selectedMint}`)
            .then((r) => r.json())
            .then((data: Array<{ id: string; decimals: number }>) => {
                const found = Array.isArray(data) ? data.find((item) => item.id === selectedMint) : null;
                if (found && typeof found.decimals === "number") {
                    setBuyTokenDecimalsByMint((prev) => ({
                        ...prev,
                        [selectedMint]: found.decimals
                    }));
                }
            })
            .catch(() => {});
    }, [tradeMode, selectedBuyPayToken, buyTokenDecimalsByMint]);

    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (!selectedSellReceiveToken) return;

        const selectedMint = selectedSellReceiveToken.mint;
        if (selectedMint === COMMON_TOKENS.SOL.mint) return;
        if (selectedSellReceiveToken.decimals != null) return;
        if (buyTokenDecimalsByMint[selectedMint] != null) return;

        fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${selectedMint}`)
            .then((r) => r.json())
            .then((data: Array<{ id: string; decimals: number }>) => {
                const found = Array.isArray(data) ? data.find((item) => item.id === selectedMint) : null;
                if (found && typeof found.decimals === "number") {
                    setBuyTokenDecimalsByMint((prev) => ({
                        ...prev,
                        [selectedMint]: found.decimals
                    }));
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

    const formattedQuote = useMemo(() => {
        if (!quoteState.otherAmountThreshold) {
            return "--";
        }
        const value = formatFromBaseUnits(quoteState.otherAmountThreshold, lastEdited === "receive" ? payDecimals : receiveDecimals);
        return formatDisplay(value, lastEdited === "receive" ? payDecimals : receiveDecimals);
    }, [quoteState.otherAmountThreshold, lastEdited, payDecimals, receiveDecimals]);

    const validation = useMemo(() => {
        if (!connected || !publicKey) return { error: null };
        if (balancesLoading || positionsError) return { error: null };
        if (tradeMode === "buy" && !selectedBuyPayToken) return { error: "You cannot swap because you have insufficient funds." };
        if (tradeMode === "sell" && !selectedSellReceiveToken) return { error: "You cannot swap because you have insufficient funds." };

        const payValue = parseInputNumber(payAmount);
        const receiveValue = parseInputNumber(receiveAmount);
        const payBalanceValue = parseInputNumber(payBalance);

        if (lastEdited === "pay") {
            if (!payAmount) return { error: null };
            if (payValue <= 0) return { error: "Amount must be greater than 0." };
            if (payValue > payBalanceValue) return { error: "Insufficient balance." };
            return { error: null };
        }

        if (lastEdited === "receive") {
            if (!receiveAmount) return { error: null };
            if (receiveValue <= 0) return { error: "Amount must be greater than 0." };
            if (payAmount && payValue > payBalanceValue) return { error: "Insufficient balance." };
            return { error: null };
        }

        return { error: null };
    }, [
        connected,
        publicKey,
        balancesLoading,
        positionsError,
        tradeMode,
        selectedBuyPayToken,
        selectedSellReceiveToken,
        lastEdited,
        payAmount,
        receiveAmount,
        payBalance
    ]);

    useEffect(() => {
        const hasNoSwapOptions =
            (tradeMode === "buy" && selectableBuyPayTokenOptions.length === 0) || (tradeMode === "sell" && selectableSellReceiveTokenOptions.length === 0);
        if (!hasNoSwapOptions) {
            noSwapOptionsNotifiedRef.current = false;
            return;
        }
        if (noSwapOptionsNotifiedRef.current) return;
        noSwapOptionsNotifiedRef.current = true;
        toast.error("You cannot swap because you have insufficient funds.");
    }, [tradeMode, selectableBuyPayTokenOptions.length, selectableSellReceiveTokenOptions.length]);

    useEffect(() => {
        if (internalUpdateRef.current) {
            internalUpdateRef.current = false;
            return;
        }

        if (!lastEdited) {
            setQuoteState((prev) => ({
                ...prev,
                error: null,
                priceImpactPct: null,
                otherAmountThreshold: null,
                routeLabel: null,
                routeDetails: [],
                routePathTokens: [],
                rawQuote: null
            }));
            return;
        }

        const sourceAmount = lastEdited === "pay" ? payAmount : receiveAmount;
        if (!isValidAmount(sourceAmount)) {
            setQuoteState((prev) => ({
                ...prev,
                loading: false,
                error: null,
                priceImpactPct: null,
                otherAmountThreshold: null,
                routeLabel: null,
                routeDetails: [],
                routePathTokens: [],
                rawQuote: null
            }));
            return;
        }

        if (!payMint || !receiveMint) {
            setQuoteState((prev) => ({
                ...prev,
                loading: false,
                error: null,
                priceImpactPct: null,
                otherAmountThreshold: null,
                routeLabel: null,
                routeDetails: [],
                routePathTokens: [],
                rawQuote: null
            }));
            return;
        }

        const swapMode = lastEdited === "pay" ? "ExactIn" : "ExactOut";
        const amountBaseUnits = toBaseUnits(sourceAmount, swapMode === "ExactIn" ? payDecimals : receiveDecimals);

        if (!amountBaseUnits) return;

        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

        const timeoutId = setTimeout(async () => {
            setQuoteState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const result = await fetchJupiterQuote(
                    {
                        inputMint: payMint,
                        outputMint: receiveMint,
                        amount: amountBaseUnits,
                        swapMode,
                        slippageBps
                    },
                    {
                        signal: controller.signal,
                        config: swapConfig,
                        payTokenSymbol: payToken,
                        receiveTokenSymbol: receiveToken
                    }
                );

                const nextPay =
                    swapMode === "ExactOut" && result.inAmount ? formatInputValue(formatFromBaseUnits(result.inAmount, payDecimals), payDecimals) : null;
                const nextReceive =
                    swapMode === "ExactIn" && result.outAmount
                        ? formatInputValue(formatFromBaseUnits(result.outAmount, receiveDecimals), receiveDecimals)
                        : null;

                internalUpdateRef.current = true;
                if (nextPay !== null) {
                    setPayAmount(nextPay);
                }
                if (nextReceive !== null) {
                    setReceiveAmount(nextReceive);
                }

                setQuoteState({
                    loading: false,
                    error: null,
                    priceImpactPct: result.priceImpactPct,
                    otherAmountThreshold: result.otherAmountThreshold,
                    routeLabel: result.routeLabel,
                    routeDetails: result.routeDetails,
                    routePathTokens: result.routePathTokens,
                    rawQuote: result.rawQuote
                });
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setQuoteState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : "Quote failed"
                }));
            }
        }, 350);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [
        lastEdited,
        payAmount,
        receiveAmount,
        payDecimals,
        receiveDecimals,
        payMint,
        receiveMint,
        slippageBps,
        swapConfig,
        setPayAmount,
        setReceiveAmount,
        payToken,
        receiveToken
    ]);

    const handleSwap = async () => {
        if ((tradeMode === "buy" && selectableBuyPayTokenOptions.length === 0) || (tradeMode === "sell" && selectableSellReceiveTokenOptions.length === 0)) {
            toast.error("You cannot swap because you have insufficient funds.");
            return;
        }

        if (validation.error) {
            toast.error(validation.error);
            return;
        }

        if (quoteState.loading && !quoteState.rawQuote) {
            toast.info("Fetching quote, please try again in a moment.");
            return;
        }

        if (!quoteState.rawQuote) {
            toast.error("No quote available.");
            return;
        }

        const provider = (window as Window & { solana?: PhantomProvider }).solana;
        if (!provider?.isPhantom) {
            toast.error("Phantom wallet not found.");
            return;
        }

        if (!connected || !publicKey) {
            if (isConnecting) return;
            connectWallet();
            toast.info("Please connect your wallet.");
            return;
        }

        setSwapState({ loading: true, error: null, signature: null });

        try {
            const { signature } = await executeJupiterSwap(
                {
                    quoteResponse: quoteState.rawQuote,
                    userPublicKey: publicKey,
                    signTransaction: (tx) => provider.signTransaction(tx)
                },
                { config: swapConfig }
            );

            setSwapState({ loading: false, error: null, signature });
            await refreshBalancesAfterSwap();
            toast.success("Swap submitted!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Swap failed";
            const isUserRejected = /user rejected|rejected the request|denied|cancelled/i.test(message);
            if (isUserRejected) {
                setSwapState({ loading: false, error: null, signature: null });
                toast.info("Transaction was cancelled in wallet.");
                return;
            }
            setSwapState({ loading: false, error: message, signature: null });
            toast.error(message);
        }
    };
  }, [
    lastEdited,
    payAmount,
    receiveAmount,
    payDecimals,
    receiveDecimals,
    payMint,
    receiveMint,
    slippageBps,
    swapConfig,
    setPayAmount,
    setReceiveAmount,
    payToken,
    receiveToken,
    orderType,
  ]);

  const handleSwap = async () => {
    if (
      (tradeMode === 'buy' && selectableBuyPayTokenOptions.length === 0) ||
      (tradeMode === 'sell' && selectableSellReceiveTokenOptions.length === 0)
    ) {
      toast.error('You cannot swap because you have insufficient funds.');
      return;
    }

    if (validation.error) {
      toast.error(validation.error);
      return;
    }

    if (quoteState.loading && !quoteState.rawQuote) {
      toast.info('Fetching quote, please try again in a moment.');
      return;
    }

    if (!quoteState.rawQuote) {
      toast.error('No quote available.');
      return;
    }

    const provider = (window as Window & { solana?: PhantomProvider }).solana;
    if (!provider?.isPhantom) {
      toast.error('Phantom wallet not found.');
      return;
    }

    if (!connected || !publicKey) {
      if (isConnecting) return;
      connectWallet();
      toast.info('Please connect your wallet.');
      return;
    }

    setSwapState({ loading: true, error: null, signature: null });

    try {
      const { signature } = await executeJupiterSwap(
        {
          quoteResponse: quoteState.rawQuote,
          userPublicKey: publicKey,
          signTransaction: (tx) => provider.signTransaction(tx),
        },
        { config: swapConfig }
      );

      setSwapState({ loading: false, error: null, signature });
      await refreshBalancesAfterSwap();
      toast.success('Swap submitted!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Swap failed';
      const isUserRejected = /user rejected|rejected the request|denied|cancelled/i.test(message);
      if (isUserRejected) {
        setSwapState({ loading: false, error: null, signature: null });
        toast.info('Transaction was cancelled in wallet.');
        return;
      }
      setSwapState({ loading: false, error: message, signature: null });
      toast.error(message);
    }
  };

  // Handle limit order creation
  const handleLimitOrder = async () => {
    if (validation.error) {
      toast.error(validation.error);
      return;
    }

    if (!limitPrice || parseInputNumber(limitPrice) <= 0) {
      toast.error('Enter a valid limit price.');
      return;
    }

    const provider = (window as Window & { solana?: PhantomProvider }).solana;
    if (!provider?.isPhantom) {
      toast.error('Phantom wallet not found.');
      return;
    }

    if (!connected || !publicKey) {
      if (isConnecting) return;
      connectWallet();
      toast.info('Please connect your wallet.');
      return;
    }

    if (!payAmount || !receiveAmount) {
      toast.error('Enter amounts.');
      return;
    }

    setSwapState({ loading: true, error: null, signature: null });

    try {
      const makingAmount = toBaseUnits(payAmount, payDecimals);
      const takingAmount = toBaseUnits(receiveAmount, receiveDecimals);

      if (!makingAmount || !takingAmount) {
        throw new Error('Invalid amounts');
      }

      const walletAddress = typeof publicKey === 'string' ? publicKey : (publicKey as any).toBase58();

      // Step 1: Create limit order
      const createResponse = await LimitOrderService.createOrder({
        inputMint: payMint,
        outputMint: receiveMint,
        maker: walletAddress,
        payer: walletAddress,
        params: {
          makingAmount,
          takingAmount,
          slippageBps: slippageBps.toString(),
        },
        computeUnitPrice: 'auto',
        wrapAndUnwrapSol: true,
      });

      // Step 2: Sign transaction
      const txBuffer = Buffer.from(createResponse.transaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuffer);
      const signedTx = await provider.signTransaction(transaction);
      const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');

      // Step 3: Execute
      const executeResponse = await LimitOrderService.executeOrder({
        requestId: createResponse.requestId,
        signedTransaction: signedTxBase64,
      });

      setSwapState({ loading: false, error: null, signature: executeResponse.signature });
      toast.success('Limit order created!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create limit order';
      setSwapState({ loading: false, error: message, signature: null });
      toast.error(message);
    }
  };

  // Calculate amounts based on limit price
  useEffect(() => {
    if (orderType !== 'limit' || !limitPrice || !solPriceUsd) return;
    
    // The user inputs limitPrice in USD per token.
    // However, Jupiter limit orders are executed in token amounts (e.g. sol vs SomeToken).
    // So we need to calculate the relative price between pay token and receive token.
    // For simplicity, we assume one side is SOL or priced against SOL.
    // If not, we still need cross price. But here limitPrice is just USD.
    
    // What we really need is: how many receive tokens per pay token.
    // Let's assume we are trading SOL vs Token.
    // If tradeMode === 'buy', payToken is SOL, receiveToken is Token. 
    // They input `limitPrice` as USD per Token. They spend `payAmount` (SOL).
    // 1 Token = `limitPrice` USD. 
    // 1 SOL = `solPriceUsd` USD.
    // So 1 Token = (limitPrice / solPriceUsd) SOL.
    // Number of tokens received = payAmount (in SOL) / (limitPrice / solPriceUsd) = payAmount * solPriceUsd / limitPrice.

    const priceUsd = parseInputNumber(limitPrice);
    if (priceUsd <= 0) return;

    // This logic assumes we are always pairing with SOL as the quote currency
    const isPaySol = payMint === COMMON_TOKENS.SOL.mint;
    const isReceiveSol = receiveMint === COMMON_TOKENS.SOL.mint;
    
    // Fallback simple relation if it's not a SOL pair (might not be accurate for Token-Token without USD value of pay token)
    const effectiveSolPrice = solPriceUsd || 1; 

    if (lastEdited === 'receive') {
      const amountReceive = parseInputNumber(receiveAmount);
      if (amountReceive > 0) {
        let calculatedPay = 0;
        if (tradeMode === 'buy') {
          calculatedPay = (amountReceive * priceUsd) / effectiveSolPrice;
        } else {
          calculatedPay = (amountReceive * effectiveSolPrice) / priceUsd;
        }
        
        const newPay = formatInputValue(calculatedPay.toString(), payDecimals);
        if (newPay !== payAmount) setPayAmount(newPay);
      } else {
        if (payAmount !== '') setPayAmount('');
      }
    } else {
      const amountPay = parseInputNumber(payAmount);
      if (amountPay > 0) {
        let calculatedReceive = 0;
        if (tradeMode === 'buy') {
          calculatedReceive = (amountPay * effectiveSolPrice) / priceUsd;
        } else {
          calculatedReceive = (amountPay * priceUsd) / effectiveSolPrice;
        }

        const newReceive = formatInputValue(calculatedReceive.toString(), receiveDecimals);
        if (newReceive !== receiveAmount) setReceiveAmount(newReceive);
      } else {
        if (receiveAmount !== '') setReceiveAmount('');
      }
    }
  }, [limitPrice, payAmount, receiveAmount, orderType, receiveDecimals, payDecimals, lastEdited, setPayAmount, setReceiveAmount, solPriceUsd, tradeMode, payMint, receiveMint]);

  return (
    <div className={`rounded-xl p-4 bg-gray-900/80 backdrop-blur border-2 transition-all duration-300 ${
      tradeMode === 'buy'
        ? 'border-green-500/40 shadow-lg shadow-green-500/10'
        : 'border-red-500/40 shadow-lg shadow-red-500/10'
    }`}>
      <div className="flex gap-2 mb-4">
        <Button
          className={`flex-1 font-semibold transition-all duration-200 ${
            tradeMode === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          variant="ghost"
          onClick={() => setTradeMode('buy')}
        >
          Buy
        </Button>
        <Button
          className={`flex-1 font-semibold transition-all duration-200 ${
            tradeMode === 'sell'
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          variant="ghost"
          onClick={() => setTradeMode('sell')}
        >
          Sell
        </Button>
      </div>

      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 px-3 rounded ${
            orderType === 'market'
              ? 'bg-gray-800 border-b-2 border-purple-500'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 px-3 rounded ${
            orderType === 'limit'
              ? 'bg-gray-800 border-b-2 border-purple-500'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
            <div className="flex gap-2 mb-4">
                <Button
                    className={`flex-1 font-semibold transition-all duration-200 ${
                        tradeMode === "buy"
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                    variant="ghost"
                    onClick={() => setTradeMode("buy")}
                >
                    Buy
                </Button>
                <Button
                    className={`flex-1 font-semibold transition-all duration-200 ${
                        tradeMode === "sell"
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                    variant="ghost"
                    onClick={() => setTradeMode("sell")}
                >
                    Sell
                </Button>
            </div>

            <div className="flex gap-2 mb-4 text-sm">
                <button
                    onClick={() => setOrderType("market")}
                    className={`flex-1 py-2 px-3 rounded ${orderType === "market" ? "bg-gray-800 border-b-2 border-purple-500" : "bg-gray-800 text-gray-400"}`}
                >
                    Market
                </button>
                <button
                    onClick={() => setOrderType("limit")}
                    className={`flex-1 py-2 px-3 rounded ${orderType === "limit" ? "bg-gray-800 border-b-2 border-purple-500" : "bg-gray-800 text-gray-400"}`}
                >
                    Limit
                </button>
            </div>

            <div className="mb-4 rounded-lg space-y-4">
                <div>
                    <Label className="text-sm text-gray-400 mb-2 font-semibold">{tradeMode === "buy" ? "From" : "Sell"}</Label>
                    <div className="rounded-xl p-3 bg-gray-800/70 backdrop-blur border  border-gray-600 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 bg-gray-700/70 px-3 py-2 rounded-lg border border-gray-600/60">
                                {tradeMode === "buy" ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={selectableBuyPayTokenOptions.length === 0}
                                                className="inline-flex items-center gap-2 rounded text-sm font-semibold text-gray-100 outline-none"
                                            >
                                                {selectedBuyPayToken ? (
                                                    <>
                                                        <img src={payTokenLogo} className="w-5 h-5 rounded-full" alt={payToken} />
                                                        <span className="leading-4">{payToken}</span>
                                                    </>
                                                ) : (
                                                    <span className="leading-4 text-gray-400">Select token</span>
                                                )}
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-64 border-gray-700 bg-gray-900/95 text-gray-100">
                                            {selectableBuyPayTokenOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.mint}
                                                    onSelect={() => setSelectedBuyPayMint(option.mint)}
                                                    className="flex items-center gap-3 px-2 py-2"
                                                >
                                                    <img src={option.logoUri} className="w-5 h-5 rounded-full" alt={option.symbol} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-100">{option.symbol}</div>
                                                        <div className="text-xs text-gray-400">
                                                            Balance: {formatDisplay(String(option.balance), getOptionDecimals(option))}
                                                        </div>
                                                    </div>
                                                    {selectedBuyPayMint === option.mint && <Check className="h-4 w-4 text-cyan-400" />}
                                                </DropdownMenuItem>
                                            ))}
                                            {selectableBuyPayTokenOptions.length === 0 && (
                                                <DropdownMenuItem disabled className="px-2 py-2 text-gray-500">
                                                    No available tokens
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <>
                                        <img src={payTokenLogo} className="w-5 h-5 rounded-full" alt={payToken} />
                                        <span className="font-semibold text-gray-100 tracking-wide">{payToken}</span>
                                    </>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] uppercase tracking-wide text-gray-400">Balance</div>
                                <div className="text-sm font-semibold text-gray-100">
                                    {formatDisplay(payBalance, payDecimals)} {payToken || "--"}
                                </div>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={payAmount}
                            onChange={(e) => {
                                setLastEdited("pay");
                                setPayAmount(sanitizeInput(e.target.value, payDecimals));
                            }}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base font-bold text-white outline-none placeholder-gray-600 focus:border-gray-500"
                            onBlur={() => setPayAmount(formatInputValue(payAmount, payDecimals))}
                        />
                        <div className="mt-2 text-xs text-gray-400">Enter one field and the other updates from quote.</div>
                    </div>
                </div>

                {orderType === "limit" && (
                    <div className="mb-4">
                        <Label className="text-sm text-gray-400 mb-2 font-semibold">
                            Limit Price ({receiveToken} per {payToken})
                        </Label>
                        <div className="rounded-lg p-3 bg-gray-800/70 backdrop-blur transition-all border border-yellow-600/50">
                            <input
                                type="text"
                                value={limitPrice}
                                onChange={(e) => {
                                    setLimitPrice(sanitizeInput(e.target.value, receiveDecimals));
                                }}
                                placeholder="0.00"
                                className="w-full bg-transparent text-base font-bold outline-none text-white placeholder-gray-600"
                                onBlur={() => setLimitPrice(formatInputValue(limitPrice, receiveDecimals))}
                            />
                            <div className="mt-2 text-xs text-yellow-500">Order executes when price reaches this level</div>
                        </div>
                    </div>
                )}

                <div>
                    <Label className="text-sm text-gray-400 mb-2 font-semibold">Receive</Label>
                    <div className="rounded-xl p-3 backdrop-blur shadow-sm bg-gray-800/70 border  border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 bg-gray-700/70 px-3 py-2 rounded-lg border border-gray-600/60">
                                {tradeMode === "sell" ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={selectableSellReceiveTokenOptions.length === 0}
                                                className="inline-flex items-center gap-2 rounded text-sm font-semibold text-gray-100 outline-none"
                                            >
                                                {selectedSellReceiveToken ? (
                                                    <>
                                                        <img src={receiveTokenLogo} className="w-5 h-5 rounded-full" alt={receiveToken} />
                                                        <span className="leading-4">{receiveToken}</span>
                                                    </>
                                                ) : (
                                                    <span className="leading-4 text-gray-400">Select token</span>
                                                )}
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-64 border-gray-700 bg-gray-900/95 text-gray-100">
                                            {selectableSellReceiveTokenOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.mint}
                                                    onSelect={() => setSelectedSellReceiveMint(option.mint)}
                                                    className="flex items-center gap-3 px-2 py-2"
                                                >
                                                    <img src={option.logoUri} className="w-5 h-5 rounded-full" alt={option.symbol} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-100">{option.symbol}</div>
                                                        <div className="text-xs text-gray-400">
                                                            Balance: {formatDisplay(String(option.balance), getOptionDecimals(option))}
                                                        </div>
                                                    </div>
                                                    {selectedSellReceiveMint === option.mint && <Check className="h-4 w-4 text-cyan-400" />}
                                                </DropdownMenuItem>
                                            ))}
                                            {selectableSellReceiveTokenOptions.length === 0 && (
                                                <DropdownMenuItem disabled className="px-2 py-2 text-gray-500">
                                                    No available tokens
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <>
                                        <img src={receiveTokenLogo} className="w-5 h-5 rounded-full" alt={receiveToken} />
                                        <span className="font-semibold text-gray-100 tracking-wide">{receiveToken}</span>
                                    </>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] uppercase tracking-wide text-gray-400">Balance</div>
                                <div className="text-sm font-semibold text-gray-100">
                                    {formatDisplay(receiveBalance, receiveDecimals)} {receiveToken || "--"}
                                </div>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={receiveAmount}
                            onChange={(e) => {
                                setLastEdited("receive");
                                setReceiveAmount(sanitizeInput(e.target.value, receiveDecimals));
                            }}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base font-bold text-white outline-none placeholder-gray-600 focus:border-gray-500"
                            onBlur={() => setReceiveAmount(formatInputValue(receiveAmount, receiveDecimals))}
                        />
                        <div className="mt-1 text-xs text-gray-500">Estimated from current route and slippage.</div>
                    </div>
                </div>
            </div>

      {orderType === 'limit' && (
        <div className="mb-4">
          <Label className="text-sm text-gray-400 mb-2 font-semibold">
            Limit Price (USD per {tradeMode === 'buy' ? receiveToken : payToken})
          </Label>
          <div className="rounded-lg p-3 bg-gray-800/70 backdrop-blur transition-all border border-yellow-600/50 flex items-center">
            <span className="text-gray-400 mr-2">$</span>
            <input
              type="text"
              value={limitPrice}
              onChange={(e) => {
                setLimitPrice(sanitizeInput(e.target.value, 15));
              }}
              placeholder="0.00"
              className="w-full bg-transparent text-base font-bold outline-none text-white placeholder-gray-600"
              onBlur={() => setLimitPrice(formatInputValue(limitPrice, 15))}
            />
            {token.price && (
              <button
                type="button"
                onClick={() => setLimitPrice(token.price.toString())}
                className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-cyan-400 font-semibold whitespace-nowrap transition-colors"
                title="Use current market price"
              >
                Current Price
              </button>
            )}
          </div>
            <div className="mt-2 text-xs text-yellow-500">
              {/* Order executes when price reaches this USD value <br/>  */}
              SOL price: ${solPriceUsd?.toFixed(2) || '--'}
            </div>
        </div>
      )}

        <div>
          <Label className="text-sm text-gray-400 mb-2 font-semibold">Receive</Label>
          <div className="rounded-xl p-3 backdrop-blur shadow-sm bg-gray-800/70 border  border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 bg-gray-700/70 px-3 py-2 rounded-lg border border-gray-600/60">
                {tradeMode === 'sell' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={selectableSellReceiveTokenOptions.length === 0}
                        className="inline-flex items-center gap-2 rounded text-sm font-semibold text-gray-100 outline-none"
                      >
                        {selectedSellReceiveToken ? (
                          <>
                            <img src={receiveTokenLogo} className="w-5 h-5 rounded-full" alt={receiveToken} />
                            <span className="leading-4">{receiveToken}</span>
                          </>
                        ) : (
                          <span className="leading-4 text-gray-400">Select token</span>
                        )}
                    </span>
                </div>
                {quoteState.routeDetails.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">{quoteState.routeDetails.join(" → ")}</div>
                )}
                {quoteState.loading && <div className="mt-2 text-xs text-yellow-400 font-medium">Fetching quote...</div>}
                {quoteState.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {quoteState.error}</div>}
                {validation.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {validation.error}</div>}
                {swapState.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {swapState.error}</div>}
                {swapState.signature && (
                    <div className="mt-2 text-xs text-green-400">
                        Swap submitted: {swapState.signature.slice(0, 4)}...{swapState.signature.slice(-4)}
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-4">
                {["0.1", "0.5", "1", "MAX"].map((amount) => (
                    <button
                        key={amount}
                        onClick={() => {
                            setLastEdited("pay");
                            setPayAmount(amount === "MAX" ? payBalance : amount);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-gray-800/70 hover:bg-gray-700/80 text-sm font-medium text-gray-300 border border-gray-700/50 transition-all hover:border-gray-600"
                    >
                        {amount}
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2 font-semibold">Slippage</Label>
        <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/70 backdrop-blur flex items-center gap-2 hover:bg-gray-800/80 transition-colors">
          <input
            type="number"
            min="1"
            step="1"
            value={slippageBps}
            onChange={(e) => setSlippageBps(Number(e.target.value))}
            className="w-full bg-transparent text-base font-bold outline-none text-white placeholder-gray-600"
          />
          <span className="text-sm text-gray-400 font-semibold">bps</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">Example: 50 bps = 0.5%</div>
      </div>

      {/* Quote Summary */}
      {orderType === 'market' && (
      <div className="mb-4 text-sm bg-gray-800/50 rounded-lg p-3 border border-gray-700 space-y-2">
        <div className="flex items-center justify-between text-gray-300">
          <span className="text-gray-400">Price Impact</span>
          <span className="font-semibold">
            {quoteState.priceImpactPct === null ? '--' : `${(quoteState.priceImpactPct * 100).toFixed(2)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-300">
          <span className="text-gray-400">{lastEdited === 'receive' ? 'Maximum Paid' : 'Minimum Received'}</span>
          <span className="font-semibold">{formattedQuote}</span>
        </div>
        <div className="flex items-center justify-between text-gray-300">
          <span className="text-gray-400">Route</span>
          <span className="flex items-center gap-2">
            <span>{quoteState.routeLabel ?? '--'}</span>
            {quoteState.routePathTokens.length > 0 && (
              <button
                type="button"
                onClick={() => setRouteModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                View route details
              </button>
            )}
          </span>
        </div>
        {quoteState.routeDetails.length > 0 && (
          <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">
            {quoteState.routeDetails.join(' → ')}
          </div>
        )}
        {quoteState.loading && <div className="mt-2 text-xs text-yellow-400 font-medium">Fetching quote...</div>}
        {quoteState.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {quoteState.error}</div>}
        
        {validation.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {validation.error}</div>}
        {swapState.error && <div className="mt-2 text-xs text-red-400 font-semibold">✕ {swapState.error}</div>}
        {swapState.signature && (
          <div className="mt-2 text-xs text-green-400">Order submitted: {swapState.signature.slice(0, 4)}...{swapState.signature.slice(-4)}</div>
        )}
      </div>
      )}

      {/* Error/Success messages for Limit Order (since they were moved out of the Quote Summary) */}
      {orderType === 'limit' && (
        <div className="mb-4 text-sm space-y-2">
          {validation.error && <div className="text-xs text-red-400 font-semibold">✕ {validation.error}</div>}
          {swapState.error && <div className="text-xs text-red-400 font-semibold">✕ {swapState.error}</div>}
          {swapState.signature && (
            <div className="text-xs text-green-400">Order submitted: {swapState.signature.slice(0, 4)}...{swapState.signature.slice(-4)}</div>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['0.1', '0.5', '1', 'MAX'].map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setLastEdited('pay');
              setPayAmount(amount === 'MAX' ? payBalance : amount);
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-gray-800/70 hover:bg-gray-700/80 text-sm font-medium text-gray-300 border border-gray-700/50 transition-all hover:border-gray-600"
          >
            {amount}
          </button>
        ))}
      </div>

      <Button
        className={`w-full font-bold py-6 text-lg transition-all duration-200 ${
          tradeMode === 'buy'
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/40'
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/40'
        }`}
        onClick={orderType === 'market' ? handleSwap : handleLimitOrder}
        disabled={
          swapState.loading ||
          (orderType === 'market' && quoteState.loading) ||
          !!validation.error ||
          (tradeMode === 'buy' && selectableBuyPayTokenOptions.length === 0) ||
          (tradeMode === 'sell' && selectableSellReceiveTokenOptions.length === 0)
        }
      >
        {swapState.loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {orderType === 'market' ? 'Swapping...' : 'Creating Order...'}
          </span>
        ) : (
          <>
            {orderType === 'market' 
              ? `${tradeMode.toUpperCase()} ${tradeMode === 'buy' ? token.symbol : payToken}`
              : 'PLACE LIMIT ORDER'
            }
          </>
        )}
      </Button>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-700 pt-3">
        <span>Powered by Jupiter API</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Connected: Solana Mainnet</span>
        </div>
      </div>

      <Dialog open={routeModalOpen} onOpenChange={setRouteModalOpen}>
        <DialogContent className="sm:max-w-lg border-2 border-gray-700 bg-gray-900 shadow-xl shadow-black/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Route details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Token hops and DEX path for this quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-200">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Token hops</div>
              <div className="flex flex-wrap items-center gap-1">
                {quoteState.routePathTokens.length === 0 ? (
                  <span className="text-gray-400">--</span>
                ) : (
                    <>{orderType === "market" ? `${tradeMode.toUpperCase()} ${tradeMode === "buy" ? token.symbol : payToken}` : "PLACE LIMIT ORDER"}</>
                )}
            </Button>

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-700 pt-3">
                <span>Powered by Jupiter API</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Connected: Solana Mainnet</span>
                </div>
            </div>

            <Dialog open={routeModalOpen} onOpenChange={setRouteModalOpen}>
                <DialogContent className="sm:max-w-lg border-2 border-gray-700 bg-gray-900 shadow-xl shadow-black/50">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-white">Route details</DialogTitle>
                        <DialogDescription className="text-gray-400">Token hops and DEX path for this quote.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-gray-200">
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Token hops</div>
                            <div className="flex flex-wrap items-center gap-1">
                                {quoteState.routePathTokens.length === 0 ? (
                                    <span className="text-gray-400">--</span>
                                ) : (
                                    quoteState.routePathTokens.map((routeToken, index) => (
                                        <React.Fragment key={`${routeToken.display}-${index}`}>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!routeToken.full) return;
                                                    const success = await copyToClipboard(routeToken.full);
                                                    if (success) {
                                                        setCopiedMint(routeToken.full);
                                                        window.setTimeout(() => setCopiedMint((prev) => (prev === routeToken.full ? null : prev)), 1500);
                                                    }
                                                }}
                                                className="flex items-center gap-1 rounded bg-gray-700/80 px-2 py-1 text-left hover:bg-gray-700 border border-gray-600/50 transition-colors"
                                                title={routeToken.full ?? routeToken.display}
                                            >
                                                <span className="text-sm font-medium">{routeToken.display}</span>
                                                {routeToken.full && copiedMint === routeToken.full ? (
                                                    <Check className="h-3 w-3 text-green-400" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-gray-500" />
                                                )}
                                            </button>
                                            {index < quoteState.routePathTokens.length - 1 && <span className="text-gray-500 text-xs">→</span>}
                                        </React.Fragment>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">DEX path</div>
                            <div className="text-sm font-medium text-gray-300">
                                {quoteState.routeDetails.length > 0 ? quoteState.routeDetails.join(" → ") : "--"}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
