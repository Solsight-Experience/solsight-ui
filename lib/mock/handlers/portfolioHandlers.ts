import type MockAdapter from 'axios-mock-adapter';
import { PORTFOLIO_ENDPOINTS } from '@/lib/constants';
import { mockWallets, mockActivities, mockPnlChartData } from '../data/portfolioData';

export function setupPortfolioMocks(mock: MockAdapter) {
  const totalBalanceSol = mockWallets.reduce((sum, w) => sum + w.balance_sol, 0);
  const totalBalanceUsd = mockWallets.reduce((sum, w) => sum + w.balance_usd, 0);

  // GET: Wallets
  mock.onGet(PORTFOLIO_ENDPOINTS.WALLETS).reply(200, {
    wallets: mockWallets,
    total_wallets: mockWallets.length,
    total_balance_sol: totalBalanceSol,
    total_balance_usd: totalBalanceUsd,
  });

  // GET: Overview
  mock.onGet(PORTFOLIO_ENDPOINTS.OVERVIEW).reply(200, {
    total_balance_usd: 3578.5,
    total_balance_sol: 16.4696,
    balance_change_24h: 2.5,
    pnl: {
      total: 230.04,
      realized: 34.84,
      unrealized: 195.2,
      change_24h: 5.2,
      roi_percent: 7.67,
    },
    transactions: {
      total: 252,
      buys: 114,
      sells: 138,
      transfers: 0,
      last_24h: 12,
    },
    top_tokens: [
      {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        logo_uri:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        balance: 16.4696,
        value_usd: 2478.36,
        percent_of_portfolio: 69.3,
        pnl: 141.24,
        price_change_24h: 3.2,
      },
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        logo_uri:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        balance: 450.25,
        value_usd: 450.25,
        percent_of_portfolio: 12.6,
        pnl: 0,
        price_change_24h: 0,
      },
      {
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        symbol: 'JUP',
        name: 'Jupiter',
        logo_uri: 'https://static.jup.ag/jup/icon.png',
        balance: 125.5,
        value_usd: 94.13,
        percent_of_portfolio: 2.6,
        pnl: 14.01,
        price_change_24h: 5.8,
      },
    ],
    allocation: [
      { symbol: 'SOL', value_usd: 2478.36, percent: 69.3 },
      { symbol: 'USDC', value_usd: 450.25, percent: 12.6 },
      { symbol: 'Others', value_usd: 649.89, percent: 18.1 },
    ],
  });

  // GET: Positions
  mock.onGet(PORTFOLIO_ENDPOINTS.POSITIONS).reply((config) => {
    const walletAddress = config.params?.wallet_address;
    if (!walletAddress) return [400, { error: 'wallet_address is required' }];

    const wallet = mockWallets.find((w) => w.address === walletAddress);
    if (!wallet) return [404, { error: 'Wallet not found' }];

    return [
      200,
      {
        positions: wallet.positions,
        summary: wallet.summary,
      },
    ];
  });

  // GET: Activities
  mock.onGet(PORTFOLIO_ENDPOINTS.ACTIVITIES).reply(200, {
    activities: mockActivities,
    total: mockActivities.length,
    summary: {
      total_volume_usd: 21.74,
      total_fees_usd: 0.007,
    },
  });

  // GET: PNL Chart
  mock.onGet(PORTFOLIO_ENDPOINTS.PNL_CHART).reply(200, {
    chart_data: mockPnlChartData,
  });
}
