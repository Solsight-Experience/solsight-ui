// API endpoints that correspond to your NestJS backend routes
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        PROFILE: "/auth/profile",
        FORGOT_PASSWORD: "/auth/forgot-password",
        VERIFY_RESET_OTP: "/auth/verify-reset-otp",
        RESET_PASSWORD: "/auth/reset-password"
    },
    WALLETS: {
        LIST: "/users/me/wallets",
        CREATE: "/wallets",
        BALANCE: (address: string) => `/wallets/${address}/balance`,
        CONNECT: "/wallets/connect",
        DISCONNECT: "/wallets/disconnect"
    },
    TRANSACTIONS: {
        LIST: "/transactions",
        CREATE: "/transactions",
        STATUS: (id: string) => `/transactions/${id}`,
        HISTORY: (address: string) => `/transactions/history/${address}`
    },
    USERS: {
        PROFILE: "/users/profile",
        UPDATE: "/users/profile"
    }
} as const;

// Solana network configurations
export const SOLANA_NETWORKS = {
    MAINNET: "mainnet-beta",
    DEVNET: "devnet",
    TESTNET: "testnet"
} as const;

// Supported wallet types
export const WALLET_TYPES = {
    PHANTOM: "phantom",
    SOLFLARE: "solflare",
    SOLLET: "sollet"
} as const;

// Transaction statuses that mirror your backend
export const TRANSACTION_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    FAILED: "failed",
    CANCELLED: "cancelled"
} as const;

// Token decimals for SOL
export const SOL_DECIMALS = 9;

// Common Solana token mints (you can expand this based on your backend)
export const COMMON_TOKENS = {
    SOL: {
        symbol: "SOL",
        name: "Solana",
        decimals: 9,
        mint: "So11111111111111111111111111111111111111112" // Wrapped SOL
    },
    USDC: {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    }
} as const;

// UI constants
export const UI_CONSTANTS = {
    MAX_TRANSFER_AMOUNT: 1000000,
    MIN_TRANSFER_AMOUNT: 0.000001,
    DEFAULT_PAGINATION_LIMIT: 20,
    WALLET_CONNECTION_TIMEOUT: 30000 // 30 seconds
} as const;

// Portfolio API Endpoints
export const PORTFOLIO_ENDPOINTS = {
    // Wallet Management
    WALLETS: "/users/me/wallets",
    WALLET_DETAIL: (address: string) => `/users/me/wallets/${address}`,
    SET_DEFAULT_WALLET: (address: string) => `/users/me/wallets/${address}/set-default`,
    DELETE_WALLET: (address: string) => `/users/me/wallets/${address}`,

    // Portfolio Overview
    OVERVIEW: "/portfolio/overview",
    PNL_CHART: "/portfolio/pnl-chart",
    POSITIONS: "/portfolio/positions",
    ACTIVITIES: "/portfolio/activities",
    PERFORMANCE: "/portfolio/performance"
} as const;

// User API Endpoints
export const USER_ENDPOINTS = {
    ME: "/account/me",
    STATS: "/account/me/stats",
    FAVORITES: "/account/me/favorites",
    FAVORITE_DETAIL: (tokenAddress: string) => `/account/me/favorites/${tokenAddress}`
} as const;

// Limit Order API Endpoints
export const LIMIT_ORDER_ENDPOINTS = {
    CREATE: "/limit-orders/create",
    EXECUTE: "/limit-orders/execute",
    LIST: "/limit-orders",
    CANCEL: "/limit-orders/cancel",
    CANCEL_MULTIPLE: "/limit-orders/cancel-multiple"
} as const;

// Token API Endpoints
export const TOKEN_ENDPOINTS = {
    // Token Details
    TOKEN_DETAIL: (address: string) => `/tokens/${address}`,
    TOKEN_CHART: (address: string) => `/tokens/${address}/chart`,
    TOKEN_TRADES: (address: string) => `/tokens/${address}/trades`,
    TOKEN_HOLDERS: (address: string) => `/tokens/${address}/holders`,
    TOKEN_TOP_TRADERS: (address: string) => `/tokens/${address}/top-traders`,

    // Token Actions
    SWAP_PREVIEW: (address: string) => `/tokens/${address}/swap-preview`,
    ADD_FAVORITE: (_address: string) => `/account/me/favorites`,
    REMOVE_FAVORITE: (address: string) => `/account/me/favorites/${address}`,

    // AI Summary
    AI_SUMMARY: "/tokens/summarize",

    // SOL price (Redis-backed, falls back to CoinGecko)
    SOL_PRICE: "/tokens/sol-price"
} as const;

// Chart intervals
export const CHART_INTERVALS = ["1s", "10s", "30s", "1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;
export type ChartInterval = (typeof CHART_INTERVALS)[number];

// Trade tabs
export const TRADE_TABS = ["trades", "top_traders", "holders"] as const;
export type TradeTab = (typeof TRADE_TABS)[number];

// Wallet Alert API Endpoints
export const WALLET_ALERT_ENDPOINTS = {
    LIST: (address: string) => `/watchlist/${address}/alerts`,
    CREATE: (address: string) => `/watchlist/${address}/alerts`,
    UPDATE: (address: string, id: string) => `/watchlist/${address}/alerts/${id}`,
    DELETE: (address: string, id: string) => `/watchlist/${address}/alerts/${id}`
} as const;

// Watchlist API Endpoints
export const WATCHLIST_ENDPOINTS = {
    LIST: "/watchlist",
    ADD: "/watchlist",
    UPDATE: (address: string) => `/watchlist/${address}`,
    REMOVE: (address: string) => `/watchlist/${address}`
} as const;

// Portfolio Watch (arbitrary wallet) API Endpoints
export const PORTFOLIO_WATCH_ENDPOINTS = {
    OVERVIEW: "/portfolio/watch/overview",
    POSITIONS: "/portfolio/watch/positions",
    ACTIVITIES: "/portfolio/watch/activities",
    PNL_CHART: "/portfolio/watch/pnl-chart"
} as const;

// Swap API Endpoints
export const SWAP_ENDPOINTS = {
    QUOTE: "/swap/quote",
    TRANSACTION: "/swap/transaction",
    EXECUTE: "/swap/execute",
    INFO: "/swap/info"
} as const;

// Chat API Endpoints
export const CHAT_ENDPOINTS = {
    MESSAGE: "/chat/message",
    MESSAGES: (sessionId: string) => `/chat/sessions/${sessionId}/messages`
} as const;

// Chat Socket Events
export const CHAT_SOCKET_EVENTS = {
    SEND: "chat:message",
    RESPONSE: "chat:response",
    STREAM: "chat:stream",
    COMPLETE: "chat:complete",
    ERROR: "chat:error",
    TOOL_PROGRESS: "chat:tool_progress"
} as const;

export const CLUSTERS = ["mainnet", "devnet"] as const;
export type Cluster = (typeof CLUSTERS)[number];

export const CLUSTER_RPC_URLS: Record<(typeof CLUSTERS)[number], string> = {
    mainnet: "https://api.mainnet-beta.solana.com",
    devnet: "https://api.devnet.solana.com"
};
