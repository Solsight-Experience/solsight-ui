import { create } from 'zustand';
import type { FilterStore, TokenFilterRequest, PoolFilterRequest, FilterState } from '@/types/filter';

const initialState: FilterState = {
  activeTab: 'token' as const,
  searchQuery: '',
  sortBy: '' as const,
  sortOrder: 'desc' as const,
  tokenMetrics: {
    age_min_minutes: '' as const,
    age_max_minutes: '' as const,
    liquidity_min: '' as const,
    liquidity_max: '' as const,
    market_cap_min: '' as const,
    market_cap_max: '' as const,
    volume_24h_min: '' as const,
    volume_24h_max: '' as const,
    txns_24h_min: '' as const,
    txns_24h_max: '' as const,
    holders_min: '' as const,
    holders_max: '' as const,
    price_change_24h_min: '' as const,
    price_change_24h_max: '' as const,
  },
  tokenAudits: {
    mint_authority_disabled: null,
    freeze_authority_disabled: null,
    lp_burnt: null,
    has_social_links: null,
    min_risk_score: '' as const,
    max_risk_score: '' as const,
  },
  poolMetrics: {
    fee_min_percent: '' as const,
    fee_max_percent: '' as const,
    age_min_minutes: '' as const,
    age_max_minutes: '' as const,
    liquidity_min: '' as const,
    liquidity_max: '' as const,
    volume_24h_min: '' as const,
    volume_24h_max: '' as const,
    apr_min: '' as const,
    apr_max: '' as const,
  },
  categories: [] as string[],
  protocols: [] as string[],
  tokens: [] as string[],
  holderFilters: {
    top_10_max_percent: '' as const,
    insider_max_percent: '' as const,
  },
};

/**
 * Enhanced filter store for token/pool filtering with API integration
 */
export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,

  // Tab management
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Search query
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Sort management  
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),

  // Token filter updates
  setTokenMetric: (key, value) =>
    set((state) => ({
      tokenMetrics: { ...state.tokenMetrics, [key]: value },
    })),

  setTokenAudit: (key, value) =>
    set((state) => ({
      tokenAudits: { ...state.tokenAudits, [key]: value },
    })),

  setHolderFilter: (key, value) =>
    set((state) => ({
      holderFilters: { ...state.holderFilters, [key]: value },
    })),

  // Pool filter updates
  setPoolMetric: (key, value) =>
    set((state) => ({
      poolMetrics: { ...state.poolMetrics, [key]: value },
    })),

  // Array filters
  setCategories: (categories) => set({ categories }),
  setProtocols: (protocols) => set({ protocols }),
  setTokens: (tokens) => set({ tokens }),

  // Reset all filters
  resetFilters: () => set((state) => ({ ...state, ...initialState })),

  // Convert UI state to API request format for tokens
  getTokenFilterRequest: (): TokenFilterRequest => {
    const state = get();
    const request: TokenFilterRequest = {};

    if (state.searchQuery.trim()) {
      request.search_query = state.searchQuery.trim();
    }

    // Build metrics object if any values are set
    const metrics = Object.entries(state.tokenMetrics).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof typeof state.tokenMetrics] = Number(value);
      }
      return acc;
    }, {} as NonNullable<TokenFilterRequest['metrics']>);

    if (Object.keys(metrics).length > 0) {
      request.metrics = metrics;
    }

    // Build audit filters if any values are set
    const auditFilters: Record<string, boolean | number> = {};
    Object.entries(state.tokenAudits).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        auditFilters[key] = typeof value === 'boolean' ? value : Number(value);
      }
    });

    if (Object.keys(auditFilters).length > 0) {
      request.audit_filters = auditFilters as TokenFilterRequest['audit_filters'];
    }

    // Add categories if any selected
    if (state.categories.length > 0) {
      request.categories = state.categories;
    }

    // Build holder filters if any values are set
    const holderFilters = Object.entries(state.holderFilters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof typeof state.holderFilters] = Number(value);
      }
      return acc;
    }, {} as NonNullable<TokenFilterRequest['holder_filters']>);

    if (Object.keys(holderFilters).length > 0) {
      request.holder_filters = holderFilters;
    }

    return request;
  },

  // Convert UI state to API request format for pools
  getPoolFilterRequest: (): PoolFilterRequest => {
    const state = get();
    const request: PoolFilterRequest = {};

    if (state.searchQuery.trim()) {
      request.search_query = state.searchQuery.trim();
    }

    // Build metrics object if any values are set
    const metrics = Object.entries(state.poolMetrics).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof typeof state.poolMetrics] = Number(value);
      }
      return acc;
    }, {} as NonNullable<PoolFilterRequest['metrics']>);

    if (Object.keys(metrics).length > 0) {
      request.metrics = metrics;
    }

    // Add protocols if any selected
    if (state.protocols.length > 0) {
      request.protocols = state.protocols;
    }

    // Add tokens if any selected
    if (state.tokens.length > 0) {
      request.tokens = state.tokens;
    }

    return request;
  },
}));
