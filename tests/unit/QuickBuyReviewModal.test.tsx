import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickBuyReviewModal } from '@/features/token-table/components/QuickBuyReviewModal';

const {
  mockConnectWallet,
  mockGetTokenDetail,
  mockFetchJupiterQuote,
  mockExecuteJupiterSwap,
} = vi.hoisted(() => ({
  mockConnectWallet: vi.fn(),
  mockGetTokenDetail: vi.fn(),
  mockFetchJupiterQuote: vi.fn(),
  mockExecuteJupiterSwap: vi.fn(),
}));

vi.mock('@/features/wallets/hooks/useWallet', () => ({
  useWallet: () => ({
    connectWallet: mockConnectWallet,
    isConnecting: false,
    connected: false,
    publicKey: null,
  }),
}));

vi.mock('@/features/token/services/token.services', () => ({
  tokenApi: {
    getTokenDetail: mockGetTokenDetail,
  },
}));

vi.mock('@/features/swap', async () => {
  const actual = await vi.importActual<typeof import('@/features/swap')>('@/features/swap');
  return {
    ...actual,
    fetchJupiterQuote: mockFetchJupiterQuote,
    executeJupiterSwap: mockExecuteJupiterSwap,
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <QuickBuyReviewModal
        open={true}
        onOpenChange={() => {}}
        token={{
          id: 'token-address-123',
          token: {
            iconUrl: '/icons/sol.png',
            ticker: 'ABC',
            name: 'ABC Token',
            priceHistory: [],
            category: 'MEME',
            age: '1d',
          },
          marketCap: {
            value: 10,
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 1,
          },
          liquidity: 100,
          volume24h: 100,
          transactions: { buyCount: 1, sellCount: 1, buyVolumn: 1, sellVolumn: 1 },
          audit: [],
        }}
        amountSol="0.1"
      />
    </QueryClientProvider>
  );
}

describe('QuickBuyReviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTokenDetail.mockResolvedValue({ decimals: 6 });
    mockFetchJupiterQuote.mockResolvedValue({
      rawQuote: { mock: true },
      priceImpactPct: 0.001,
      otherAmountThreshold: '1000000',
      routeLabel: '1 hops',
      routeDetails: ['Raydium'],
      routePathTokens: [{ display: 'SOL' }, { display: 'ABC' }],
      inAmount: '100000000',
      outAmount: '1250000',
    });
  });

  it('renders selected token and amount', async () => {
    renderModal();

    expect(screen.getByText('Quick Buy Review')).toBeInTheDocument();
    expect(screen.getByText('ABC Token')).toBeInTheDocument();
    expect(screen.getByText('0.1 SOL')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetchJupiterQuote).toHaveBeenCalled();
    });
  });

  it('disables confirm button when quote fails', async () => {
    mockFetchJupiterQuote.mockRejectedValueOnce(new Error('Quote failed.'));
    renderModal();

    await waitFor(() => {
      expect(screen.getByText('Quote failed.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Confirm Buy' })).toBeDisabled();
  });

  it('requests wallet connect when confirming while disconnected', async () => {
    renderModal();

    await waitFor(() => {
      expect(mockFetchJupiterQuote).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Buy' }));
    expect(mockConnectWallet).toHaveBeenCalledTimes(1);
    expect(mockExecuteJupiterSwap).not.toHaveBeenCalled();
  });
});
