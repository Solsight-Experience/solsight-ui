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
import { Connection, SendTransactionError, VersionedTransaction, clusterApiUrl } from '@solana/web3.js';

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
    rawQuote: any | null;
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

  const internalUpdateRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // Dynamic token values based on trade mode
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
  // const receiveBalance = tradeMode === 'buy' ? '0.00' : '2.45';

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

  // code: fix tạm - fetch decimals từ Jupiter token list vì backend chưa trả về field decimals
  const [fetchedDecimals, setFetchedDecimals] = useState<number | null>(null);
  useEffect(() => {
    if (token.decimals != null) return;
    fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${token.address}`)
      .then(r => r.json())
      .then((data: Array<{ id: string; decimals: number }>) => {
        const found = Array.isArray(data) ? data.find(t => t.id === token.address) : null;
        if (found && typeof found.decimals === 'number') setFetchedDecimals(found.decimals);
      })
      .catch(() => {});
  }, [token.address, token.decimals]);
  const resolvedTokenDecimals = token.decimals ?? fetchedDecimals ?? 9;
  // end code

  // const payDecimals = tradeMode === 'buy' ? COMMON_TOKENS.SOL.decimals : token.decimals ?? 9;
  // const receiveDecimals = tradeMode === 'buy' ? token.decimals ?? 9 : COMMON_TOKENS.SOL.decimals;
  const payDecimals = tradeMode === 'buy' ? COMMON_TOKENS.SOL.decimals : resolvedTokenDecimals;
  const receiveDecimals = tradeMode === 'buy' ? resolvedTokenDecimals : COMMON_TOKENS.SOL.decimals;

  const payMint = tradeMode === 'buy' ? COMMON_TOKENS.SOL.mint : token.address;
  const receiveMint = tradeMode === 'buy' ? token.address : COMMON_TOKENS.SOL.mint;

  const quoteBaseUrl =
    process.env.NEXT_PUBLIC_JUPITER_QUOTE_URL ?? 'https://api.jup.ag/swap/v1/quote';
  const quoteApiKey = process.env.NEXT_PUBLIC_JUPITER_API_KEY;
  const swapBaseUrl =
    process.env.NEXT_PUBLIC_JUPITER_SWAP_URL ?? 'https://api.jup.ag/swap/v1/swap';

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
    const amountBaseUnits = toBaseUnits(
      sourceAmount,
      swapMode === 'ExactIn' ? payDecimals : receiveDecimals
    );

    if (!amountBaseUnits) {
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(async () => {
      setQuoteState((prev) => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        inputMint: payMint,
        outputMint: receiveMint,
        amount: amountBaseUnits,
        swapMode,
        slippageBps: String(slippageBps),
      });

      try {
        const response = await fetch(`${quoteBaseUrl}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(quoteApiKey ? { 'x-api-key': quoteApiKey } : {}),
          },
          signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok) {
          const message = mapQuoteError(data);
          throw new Error(message);
        }
        const nextPay =
          swapMode === 'ExactOut'
            ? formatInputValue(formatFromBaseUnits(String(data.inAmount ?? ''), payDecimals), payDecimals)
            : null;
        const nextReceive =
          swapMode === 'ExactIn'
            ? formatInputValue(formatFromBaseUnits(String(data.outAmount ?? ''), receiveDecimals), receiveDecimals)
            : null;

        internalUpdateRef.current = true;
        if (nextPay !== null) {
          setPayAmount(nextPay);
        }
        if (nextReceive !== null) {
          setReceiveAmount(nextReceive);
        }

        const routeDetails: string[] = Array.isArray(data.routePlan)
          ? data.routePlan
              .map(
                (item: { swapInfo?: { label?: string; ammKey?: string; programId?: string } }) =>
                  item?.swapInfo?.label || item?.swapInfo?.ammKey || item?.swapInfo?.programId
              )
              .filter((label: unknown): label is string => typeof label === 'string' && label.trim().length > 0)
              .map((label: string) => label.trim())
          : [];
        const uniqueRouteDetails: string[] = [...new Set(routeDetails)];
        const routeCount = Array.isArray(data.routePlan) ? data.routePlan.length : 0;
        const routePathTokens = buildRoutePathTokens(
          data.routePlan,
          payMint,
          receiveMint,
          payToken,
          receiveToken
        );

        setQuoteState({
          loading: false,
          error: null,
          priceImpactPct: data.priceImpactPct ? Number(data.priceImpactPct) : null,
          otherAmountThreshold: data.otherAmountThreshold ? String(data.otherAmountThreshold) : null,
          routeLabel: routeCount ? `${routeCount} hops` : '--',
          routeDetails: uniqueRouteDetails,
          routePathTokens,
          rawQuote: data,
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
    quoteBaseUrl,
    quoteApiKey,
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

    const provider = (window as any).solana;
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

    const preferredRpcUrl = getSolanaRpcUrl(swapBaseUrl, quoteBaseUrl);
    const rpcCandidates = getRpcCandidates(preferredRpcUrl);

    let lastTriedConnection: Connection | null = null;

    try {
      const response = await fetch(swapBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(quoteApiKey ? { 'x-api-key': quoteApiKey } : {}),
        },
        body: JSON.stringify({
          quoteResponse: quoteState.rawQuote,
          userPublicKey: publicKey,
          wrapAndUnwrapSol: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(mapQuoteError(data));
      }

      const swapTx = data?.swapTransaction as string | undefined;
      if (!swapTx) {
        throw new Error('Missing swap transaction.');
      }

      const tx = VersionedTransaction.deserialize(base64ToBytes(swapTx));
      const signed = await provider.signTransaction(tx);
      const serializedTx = signed.serialize();

      let signature: string | null = null;
      let sendError: unknown = null;
      for (const rpcUrl of rpcCandidates) {
        const connection = new Connection(rpcUrl, 'confirmed');
        lastTriedConnection = connection;
        try {
          signature = await connection.sendRawTransaction(serializedTx, {
            skipPreflight: false,
            maxRetries: 3,
          });
          await connection.confirmTransaction(signature, 'confirmed');
          break;
        } catch (error) {
          sendError = error;
          if (!isAccessForbiddenError(error)) {
            throw error;
          }
        }
      }

      if (!signature) {
        throw sendError ?? new Error('Swap failed');
      }

      setSwapState({ loading: false, error: null, signature });
      toast.success('Swap submitted!');
    } catch (error) {
      let message = error instanceof Error ? error.message : 'Swap failed';
      if (error instanceof SendTransactionError) {
        try {
          if (lastTriedConnection) {
            const logs = await error.getLogs(lastTriedConnection);
            if (logs?.length) {
              message = `${message}\n${logs.slice(-6).join('\n')}`;
            }
          }
        } catch {
          // Ignore log fetch failures and keep the original message.
        }
      }
      message = mapSwapError(message, swapBaseUrl, quoteBaseUrl);
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

      {/* Pay Section */}
      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">
          {tradeMode === 'buy' ? 'From' : 'Sell'}
        </Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <img src={payTokenLogo} className="w-5 h-5 rounded-full" alt={payToken} />
              <span className="font-semibold">{payToken}</span>
            </div>
            {/* <span className="text-xs text-gray-400">Balance: {payBalance}</span> */}
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
          <div className="mt-1 text-xs text-gray-500">
            Enter one field and the other updates from quote.
          </div>
        </div>
      </div>

      {/* Receive Section */}
      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">Receive</Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <img src={receiveTokenLogo} className="w-5 h-5 rounded-full" alt={receiveToken} />
              <span className="font-semibold">{receiveToken}</span>
            </div>
            {/* <span className="text-xs text-gray-400">Balance: {receiveBalance}</span> */}
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

      {/* Slippage */}
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

      {/* Quote Summary */}
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
          <div className="mt-2 text-xs text-gray-500">
            {quoteState.routeDetails.join(' -> ')}
          </div>
        )}
        {quoteState.loading && <div className="mt-2 text-xs text-gray-500">Fetching quote...</div>}
        {quoteState.error && <div className="mt-2 text-xs text-red-400">{quoteState.error}</div>}
        {validation.error && <div className="mt-2 text-xs text-red-400">{validation.error}</div>}
        {swapState.error && <div className="mt-2 text-xs text-red-400">{swapState.error}</div>}
        {swapState.signature && (
          <div className="mt-2 text-xs text-green-400">Swap submitted: {shortenMint(swapState.signature)}</div>
        )}
      </div>

      {/* Quick Amount Buttons */}
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

      {/* Buy/Sell Button */}
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
            <DialogDescription className="text-gray-400">
              Token hops and DEX path for this quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-200">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Token hops</div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {quoteState.routePathTokens.length === 0 ? (
                  <span>--</span>
                ) : (
                  quoteState.routePathTokens.map((token, index) => (
                    <React.Fragment key={`${token.display}-${index}`}>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!token.full) return;
                          const success = await copyToClipboard(token.full);
                          if (success) {
                            setCopiedMint(token.full);
                            window.setTimeout(() => setCopiedMint((prev) => (prev === token.full ? null : prev)), 1500);
                          }
                        }}
                        className="flex items-center gap-1 rounded bg-gray-800 px-2 py-0.5 text-left hover:bg-gray-700"
                        title={token.full ?? token.display}
                      >
                        <span>{token.display}</span>
                        {token.full && copiedMint === token.full ? (
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

function isValidAmount(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && numeric > 0;
}

function sanitizeInput(value: string, decimals: number): string {
  const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  const whole = parts[0] ?? '';
  const fraction = parts[1] ?? '';
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '');
  if (parts.length === 1) {
    return normalizedWhole;
  }
  const clippedFraction = fraction.slice(0, decimals);
  return `${normalizedWhole || '0'}.${clippedFraction}`;
}

function formatInputValue(value: string, decimals: number): string {
  if (!value) return '';
  const numeric = Number(value.replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return '';
  const maxDecimals = Math.min(decimals, 6);
  const normalized = numeric.toFixed(maxDecimals).replace(/\.?0+$/, '');
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDecimals,
  }).format(Number(normalized));
}

function formatDisplay(value: string, decimals: number): string {
  if (!value) return '--';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '--';
  const maxDecimals = Math.min(decimals, 6);
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDecimals,
  }).format(numeric);
}

function toBaseUnits(value: string, decimals: number): string | null {
  const normalized = value.replace(/,/g, '').trim();
  if (!/^\d*\.?\d*$/.test(normalized)) return null;
  if (normalized === '' || normalized === '.') return null;

  const [whole, fraction = ''] = normalized.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  const combined = `${whole || '0'}${paddedFraction}`;
  const trimmed = combined.replace(/^0+/, '') || '0';
  return trimmed;
}

function formatFromBaseUnits(value: string, decimals: number): string {
  if (!value) return '';
  const padded = value.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals);
  const fraction = padded.slice(-decimals).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

function parseInputNumber(value: string): number {
  if (!value) return 0;
  const normalized = value.replace(/,/g, '');
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}

function mapQuoteError(payload: any): string {
  const code = payload?.errorCode;
  if (code === 'TOKEN_NOT_TRADABLE') {
    return 'This token is not tradable on Jupiter.';
  }
  if (payload?.error) {
    return String(payload.error);
  }
  return 'Quote failed. Please try again.';
}

function getSolanaRpcUrl(swapUrl: string, quoteUrl: string): string {
  const explicitRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  if (explicitRpc) return explicitRpc;

  // Jupiter public APIs are mainnet-only; forcing mainnet RPC avoids ALT-not-found errors
  // when app network env is set to devnet/testnet.
  if (isPublicJupiterApi(swapUrl) || isPublicJupiterApi(quoteUrl)) {
    return clusterApiUrl('mainnet-beta');
  }

  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet').toLowerCase();
  if (network.includes('devnet')) return clusterApiUrl('devnet');
  if (network.includes('testnet')) return clusterApiUrl('testnet');
  return clusterApiUrl('mainnet-beta');
}

function isPublicJupiterApi(url: string): boolean {
  return url.toLowerCase().includes('jup.ag');
}

function getRpcCandidates(preferredRpcUrl: string): string[] {
  const configuredFallbacks =
    process.env.NEXT_PUBLIC_SOLANA_RPC_FALLBACK_URLS
      ?.split(',')
      .map((url) => url.trim())
      .filter(Boolean) ?? [];
  const defaultFallbacks = ['https://rpc.ankr.com/solana', 'https://solana-rpc.publicnode.com'];

  return [...new Set([preferredRpcUrl, ...configuredFallbacks, ...defaultFallbacks])];
}

function isAccessForbiddenError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('access forbidden') || message.includes('"code": 403') || message.includes('code: 403');
}

function mapSwapError(message: string, swapUrl: string, quoteUrl: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('access forbidden') || normalized.includes('"code": 403') || normalized.includes('code: 403')) {
    return 'Swap failed: RPC endpoint rejected the request (403). Set NEXT_PUBLIC_SOLANA_RPC_URL to a valid mainnet RPC endpoint (with API key if required).';
  }
  if (normalized.includes("address table account that doesn't exist")) {
    const endpoint = isPublicJupiterApi(swapUrl) || isPublicJupiterApi(quoteUrl) ? 'Jupiter mainnet API' : 'current swap API';
    return `Swap failed: RPC network mismatch for ${endpoint}. Please use Solana mainnet RPC (or set NEXT_PUBLIC_SOLANA_RPC_URL to a mainnet endpoint).`;
  }
  return message;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function buildRoutePathTokens(
  routePlan: any,
  inputMint: string,
  outputMint: string,
  payTokenSymbol: string,
  receiveTokenSymbol: string
): Array<{ display: string; full?: string }> {
  if (!Array.isArray(routePlan) || routePlan.length === 0) return [];
  const tokens: Array<{ display: string; full?: string }> = [];
  for (const step of routePlan) {
    const input = step?.swapInfo?.inputMint;
    const output = step?.swapInfo?.outputMint;
    if (input) tokens.push(mapMintToToken(input, inputMint, outputMint, payTokenSymbol, receiveTokenSymbol));
    if (output) tokens.push(mapMintToToken(output, inputMint, outputMint, payTokenSymbol, receiveTokenSymbol));
  }
  const cleaned = tokens.filter(Boolean);
  const path = cleaned.filter((item, idx) => item.display !== cleaned[idx - 1]?.display);
  return path;
}

function mapMintToToken(
  mint: string,
  inputMint: string,
  outputMint: string,
  payTokenSymbol: string,
  receiveTokenSymbol: string
): { display: string; full?: string } {
  if (mint === inputMint) return { display: payTokenSymbol, full: mint };
  if (mint === outputMint) return { display: receiveTokenSymbol, full: mint };
  if (mint === COMMON_TOKENS.SOL.mint) return { display: 'SOL', full: mint };
  return { display: shortenMint(mint), full: mint };
}

function shortenMint(mint: string): string {
  if (mint.length <= 8) return mint;
  return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
}
