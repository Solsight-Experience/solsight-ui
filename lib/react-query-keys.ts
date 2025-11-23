// Query keys factory
export const queryKeys = {
  portfolio: {
    all: ['portfolio'] as const,
    wallets: () => [...queryKeys.portfolio.all, 'wallets'] as const,
    overview: (addresses?: string[]) =>
      [...queryKeys.portfolio.all, 'overview', addresses] as const,
    positions: (address: string) => [...queryKeys.portfolio.all, 'positions', address] as const,
    activities: (address: string, filters?: Record<string, any>) =>
      [...queryKeys.portfolio.all, 'activities', address, filters] as const,
    pnlChart: (addresses: string[], timeFrame: string) =>
      [...queryKeys.portfolio.all, 'pnl-chart', addresses, timeFrame] as const,
    performance: (addresses: string[], timeFrame: string) =>
      [...queryKeys.portfolio.all, 'performance', addresses, timeFrame] as const,
  },
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    stats: (timeFrame: string) => [...queryKeys.user.all, 'stats', timeFrame] as const,
    favorites: () => [...queryKeys.user.all, 'favorites'] as const,
  },
  tokens: {
    all: ['tokens'] as const,
    trending: (params?: Record<string, any>) => 
      [...queryKeys.tokens.all, 'trending', params] as const,
    newListings: (params?: Record<string, any>) => 
      [...queryKeys.tokens.all, 'new-listings', params] as const,
    categories: () => [...queryKeys.tokens.all, 'categories'] as const,
    categoryDetail: (slug: string, params?: Record<string, any>) => 
      [...queryKeys.tokens.all, 'category', slug, params] as const,
    gainersLosers: (params?: Record<string, any>) => 
      [...queryKeys.tokens.all, 'gainers-losers', params] as const,
  },
};
