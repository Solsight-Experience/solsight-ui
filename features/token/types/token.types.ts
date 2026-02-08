import { CandlestickData } from 'lightweight-charts';

// Token Detail Types
export interface TokenDetail {
  address: string;
  symbol: string;
  name: string;
  logo_uri: string;
  network: 'solana';
  description: string;
  website: string;
  social_links: {
    twitter: string | null;
    telegram: string | null;
    discord: string | null;
  };
  total_supply: number;
  circulating_supply: number;
  max_supply: number | null;
  price: number;
  price_change: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
  };
  market_cap: number;
  market_cap_change_24h: number;
  fdv: number;
  liquidity: number;
  liquidity_change_24h: number;
  volume: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
  };
  volume_change_24h: number;
  txns: {
    '1h': { total: number; buys: number; sells: number };
    '24h': { total: number; buys: number; sells: number };
    '7d': { total: number; buys: number; sells: number };
  };
  txns_change_24h: number;
  holders: {
    count: number;
    change_24h: number;
    unique_wallets_24h: number;
    top_10_percent: number;
    top_20_percent: number;
    insider_percent: number;
  };
  audit: {
    mint_authority: {
      disabled: boolean;
      address: string | null;
    };
    freeze_authority: {
      disabled: boolean;
      address: string | null;
    };
    lp_burnt_percent: number;
    has_social_links: boolean;
    is_verified: boolean;
    risk_score: number;
    risk_factors: string[];
  };
}

// Chart Types
export interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface ChartData {
  interval: string;
  points: CandlestickData[];
}

// Trade Types
export interface Trade {
  token?: string;
  tx_hash: string;
  timestamp: number;
  type: 'BUY' | 'SELL';
  amount_token: number;
  amount_sol: number;
  price: number;
  price_usd: number;
  market_cap: number;
  trader_address: string;
  tx_url: string;
}

export interface TradesResponse {
  trades: Trade[];
  total: number;
}

export interface TradeStreamResponse {
  token: string;
  trades: Trade[];
}

// Top Trader Types
export interface TopTrader {
  address: string;
  name: string | null;
  total_pnl: number;
  roi_percent: number;
  total_bought: number;
  total_sold: number;
  win_rate: number;
  trades_count: number;
}

export interface TopTradersResponse {
  traders: TopTrader[];
}

// Holder Types
export interface Holder {
  address: string;
  name: string | null;
  balance: number;
  balance_percent: number;
  avg_buy_price: number;
  total_bought: number;
  total_sold: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
  roi_percent: number;
  first_tx_time: number;
  last_tx_time: number;
  tx_count: number;
}

export interface HoldersResponse {
  holders: Holder[];
  total: number;
  summary: {
    total_holders: number;
    top_10_holding_percent: number;
    top_20_holding_percent: number;
  };
}

// Swap Types
export interface SwapPreviewRequest {
  amount_in: number;
  token_in: string;
  token_out: string;
  slippage_percent: number;
}

export interface SwapPreviewResponse {
  amount_out: number;
  price_impact: number;
  minimum_received: number;
  route: Array<{
    pool_address: string;
    protocol: string;
    from_token: string;
    to_token: string;
    fee_percent: number;
  }>;
  estimated_fee: number;
}

// Trading Panel Types
export type TradeMode = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
