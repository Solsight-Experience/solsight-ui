// Types for API-compatible filter system

export type SortBy = 'market_cap' | 'volume_24h' | 'txns_24h' | 'holders' | 'age' | 'price_change_24h';
export type PoolSortBy = 'liquidity' | 'volume_24h' | 'apr' | 'age' | 'fee';
export type SortOrder = 'asc' | 'desc';

// Token filter body for POST /api/tokens/filter
export interface TokenFilterRequest {
  search_query?: string;
  metrics?: {
    age_min_minutes?: number;
    age_max_minutes?: number;
    liquidity_min?: number;
    liquidity_max?: number;
    market_cap_min?: number;
    market_cap_max?: number;
    volume_24h_min?: number;
    volume_24h_max?: number;
    txns_24h_min?: number;
    txns_24h_max?: number;
    holders_min?: number;
    holders_max?: number;
    price_change_24h_min?: number;
    price_change_24h_max?: number;
  };
  audit_filters?: {
    mint_authority_disabled?: boolean;
    freeze_authority_disabled?: boolean;
    lp_burnt?: boolean;
    has_social_links?: boolean;
    min_risk_score?: number;
    max_risk_score?: number;
  };
  categories?: string[];
  holder_filters?: {
    top_10_max_percent?: number;
    insider_max_percent?: number;
  };
}

// Pool filter body for POST /api/pools/filter  
export interface PoolFilterRequest {
  search_query?: string;
  metrics?: {
    fee_min_percent?: number;
    fee_max_percent?: number;
    age_min_minutes?: number;
    age_max_minutes?: number;
    liquidity_min?: number;
    liquidity_max?: number;
    volume_24h_min?: number;
    volume_24h_max?: number;
    apr_min?: number;
    apr_max?: number;
  };
  protocols?: string[];
  tokens?: string[];
}

export interface TokenFilterResponse {
  tokens: TokenOverview[];
  total: number;
  filters_applied: object;
}

export interface PoolFilterResponse {
  pools: PoolOverview[];
  total: number;
}

export interface TokenOverview {
  address: string;
  symbol: string;
  name: string;
  logo_uri: string;
  network: 'solana';
  category: string;
  age_seconds: number;
  price: number;
  price_change_1h: number;
  price_change_24h: number;
  price_change_7d: number;
  market_cap: number;
  market_cap_change_24h: number;
  fdv: number;
  liquidity: number;
  liquidity_change_24h: number;
  volume_24h: number;
  volume_change_24h: number;
  txns_24h: {
    total: number;
    buys: number;
    sells: number;
    change_24h: number;
  };
  holders: {
    count: number;
    change_24h: number;
    unique_wallets_24h: number;
    top_10_percent: number;
    insider_percent: number;
  };
  audit: {
    mint_authority_disabled: boolean;
    freeze_authority_disabled: boolean;
    lp_burnt: boolean;
    has_social_links: boolean;
    holders_count: number;
    unique_wallets_24h: number;
    top_10_holders_percent: number;
    insider_percent: number;
    risk_score: number;
  };
  price_sparkline: number[];
}

export interface PoolOverview {
  address: string;
  protocol: string;
  base_token: {
    address: string;
    symbol: string;
    logo_uri: string;
  };
  quote_token: {
    address: string;
    symbol: string;
    logo_uri: string;
  };
  fee_percent: number;
  apr: number;
  age_seconds: number;
  liquidity: number;
  liquidity_change_24h: number;
  volume_24h: number;
  volume_change_24h: number;
  volume_7d: number;
  txns_24h: number;
  price: number;
  price_change_24h: number;
}

// UI filter state matching the form inputs
export interface FilterState {
  // Tab selection
  activeTab: 'token' | 'pool';
  
  // Search query
  searchQuery: string;
  
  // Sort state  
  sortBy: SortBy | PoolSortBy | '';
  sortOrder: SortOrder;
  
  // Token metrics filters
  tokenMetrics: {
    age_min_minutes: number | '';
    age_max_minutes: number | '';
    liquidity_min: number | '';
    liquidity_max: number | '';
    market_cap_min: number | '';
    market_cap_max: number | '';
    volume_24h_min: number | '';
    volume_24h_max: number | '';
    txns_24h_min: number | '';
    txns_24h_max: number | '';
    holders_min: number | '';
    holders_max: number | '';
    price_change_24h_min: number | '';
    price_change_24h_max: number | '';
  };
  
  // Token audit filters
  tokenAudits: {
    mint_authority_disabled: boolean | null;
    freeze_authority_disabled: boolean | null;
    lp_burnt: boolean | null;
    has_social_links: boolean | null;
    min_risk_score: number | '';
    max_risk_score: number | '';
  };
  
  // Pool metrics filters
  poolMetrics: {
    fee_min_percent: number | '';
    fee_max_percent: number | '';
    age_min_minutes: number | '';
    age_max_minutes: number | '';
    liquidity_min: number | '';
    liquidity_max: number | '';
    volume_24h_min: number | '';
    volume_24h_max: number | '';
    apr_min: number | '';
    apr_max: number | '';
  };
  
  // Categories and protocols
  categories: string[];
  protocols: string[];
  tokens: string[];
  
  // Holder filters for tokens
  holderFilters: {
    top_10_max_percent: number | '';
    insider_max_percent: number | '';
  };
}

export interface FilterActions {
  // Tab management
  setActiveTab: (tab: 'token' | 'pool') => void;
  
  // Search query
  setSearchQuery: (query: string) => void;
  
  // Sort management
  setSortBy: (sortBy: SortBy | PoolSortBy | '') => void;
  setSortOrder: (order: SortOrder) => void;
  
  // Token filter updates
  setTokenMetric: (key: keyof FilterState['tokenMetrics'], value: number | '') => void;
  setTokenAudit: (key: keyof FilterState['tokenAudits'], value: boolean | null | number | '') => void;
  setHolderFilter: (key: keyof FilterState['holderFilters'], value: number | '') => void;
  
  // Pool filter updates  
  setPoolMetric: (key: keyof FilterState['poolMetrics'], value: number | '') => void;
  
  // Array filters
  setCategories: (categories: string[]) => void;
  setProtocols: (protocols: string[]) => void;
  setTokens: (tokens: string[]) => void;
  
  // Utility actions
  resetFilters: () => void;
  
  // Convert UI state to API request format
  getTokenFilterRequest: () => TokenFilterRequest;
  getPoolFilterRequest: () => PoolFilterRequest;
}

export type FilterStore = FilterState & FilterActions;