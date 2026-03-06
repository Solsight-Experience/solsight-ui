import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTokenUIStore } from '../stores/token.stores';
import type { TokenDetail } from '../types/token.types';
import { COMMON_TOKENS } from '@/lib/constants';
import { copyToClipboard } from '../utils/token.utils';
import { Check, Copy, Loader2 } from 'lucide-react';
import { useWallet } from '@/features/wallets/hooks/useWallet';
import { toast } from 'sonner';
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
  toBaseUnits,
} from '@/features/swap';

interface TradingPanelProps {
  token: TokenDetail;
}

type PhantomProvider = {
  isPhantom?: boolean;
  signTransaction: (tx: unknown) => Promise<{ serialize(): Uint8Array }>;
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
    resetTradingPanel,
  } = useTokenUIStore();
  const { connectWallet, isConnecting, connected, publicKey } = useWallet();

  const [lastEdited, setLastEdited] = useState<'pay' | 'receive' | null>(null);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
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

  const swapConfig = useMemo(() => getSwapApiConfig(), []);
  const internalUpdateRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const payToken = tradeMode === 'buy' ? 'SOL' : token.symbol;
  const receiveToken = tradeMode === 'buy' ? token.symbol : 'SOL';
  const payTokenLogo =
    tradeMode === 'buy'
      ? 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      : token.logo_uri;
  const receiveTokenLogo =
    tradeMode === 'buy'
      ? token.logo_uri
      : 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';

  const payBalance = tradeMode === 'buy' ? '2.45' : '0.00';

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
    setSwapState({ loading: false, error: null, signature: null });
  }, [token.address, resetTradingPanel]);

  const [fetchedDecimals, setFetchedDecimals] = useState<number | null>(null);
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
  const payDecimals = tradeMode === 'buy' ? COMMON_TOKENS.SOL.decimals : resolvedTokenDecimals;
  const receiveDecimals = tradeMode === 'buy' ? resolvedTokenDecimals : COMMON_TOKENS.SOL.decimals;

  const payMint = tradeMode === 'buy' ? COMMON_TOKENS.SOL.mint : token.address;
  const receiveMint = tradeMode === 'buy' ? token.address : COMMON_TOKENS.SOL.mint;

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
  }, [lastEdited, payAmount, receiveAmount, payBalance]);

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
      return;
    }

    const swapMode = lastEdited === 'pay' ? 'ExactIn' : 'ExactOut';
    const amountBaseUnits = toBaseUnits(sourceAmount, swapMode === 'ExactIn' ? payDecimals : receiveDecimals);

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
            slippageBps,
          },
          {
            signal: controller.signal,
            config: swapConfig,
            payTokenSymbol: payToken,
            receiveTokenSymbol: receiveToken,
          }
        );

        const nextPay =
          swapMode === 'ExactOut' && result.inAmount
            ? formatInputValue(formatFromBaseUnits(result.inAmount, payDecimals), payDecimals)
            : null;
        const nextReceive =
          swapMode === 'ExactIn' && result.outAmount
            ? formatInputValue(formatFromBaseUnits(result.outAmount, receiveDecimals), receiveDecimals)
            : null;

        internalUpdateRef.current = true;
        if (nextPay !== null) setPayAmount(nextPay);
        if (nextReceive !== null) setReceiveAmount(nextReceive);

        setQuoteState({
          loading: false,
          error: null,
          priceImpactPct: result.priceImpactPct,
          otherAmountThreshold: result.otherAmountThreshold,
          routeLabel: result.routeLabel,
          routeDetails: result.routeDetails,
          routePathTokens: result.routePathTokens,
          rawQuote: result.rawQuote,
        });
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        setQuoteState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Quote failed',
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
    receiveToken,
  ]);

  const handleSwap = async () => {
    if (validation.error) {
      toast.error(validation.error);
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
      toast.success('Swap submitted!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Swap failed';
      setSwapState({ loading: false, error: message, signature: null });
      toast.error(message);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gradient-to-br">
      <div className="flex gap-2 mb-4">
        <Button
          className="flex-1"
          variant={tradeMode === 'buy' ? 'default' : 'outline'}
          onClick={() => setTradeMode('buy')}
        >
          Buy
        </Button>
        <Button
          variant={tradeMode === 'sell' ? 'default' : 'outline'}
          className="flex-1"
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
          disabled
          className={`flex-1 py-2 px-3 rounded ${
            orderType === 'limit'
              ? 'bg-gray-800 border-b-2 border-purple-500'
              : 'bg-gray-800 text-gray-400'
          }`}
          title="Limit order is not supported yet"
        >
          Limit
        </button>
      </div>

      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">{tradeMode === 'buy' ? 'From' : 'Sell'}</Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <img src={payTokenLogo} className="w-5 h-5 rounded-full" alt={payToken} />
              <span className="font-semibold">{payToken}</span>
            </div>
          </div>
          <input
            type="text"
            value={payAmount}
            onChange={(e) => {
              setLastEdited('pay');
              setPayAmount(sanitizeInput(e.target.value, payDecimals));
            }}
            placeholder="0.00"
            className="w-full bg-transparent text-base font-bold outline-none"
            onBlur={() => setPayAmount(formatInputValue(payAmount, payDecimals))}
          />
          <div className="mt-1 text-xs text-gray-500">Enter one field and the other updates from quote.</div>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">Receive</Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <img src={receiveTokenLogo} className="w-5 h-5 rounded-full" alt={receiveToken} />
              <span className="font-semibold">{receiveToken}</span>
            </div>
          </div>
          <input
            type="text"
            value={receiveAmount}
            onChange={(e) => {
              setLastEdited('receive');
              setReceiveAmount(sanitizeInput(e.target.value, receiveDecimals));
            }}
            placeholder="0.00"
            className="w-full bg-transparent text-base font-bold outline-none"
            onBlur={() => setReceiveAmount(formatInputValue(receiveAmount, receiveDecimals))}
          />
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">Slippage</Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50 flex items-center gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={slippageBps}
            onChange={(e) => setSlippageBps(Number(e.target.value))}
            className="w-full bg-transparent text-base font-bold outline-none"
          />
          <span className="text-sm text-gray-400">bps</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">Example: 50 bps = 0.5%</div>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        <div className="flex items-center justify-between">
          <span>Price Impact</span>
          <span>
            {quoteState.priceImpactPct === null ? '--' : `${(quoteState.priceImpactPct * 100).toFixed(2)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>{lastEdited === 'receive' ? 'Maximum Paid' : 'Minimum Received'}</span>
          <span>{formattedQuote}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Route</span>
          <span className="flex items-center gap-2">
            <span>{quoteState.routeLabel ?? '--'}</span>
            {quoteState.routePathTokens.length > 0 && (
              <button
                type="button"
                onClick={() => setRouteModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                View route details
              </button>
            )}
          </span>
        </div>
        {quoteState.routeDetails.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">{quoteState.routeDetails.join(' -> ')}</div>
        )}
        {quoteState.loading && <div className="mt-2 text-xs text-gray-500">Fetching quote...</div>}
        {quoteState.error && <div className="mt-2 text-xs text-red-400">{quoteState.error}</div>}
        {validation.error && <div className="mt-2 text-xs text-red-400">{validation.error}</div>}
        {swapState.error && <div className="mt-2 text-xs text-red-400">{swapState.error}</div>}
        {swapState.signature && (
          <div className="mt-2 text-xs text-green-400">Swap submitted: {swapState.signature.slice(0, 4)}...{swapState.signature.slice(-4)}</div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {['0.1', '0.5', '1', 'MAX'].map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setLastEdited('pay');
              setPayAmount(amount === 'MAX' ? payBalance : amount);
            }}
            className="flex-1 py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-sm"
          >
            {amount}
          </button>
        ))}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-6 text-lg"
        onClick={handleSwap}
        disabled={swapState.loading || quoteState.loading || !!validation.error}
      >
        {swapState.loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Swapping...
          </span>
        ) : (
          <>
            {tradeMode.toUpperCase()} {tradeMode === 'buy' ? token.symbol : payToken}
          </>
        )}
      </Button>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>Powered by Jupiter API</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Connected: Solana Mainnet</span>
        </div>
      </div>

      <Dialog open={routeModalOpen} onOpenChange={setRouteModalOpen}>
        <DialogContent className="sm:max-w-lg border-gray-700 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-lg text-white">Route details</DialogTitle>
            <DialogDescription className="text-gray-400">Token hops and DEX path for this quote.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-200">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Token hops</div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {quoteState.routePathTokens.length === 0 ? (
                  <span>--</span>
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
                            window.setTimeout(
                              () =>
                                setCopiedMint((prev) =>
                                  prev === routeToken.full ? null : prev
                                ),
                              1500
                            );
                          }
                        }}
                        className="flex items-center gap-1 rounded bg-gray-800 px-2 py-0.5 text-left hover:bg-gray-700"
                        title={routeToken.full ?? routeToken.display}
                      >
                        <span>{routeToken.display}</span>
                        {routeToken.full && copiedMint === routeToken.full ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-500" />
                        )}
                      </button>
                      {index < quoteState.routePathTokens.length - 1 && (
                        <span className="text-gray-500">-&gt;</span>
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">DEX path</div>
              <div className="mt-1">
                {quoteState.routeDetails.length > 0 ? quoteState.routeDetails.join(' -> ') : '--'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-600 text-gray-200">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
