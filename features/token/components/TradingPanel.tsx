import React, { useEffect, useRef, useState } from "react";
import { useTokenUIStore } from "../stores/token.stores";
import type { TokenDetail } from "../types/token.types";
import { COMMON_TOKENS } from "@/lib/constants";
import { formatInputValue, parseInputNumber, sanitizeInput, getSwapApiConfig } from "@/features/swap";
import { useTokenPair } from "../hooks/useTokenPair";
import { useQuoteState } from "../hooks/useQuoteState";
import { useSwapFlow } from "../hooks/useSwapFlow";
import { TradingPanelHeader } from "./TradingPanelHeader";
import { TokenAmountInput } from "./TokenAmountInput";
import { SlippageSettings } from "./SlippageSettings";
import { QuoteDisplay } from "./QuoteDisplay";
import { SwapButton } from "./SwapButton";
import { RouteModal } from "./RouteModal";

interface TradingPanelProps {
    token: TokenDetail;
}

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
        resetTradingPanel
    } = useTokenUIStore();

    const [lastEdited, setLastEdited] = useState<"pay" | "receive" | null>(null);
    const [routeModalOpen, setRouteModalOpen] = useState(false);

    const previousBuyPayMintRef = useRef("");
    const previousSellReceiveMintRef = useRef("");

    const isViewingSolToken = token.address.toLowerCase() === COMMON_TOKENS.SOL.mint.toLowerCase();
    const swapConfig = getSwapApiConfig();

    const tokenPair = useTokenPair(token, tradeMode, isViewingSolToken);
    const {
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
        getOptionDecimals,
        balancesLoading,
        positionsError,
        refetchWallets,
        refetchPositions
    } = tokenPair;

    const quoteStateHook = useQuoteState(lastEdited, payDecimals, receiveDecimals, {
        orderType,
        payAmount,
        receiveAmount,
        payMint,
        receiveMint,
        slippageBps,
        payToken,
        receiveToken,
        swapConfig,
        setPayAmount,
        setReceiveAmount
    });
    const { quoteState, formattedQuote, resetQuote } = quoteStateHook;

    // Reset on token change
    useEffect(() => {
        resetTradingPanel();
        setLastEdited(null);
        resetQuote();
        setSelectedBuyPayMint(isViewingSolToken ? "" : COMMON_TOKENS.SOL.mint);
        setSelectedSellReceiveMint(isViewingSolToken ? "" : COMMON_TOKENS.SOL.mint);
    }, [token.address, resetTradingPanel, isViewingSolToken, resetQuote, setSelectedBuyPayMint, setSelectedSellReceiveMint]);

    // Reset quote when pay token changes (buy mode)
    useEffect(() => {
        if (tradeMode !== "buy") return;
        if (selectedBuyPayMint === previousBuyPayMintRef.current) return;
        previousBuyPayMintRef.current = selectedBuyPayMint;
        setLastEdited(null);
        setPayAmount("");
        setReceiveAmount("");
        resetQuote();
    }, [tradeMode, selectedBuyPayMint, setPayAmount, setReceiveAmount, resetQuote]);

    // Reset quote when receive token changes (sell mode)
    useEffect(() => {
        if (tradeMode !== "sell") return;
        if (selectedSellReceiveMint === previousSellReceiveMintRef.current) return;
        previousSellReceiveMintRef.current = selectedSellReceiveMint;
        setLastEdited(null);
        setPayAmount("");
        setReceiveAmount("");
        resetQuote();
    }, [tradeMode, selectedSellReceiveMint, setPayAmount, setReceiveAmount, resetQuote]);

    const validation = (() => {
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
        }
        if (lastEdited === "receive") {
            if (!receiveAmount) return { error: null };
            if (receiveValue <= 0) return { error: "Amount must be greater than 0." };
            if (payAmount && payValue > payBalanceValue) return { error: "Insufficient balance." };
        }
        return { error: null };
    })();

    const refreshBalancesAfterSwap = async () => {
        await Promise.all([refetchWallets(), refetchPositions()]);
        window.setTimeout(() => {
            refetchWallets();
            refetchPositions();
        }, 2000);
    };

    const { swapState, solPriceUsd, handleSwap, handleLimitOrder } = useSwapFlow({
        payMint,
        receiveMint,
        payAmount,
        receiveAmount,
        payDecimals,
        receiveDecimals,
        slippageBps,
        orderType,
        limitPrice,
        tradeMode,
        quoteState,
        selectablePayTokensLength: selectablePayTokens.length,
        selectableReceiveTokensLength: selectableReceiveTokens.length,
        validationError: validation.error,
        lastEdited,
        setPayAmount,
        setReceiveAmount,
        refreshBalancesAfterSwap
    });

    return (
        <div
            className={`rounded-xl p-4 bg-gray-900/80 backdrop-blur border-2 transition-all duration-300 ${
                tradeMode === "buy" ? "border-green-500/40 shadow-lg shadow-green-500/10" : "border-red-500/40 shadow-lg shadow-red-500/10"
            }`}
        >
            <TradingPanelHeader tradeMode={tradeMode} setTradeMode={setTradeMode} orderType={orderType} setOrderType={setOrderType} />

            <div className="mb-4 rounded-lg space-y-4">
                <TokenAmountInput
                    label={tradeMode === "buy" ? "From" : "Sell"}
                    tokenSymbol={payToken}
                    tokenLogo={payTokenLogo}
                    balance={payBalance}
                    decimals={payDecimals}
                    amount={payAmount}
                    onAmountChange={(v) => {
                        setLastEdited("pay");
                        setPayAmount(sanitizeInput(v, payDecimals));
                    }}
                    onBlur={() => setPayAmount(formatInputValue(payAmount, payDecimals))}
                    hint="Enter one field and the other updates from quote."
                    isDropdown={tradeMode === "buy"}
                    selectableTokens={selectablePayTokens}
                    selectedMint={selectedBuyPayMint}
                    onSelectToken={setSelectedBuyPayMint}
                    getOptionDecimals={getOptionDecimals}
                />

                {orderType === "limit" && (
                    <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 font-semibold block">
                            Limit Price (USD per {tradeMode === "buy" ? receiveToken : payToken})
                        </label>
                        <div className="rounded-lg p-3 bg-gray-800/70 backdrop-blur transition-all border border-yellow-600/50 flex items-center">
                            <span className="text-gray-400 mr-2">$</span>
                            <input
                                type="text"
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(sanitizeInput(e.target.value, 15))}
                                placeholder="0.00"
                                className="w-full bg-transparent text-base font-bold outline-none text-white placeholder-gray-600"
                                onBlur={() => setLimitPrice(formatInputValue(limitPrice, 15))}
                            />
                            {token.price && (
                                <button
                                    type="button"
                                    onClick={() => setLimitPrice(token.price.toString())}
                                    className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-cyan-400 font-semibold whitespace-nowrap transition-colors"
                                >
                                    Current Price
                                </button>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-yellow-500">SOL price: ${solPriceUsd?.toFixed(2) || "--"}</div>
                    </div>
                )}

                <TokenAmountInput
                    label="Receive"
                    tokenSymbol={receiveToken}
                    tokenLogo={receiveTokenLogo}
                    balance={receiveBalance}
                    decimals={receiveDecimals}
                    amount={receiveAmount}
                    onAmountChange={(v) => {
                        setLastEdited("receive");
                        setReceiveAmount(sanitizeInput(v, receiveDecimals));
                    }}
                    onBlur={() => setReceiveAmount(formatInputValue(receiveAmount, receiveDecimals))}
                    hint="Estimated from current route and slippage."
                    isDropdown={tradeMode === "sell"}
                    selectableTokens={selectableReceiveTokens}
                    selectedMint={selectedSellReceiveMint}
                    onSelectToken={setSelectedSellReceiveMint}
                    getOptionDecimals={getOptionDecimals}
                />
            </div>

            <SlippageSettings slippageBps={slippageBps} onSlippageChange={setSlippageBps} />

            {orderType === "market" && (
                <QuoteDisplay
                    quoteState={quoteState}
                    formattedQuote={formattedQuote}
                    lastEdited={lastEdited}
                    validationError={validation.error}
                    swapError={swapState.error}
                    swapSignature={swapState.signature}
                    onViewRoute={() => setRouteModalOpen(true)}
                />
            )}

            {orderType === "limit" && (swapState.error || swapState.signature || validation.error) && (
                <div className="mb-4 text-sm space-y-2">
                    {validation.error && <div className="text-xs text-red-400 font-semibold">✕ {validation.error}</div>}
                    {swapState.error && <div className="text-xs text-red-400 font-semibold">✕ {swapState.error}</div>}
                    {swapState.signature && (
                        <div className="text-xs text-green-400">
                            Order submitted: {swapState.signature.slice(0, 4)}...{swapState.signature.slice(-4)}
                        </div>
                    )}
                </div>
            )}

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

            <SwapButton
                tradeMode={tradeMode}
                orderType={orderType}
                tokenSymbol={token.symbol}
                payToken={payToken}
                loading={swapState.loading}
                disabled={
                    swapState.loading ||
                    (orderType === "market" && quoteState.loading) ||
                    !!validation.error ||
                    (tradeMode === "buy" && selectablePayTokens.length === 0) ||
                    (tradeMode === "sell" && selectableReceiveTokens.length === 0)
                }
                onClick={orderType === "market" ? handleSwap : handleLimitOrder}
            />

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 border-t border-gray-700 pt-3">
                <span>Powered by Jupiter API</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Connected: Solana Mainnet</span>
                </div>
            </div>

            <RouteModal
                open={routeModalOpen}
                onOpenChange={setRouteModalOpen}
                routePathTokens={quoteState.routePathTokens}
                routeDetails={quoteState.routeDetails}
            />
        </div>
    );
};
