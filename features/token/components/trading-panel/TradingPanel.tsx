"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { TokenDetail } from "../../types/token.types";
import { useTokenUIStore } from "../../stores/token.stores";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import { useSolPrice } from "@/features/swap/hooks/useSolPrice";
import { useSwapInfo } from "@/features/swap/hooks/use-swap-info";
import { useJupiterQuote } from "@/features/swap/hooks/useJupiterQuote";
import { useSwapConfigStore } from "@/features/swap-config/store";
import { useSwapConfigCtx } from "@/features/swap-config/use-swap-config-ctx";
import { serializeAllSwapConfig } from "@/features/swap-config/serialize";
import { SwapConfigSection } from "@/features/swap-config/components/SwapConfigSection";
import { AdvancedStrategySection } from "@/features/swap-config/advanced-strategy/AdvancedStrategySection";
import type { TokenPair } from "@/features/swap-config/core/types";
import { formatDisplay, formatFromBaseUnits, formatInputValue, parseInputNumber, toBaseUnits } from "@/features/swap";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useTradingBalances } from "../../hooks/trading/useTradingBalances";
import { useTradingTokenOptions } from "../../hooks/trading/useTradingTokenOptions";
import { useTradeValidation } from "../../hooks/trading/useTradeValidation";
import { useQuoteFieldSync } from "../../hooks/trading/useQuoteFieldSync";
import { useLimitOrderRecalc } from "../../hooks/trading/useLimitOrderRecalc";
import { isUserRejectionError, useExecuteSwap } from "../../hooks/trading/useExecuteSwap";
import { useExecuteLimitOrder } from "../../hooks/trading/useExecuteLimitOrder";
import { TradeModeToggle } from "./TradeModeToggle";
import { OrderTypeToggle } from "./OrderTypeToggle";
import { TokenAmountField } from "./TokenAmountField";
import { LimitPriceInput } from "./LimitPriceInput";
import { QuickAmountButtons } from "./QuickAmountButtons";
import { QuoteSummary } from "./QuoteSummary";
import { TradeStatusMessages } from "./TradeStatusMessages";
import { ExecuteButton } from "./ExecuteButton";
import { TradingPanelFooter } from "./TradingPanelFooter";
import { RouteDetailsDialog } from "./RouteDetailsDialog";

interface TradingPanelProps {
    token: TokenDetail;
}

export function TradingPanel({ token }: TradingPanelProps) {
    const tradeMode = useTokenUIStore((s) => s.tradeMode);
    const orderType = useTokenUIStore((s) => s.orderType);
    const payAmount = useTokenUIStore((s) => s.payAmount);
    const setPayAmount = useTokenUIStore((s) => s.setPayAmount);
    const receiveAmount = useTokenUIStore((s) => s.receiveAmount);
    const setReceiveAmount = useTokenUIStore((s) => s.setReceiveAmount);
    const selectedBuyPayMint = useTokenUIStore((s) => s.selectedBuyPayMint);
    const setSelectedBuyPayMint = useTokenUIStore((s) => s.setSelectedBuyPayMint);
    const selectedSellReceiveMint = useTokenUIStore((s) => s.selectedSellReceiveMint);
    const setSelectedSellReceiveMint = useTokenUIStore((s) => s.setSelectedSellReceiveMint);
    const resetTradingPanel = useTokenUIStore((s) => s.resetTradingPanel);
    const [lastEdited, setLastEdited] = useState<"pay" | "receive" | null>(null);
    const [routeModalOpen, setRouteModalOpen] = useState(false);
    const internalUpdateRef = useRef(false);
    const noSwapOptionsNotifiedRef = useRef(false);
    const { connectWallet, isConnecting, connected, publicKey } = useWallet();
    const { data: solPriceData } = useSolPrice();
    const solPriceUsd = solPriceData?.price_usd ?? null;
    const balances = useTradingBalances({ tokenAddress: token.address });
    const opts = useTradingTokenOptions({
        token,
        selectedWallet: balances.selectedWallet,
        positionsData: balances.positionsData,
        ownedTokenPosition: balances.ownedTokenPosition,
        onMintChanged: () => setLastEdited(null)
    });

    const swapPair = useMemo<TokenPair | undefined>(() => {
        if (!opts.payMint || !opts.receiveMint) return undefined;
        return {
            quote: { mint: opts.payMint, symbol: opts.payToken, decimals: opts.payDecimals, logoUri: opts.payTokenLogo || null },
            receive: { mint: opts.receiveMint, symbol: opts.receiveToken, decimals: opts.receiveDecimals, logoUri: opts.receiveTokenLogo || null }
        };
    }, [opts.payMint, opts.receiveMint, opts.payToken, opts.receiveToken, opts.payDecimals, opts.receiveDecimals, opts.payTokenLogo, opts.receiveTokenLogo]);

    const swapConfigStates = useSwapConfigStore((s) => s.items);
    const setSwapConfigItem = useSwapConfigStore((s) => s.setItem);
    const { data: swapInfo } = useSwapInfo({ inputMint: opts.payMint, outputMint: opts.receiveMint });
    const swapConfigCtx = useSwapConfigCtx({ swapInfo, pair: swapPair });
    const swapConfigFragment = useMemo(() => serializeAllSwapConfig(swapConfigStates, swapConfigCtx), [swapConfigStates, swapConfigCtx]);
    const slippageBps = swapConfigFragment.slippageBps ?? 50;
    const gaslessFeeToken = swapConfigFragment.gaslessFeeToken;
    const sourceAmount = lastEdited === "pay" ? payAmount : receiveAmount;
    const debouncedSourceAmount = useDebouncedValue(sourceAmount, 350);
    const swapMode: "ExactIn" | "ExactOut" = lastEdited === "receive" ? "ExactOut" : "ExactIn";
    const amountBaseUnits = useMemo(() => {
        if (!debouncedSourceAmount) return "";
        const decimals = swapMode === "ExactIn" ? opts.payDecimals : opts.receiveDecimals;
        return toBaseUnits(debouncedSourceAmount, decimals) ?? "";
    }, [debouncedSourceAmount, swapMode, opts.payDecimals, opts.receiveDecimals]);
    const quoteQuery = useJupiterQuote({
        inputMint: opts.payMint || undefined,
        outputMint: opts.receiveMint || undefined,
        amount: amountBaseUnits,
        swapMode,
        slippageBps,
        payTokenSymbol: opts.payToken,
        receiveTokenSymbol: opts.receiveToken,
        enabled: orderType === "market" && lastEdited !== null && !!opts.payMint && !!opts.receiveMint
    });

    useEffect(() => {
        if (internalUpdateRef.current) internalUpdateRef.current = false;
    }, [payAmount, receiveAmount]);

    useQuoteFieldSync({
        quoteData: quoteQuery.data,
        swapMode,
        payDecimals: opts.payDecimals,
        receiveDecimals: opts.receiveDecimals,
        internalUpdateRef,
        enabled: orderType === "market"
    });
    useLimitOrderRecalc({
        payDecimals: opts.payDecimals,
        receiveDecimals: opts.receiveDecimals,
        payMint: opts.payMint,
        receiveMint: opts.receiveMint,
        tradeMode,
        lastEdited,
        solPriceUsd,
        internalUpdateRef
    });

    const validation = useTradeValidation({
        connected,
        publicKey,
        balancesLoading: balances.balancesLoading,
        positionsError: balances.positionsError,
        tradeMode,
        selectedBuyPayToken: opts.selectedBuyPayToken,
        selectedSellReceiveToken: opts.selectedSellReceiveToken,
        lastEdited,
        payAmount,
        receiveAmount,
        payBalance: opts.payBalance
    });
    const swapMutation = useExecuteSwap({ refreshBalancesAfterSwap: balances.refreshBalancesAfterSwap });
    const limitMutation = useExecuteLimitOrder();

    useEffect(() => {
        resetTradingPanel();
        setLastEdited(null);
        swapMutation.reset();
        limitMutation.reset();
    }, [token.address, resetTradingPanel]);

    useEffect(() => {
        const hasNoSwapOptions =
            (tradeMode === "buy" && opts.selectableBuyPayTokenOptions.length === 0) ||
            (tradeMode === "sell" && opts.selectableSellReceiveTokenOptions.length === 0);
        if (!hasNoSwapOptions) {
            noSwapOptionsNotifiedRef.current = false;
            return;
        }
        if (noSwapOptionsNotifiedRef.current) return;
        noSwapOptionsNotifiedRef.current = true;
        toast.error("You cannot swap because you have insufficient funds.");
    }, [tradeMode, opts.selectableBuyPayTokenOptions.length, opts.selectableSellReceiveTokenOptions.length]);

    useEffect(() => {
        if (payAmount) setLastEdited("pay");
        else if (receiveAmount) setLastEdited("receive");
    }, [orderType]);

    const formattedQuote = useMemo(() => {
        const otherAmountThreshold = quoteQuery.data?.otherAmountThreshold;
        if (!otherAmountThreshold) return "--";
        const decimals = lastEdited === "receive" ? opts.payDecimals : opts.receiveDecimals;
        return formatDisplay(formatFromBaseUnits(otherAmountThreshold, decimals), decimals);
    }, [quoteQuery.data?.otherAmountThreshold, lastEdited, opts.payDecimals, opts.receiveDecimals]);

    const hasNoSwapOptions =
        (tradeMode === "buy" && opts.selectableBuyPayTokenOptions.length === 0) ||
        (tradeMode === "sell" && opts.selectableSellReceiveTokenOptions.length === 0);
    const swapErrorRaw = swapMutation.error;
    const swapError = swapErrorRaw && !isUserRejectionError(swapErrorRaw) ? swapErrorRaw.message : null;
    const limitError = limitMutation.error?.message ?? null;
    const activeSignature = (orderType === "market" ? swapMutation.data?.signature : limitMutation.data?.signature) ?? null;
    const isPending = orderType === "market" ? swapMutation.isPending : limitMutation.isPending;

    const handleExecute = () => {
        if (orderType === "market") {
            if (hasNoSwapOptions) return void toast.error("You cannot swap because you have insufficient funds.");
            if (validation.error) return void toast.error(validation.error);
            if (quoteQuery.isFetching && !quoteQuery.data?.rawQuote) return void toast.info("Fetching quote, please try again in a moment.");
            if (!quoteQuery.data?.rawQuote) return void toast.error("No quote available.");
            if (!connected || !publicKey) {
                if (isConnecting) return;
                connectWallet();
                return void toast.info("Please connect your wallet.");
            }
            return swapMutation.mutate({ quoteResponse: quoteQuery.data.rawQuote, userPublicKey: publicKey, gaslessFeeToken });
        }

        if (validation.error) return void toast.error(validation.error);
        const limitPriceValue = useTokenUIStore.getState().limitPrice;
        if (!limitPriceValue || parseInputNumber(limitPriceValue) <= 0) return void toast.error("Enter a valid limit price.");
        if (!connected || !publicKey) {
            if (isConnecting) return;
            connectWallet();
            return void toast.info("Please connect your wallet.");
        }
        if (!payAmount || !receiveAmount) return void toast.error("Enter amounts.");
        return limitMutation.mutate({
            payAmount,
            receiveAmount,
            payDecimals: opts.payDecimals,
            receiveDecimals: opts.receiveDecimals,
            payMint: opts.payMint,
            receiveMint: opts.receiveMint,
            walletAddress: publicKey,
            slippageBps
        });
    };

    return (
        <div
            className={`rounded-xl p-4 bg-[var(--surface-card)] border-2 transition-all duration-300 ${
                tradeMode === "buy" ? "border-green-500/40 shadow-lg shadow-green-500/10" : "border-red-500/40 shadow-lg shadow-red-500/10"
            }`}
        >
            <TradeModeToggle />
            <OrderTypeToggle />
            <div className="mb-4 rounded-lg space-y-4">
                <TokenAmountField
                    label={tradeMode === "buy" ? "From" : "Sell"}
                    mode={
                        tradeMode === "buy"
                            ? {
                                  kind: "select",
                                  options: opts.selectableBuyPayTokenOptions,
                                  selectedMint: selectedBuyPayMint,
                                  selectedToken: opts.selectedBuyPayToken,
                                  onSelect: setSelectedBuyPayMint
                              }
                            : { kind: "fixed" }
                    }
                    symbol={opts.payToken}
                    logoUri={opts.payTokenLogo}
                    balance={opts.payBalance}
                    decimals={opts.payDecimals}
                    amount={payAmount}
                    onAmountChange={(next) => {
                        setLastEdited("pay");
                        setPayAmount(next);
                    }}
                    onAmountBlur={() => setPayAmount(formatInputValue(payAmount, opts.payDecimals))}
                    helperText="Enter one field and the other updates from quote."
                />
                <LimitPriceInput payToken={opts.payToken} receiveToken={opts.receiveToken} tokenPrice={token.price} solPriceUsd={solPriceUsd} />
                <TokenAmountField
                    label="Receive"
                    mode={
                        tradeMode === "sell"
                            ? {
                                  kind: "select",
                                  options: opts.selectableSellReceiveTokenOptions,
                                  selectedMint: selectedSellReceiveMint,
                                  selectedToken: opts.selectedSellReceiveToken,
                                  onSelect: setSelectedSellReceiveMint
                              }
                            : { kind: "fixed" }
                    }
                    symbol={opts.receiveToken}
                    logoUri={opts.receiveTokenLogo}
                    balance={opts.receiveBalance}
                    decimals={opts.receiveDecimals}
                    amount={receiveAmount}
                    onAmountChange={(next) => {
                        setLastEdited("receive");
                        setReceiveAmount(next);
                    }}
                    onAmountBlur={() => setReceiveAmount(formatInputValue(receiveAmount, opts.receiveDecimals))}
                    helperText="Estimated from current route and slippage."
                    helperClassName="mt-1 text-xs text-[var(--text-muted)]"
                />
            </div>
            <div className="mb-4">
                <SwapConfigSection
                    states={swapConfigStates}
                    onItemChange={setSwapConfigItem}
                    inputMint={opts.payMint || undefined}
                    outputMint={opts.receiveMint || undefined}
                    pair={swapPair}
                />
            </div>
            <div className="mb-4">
                <AdvancedStrategySection />
            </div>
            <QuoteSummary
                formattedQuote={formattedQuote}
                lastEdited={lastEdited}
                priceImpactPct={quoteQuery.data?.priceImpactPct ?? null}
                routeLabel={quoteQuery.data?.routeLabel ?? null}
                routePathTokens={quoteQuery.data?.routePathTokens ?? []}
                routeDetails={quoteQuery.data?.routeDetails ?? []}
                quoteLoading={quoteQuery.isFetching}
                quoteError={quoteQuery.error?.message ?? null}
                validationError={validation.error}
                swapError={swapError}
                swapSignature={activeSignature}
                onOpenRouteDetails={() => setRouteModalOpen(true)}
            />
            <TradeStatusMessages validationError={validation.error} swapError={limitError} swapSignature={activeSignature} />
            <QuickAmountButtons
                payBalance={opts.payBalance}
                onPickAmount={(amount) => {
                    setLastEdited("pay");
                    setPayAmount(amount);
                }}
            />
            <ExecuteButton
                isPending={isPending}
                isQuoteLoading={quoteQuery.isFetching}
                hasValidationError={!!validation.error}
                hasNoSwapOptions={hasNoSwapOptions}
                tokenSymbol={token.symbol}
                payToken={opts.payToken}
                onClick={handleExecute}
            />
            <TradingPanelFooter />
            <RouteDetailsDialog
                open={routeModalOpen}
                onOpenChange={setRouteModalOpen}
                routePathTokens={quoteQuery.data?.routePathTokens ?? []}
                routeDetails={quoteQuery.data?.routeDetails ?? []}
            />
        </div>
    );
}
