import { Connection, SendTransactionError, VersionedTransaction, clusterApiUrl } from '@solana/web3.js';
import type { ExecuteSwapRequest, ExecuteSwapResult, QuoteRequest, QuoteResult, SwapApiConfig } from './types';
import { buildRoutePathTokens, getRouteDetails } from './utils';

const DEFAULT_QUOTE_URL = 'https://api.jup.ag/swap/v1/quote';
const DEFAULT_SWAP_URL = 'https://api.jup.ag/swap/v1/swap';
const DEFAULT_RPC_FALLBACKS = ['https://rpc.ankr.com/solana', 'https://solana-rpc.publicnode.com'];

export function getSwapApiConfig(): SwapApiConfig {
  return {
    quoteBaseUrl: process.env.NEXT_PUBLIC_JUPITER_QUOTE_URL ?? DEFAULT_QUOTE_URL,
    swapBaseUrl: process.env.NEXT_PUBLIC_JUPITER_SWAP_URL ?? DEFAULT_SWAP_URL,
    quoteApiKey: process.env.NEXT_PUBLIC_JUPITER_API_KEY,
  };
}

export async function fetchJupiterQuote(
  request: QuoteRequest,
  opts?: {
    signal?: AbortSignal;
    config?: SwapApiConfig;
    payTokenSymbol?: string;
    receiveTokenSymbol?: string;
  }
): Promise<QuoteResult> {
  const config = opts?.config ?? getSwapApiConfig();

  const params = new URLSearchParams({
    inputMint: request.inputMint,
    outputMint: request.outputMint,
    amount: request.amount,
    swapMode: request.swapMode,
    slippageBps: String(request.slippageBps),
  });

  const response = await fetch(`${config.quoteBaseUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(config.quoteApiKey ? { 'x-api-key': config.quoteApiKey } : {}),
    },
    signal: opts?.signal,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(mapQuoteError(payload));
  }

  const routeDetails = getRouteDetails(payload.routePlan);
  const routePlanLength = Array.isArray(payload.routePlan) ? payload.routePlan.length : 0;

  return {
    rawQuote: payload,
    priceImpactPct: payload.priceImpactPct ? Number(payload.priceImpactPct) : null,
    otherAmountThreshold: payload.otherAmountThreshold ? String(payload.otherAmountThreshold) : null,
    routeLabel: routePlanLength ? `${routePlanLength} hops` : '--',
    routeDetails,
    routePathTokens: buildRoutePathTokens(
      payload.routePlan,
      request.inputMint,
      request.outputMint,
      opts?.payTokenSymbol ?? 'SOL',
      opts?.receiveTokenSymbol ?? 'TOKEN'
    ),
    inAmount: payload.inAmount ? String(payload.inAmount) : null,
    outAmount: payload.outAmount ? String(payload.outAmount) : null,
  };
}

export async function executeJupiterSwap(
  request: ExecuteSwapRequest,
  opts?: { config?: SwapApiConfig }
): Promise<ExecuteSwapResult> {
  const config = opts?.config ?? getSwapApiConfig();

  const response = await fetch(config.swapBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.quoteApiKey ? { 'x-api-key': config.quoteApiKey } : {}),
    },
    body: JSON.stringify({
      quoteResponse: request.quoteResponse,
      userPublicKey: request.userPublicKey,
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
  const signed = await request.signTransaction(tx);
  const serializedTx = signed.serialize();

  const rpcCandidates = getRpcCandidates(getSolanaRpcUrl(config.swapBaseUrl, config.quoteBaseUrl));

  let lastTriedConnection: Connection | null = null;
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
        throw await withSwapErrorContext(error, config.swapBaseUrl, config.quoteBaseUrl, lastTriedConnection);
      }
    }
  }

  if (!signature) {
    throw await withSwapErrorContext(
      sendError ?? new Error('Swap failed'),
      config.swapBaseUrl,
      config.quoteBaseUrl,
      lastTriedConnection
    );
  }

  return { signature };
}

export function mapQuoteError(payload: unknown): string {
  const normalizedPayload = payload as { errorCode?: string; error?: string } | undefined;
  const code = normalizedPayload?.errorCode;
  if (code === 'TOKEN_NOT_TRADABLE') {
    return 'This token is not tradable on Jupiter.';
  }
  if (normalizedPayload?.error) {
    return String(normalizedPayload.error);
  }
  return 'Quote failed. Please try again.';
}

export function mapSwapError(message: string, swapUrl: string, quoteUrl: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('access forbidden') ||
    normalized.includes('"code": 403') ||
    normalized.includes('code: 403')
  ) {
    return 'Swap failed: RPC endpoint rejected the request (403). Set NEXT_PUBLIC_SOLANA_RPC_URL to a valid mainnet RPC endpoint (with API key if required).';
  }

  if (normalized.includes("address table account that doesn't exist")) {
    const endpoint = isPublicJupiterApi(swapUrl) || isPublicJupiterApi(quoteUrl) ? 'Jupiter mainnet API' : 'current swap API';
    return `Swap failed: RPC network mismatch for ${endpoint}. Please use Solana mainnet RPC (or set NEXT_PUBLIC_SOLANA_RPC_URL to a mainnet endpoint).`;
  }

  return message;
}

function getSolanaRpcUrl(swapUrl: string, quoteUrl: string): string {
  const explicitRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  if (explicitRpc) return explicitRpc;

  if (isPublicJupiterApi(swapUrl) || isPublicJupiterApi(quoteUrl)) {
    return clusterApiUrl('mainnet-beta');
  }

  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet').toLowerCase();
  if (network.includes('devnet')) return clusterApiUrl('devnet');
  if (network.includes('testnet')) return clusterApiUrl('testnet');
  return clusterApiUrl('mainnet-beta');
}

function getRpcCandidates(preferredRpcUrl: string): string[] {
  const configuredFallbacks =
    process.env.NEXT_PUBLIC_SOLANA_RPC_FALLBACK_URLS
      ?.split(',')
      .map((url) => url.trim())
      .filter(Boolean) ?? [];

  return [...new Set([preferredRpcUrl, ...configuredFallbacks, ...DEFAULT_RPC_FALLBACKS])];
}

function isPublicJupiterApi(url: string): boolean {
  return url.toLowerCase().includes('jup.ag');
}

function isAccessForbiddenError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('access forbidden') || message.includes('"code": 403') || message.includes('code: 403');
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function withSwapErrorContext(
  error: unknown,
  swapUrl: string,
  quoteUrl: string,
  connection: Connection | null
): Promise<never> {
  let message = error instanceof Error ? error.message : 'Swap failed';

  if (error instanceof SendTransactionError && connection) {
    try {
      const logs = await error.getLogs(connection);
      if (logs?.length) {
        message = `${message}\n${logs.slice(-6).join('\n')}`;
      }
    } catch {
      // ignore log fetch failures
    }
  }

  throw new Error(mapSwapError(message, swapUrl, quoteUrl));
}
