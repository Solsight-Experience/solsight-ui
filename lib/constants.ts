// API endpoints that correspond to your NestJS backend routes
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        PROFILE: "/auth/profile"
    },
    WALLETS: {
        LIST: "/api/users/me/wallets",
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
    WALLETS: "/api/users/me/wallets",
    WALLET_DETAIL: (address: string) => `/api/users/me/wallets/${address}`,
    SET_DEFAULT_WALLET: (address: string) => `/api/users/me/wallets/${address}/set-default`,
    DELETE_WALLET: (address: string) => `/api/users/me/wallets/${address}`,

    // Portfolio Overview
    OVERVIEW: "/api/portfolio/overview",
    PNL_CHART: "/api/portfolio/pnl-chart",
    POSITIONS: "/api/portfolio/positions",
    ACTIVITIES: "/api/portfolio/activities",
    PERFORMANCE: "/api/portfolio/performance"
} as const;

// User API Endpoints
export const USER_ENDPOINTS = {
    ME: "/api/account/me",
    STATS: "/api/account/me/stats",
    FAVORITES: "/api/account/me/favorites",
    FAVORITE_DETAIL: (tokenAddress: string) => `/api/account/me/favorites/${tokenAddress}`
} as const;

// Limit Order API Endpoints
export const LIMIT_ORDER_ENDPOINTS = {
    CREATE: "/api/limit-orders/create",
    EXECUTE: "/api/limit-orders/execute",
    LIST: "/api/limit-orders",
    CANCEL: "/api/limit-orders/cancel",
    CANCEL_MULTIPLE: "/api/limit-orders/cancel-multiple"
} as const;

// Token API Endpoints
export const TOKEN_ENDPOINTS = {
    // Token Details
    TOKEN_DETAIL: (address: string) => `/api/tokens/${address}`,
    TOKEN_CHART: (address: string) => `/api/tokens/${address}/chart`,
    TOKEN_TRADES: (address: string) => `/api/tokens/${address}/trades`,
    TOKEN_HOLDERS: (address: string) => `/api/tokens/${address}/holders`,
    TOKEN_TOP_TRADERS: (address: string) => `/api/tokens/${address}/top-traders`,
    TOKEN_POOLS: (address: string) => `/api/tokens/${address}/pools`,

    // Token Actions
    SWAP_PREVIEW: (address: string) => `/api/tokens/${address}/swap-preview`,
    ADD_FAVORITE: (address: string) => `/api/account/me/favorites`,
    REMOVE_FAVORITE: (address: string) => `/api/account/me/favorites/${address}`,

    // AI Summary
    AI_SUMMARY: "/api/tokens/summarize"
} as const;

// Chart intervals
export const CHART_INTERVALS = ["1s", "10s", "30s", "1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;
export type ChartInterval = (typeof CHART_INTERVALS)[number];

// Trade tabs
export const TRADE_TABS = ["trades", "top_traders", "holders", "pools"] as const;
export type TradeTab = (typeof TRADE_TABS)[number];

// Chat API Endpoints
export const CHAT_ENDPOINTS = {
    MESSAGE: "/api/chat/message"
} as const;

// Chat Socket Events
export const CHAT_SOCKET_EVENTS = {
    SEND: "chat:message",
    RESPONSE: "chat:response",
    STREAM: "chat:stream",
    COMPLETE: "chat:complete",
    ERROR: "chat:error"
} as const;
