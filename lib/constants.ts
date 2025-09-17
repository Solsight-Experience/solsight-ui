// API endpoints that correspond to your NestJS backend routes
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  WALLETS: {
    LIST: '/wallets',
    CREATE: '/wallets',
    BALANCE: (address: string) => `/wallets/${address}/balance`,
    CONNECT: '/wallets/connect',
    DISCONNECT: '/wallets/disconnect',
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    STATUS: (id: string) => `/transactions/${id}`,
    HISTORY: (address: string) => `/transactions/history/${address}`,
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
} as const;

// Solana network configurations
export const SOLANA_NETWORKS = {
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
} as const;

// Supported wallet types
export const WALLET_TYPES = {
  PHANTOM: 'phantom',
  SOLFLARE: 'solflare',
  SOLLET: 'sollet',
} as const;

// Transaction statuses that mirror your backend
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Token decimals for SOL
export const SOL_DECIMALS = 9;

// Common Solana token mints (you can expand this based on your backend)
export const COMMON_TOKENS = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
} as const;

// UI constants
export const UI_CONSTANTS = {
  MAX_TRANSFER_AMOUNT: 1000000,
  MIN_TRANSFER_AMOUNT: 0.000001,
  DEFAULT_PAGINATION_LIMIT: 20,
  WALLET_CONNECTION_TIMEOUT: 30000, // 30 seconds
} as const;