import type { FetchMockAdapter } from "../index";

// Mock Token Data
const mockTokenData = {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "USDT Token",
    logo_uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    network: "solana" as const,
    description: "Tether USD on Solana",
    website: "https://tether.to",
    social_links: {
        twitter: "https://twitter.com/tether_to",
        telegram: "https://t.me/tether",
        discord: null
    },
    total_supply: 1000000000,
    circulating_supply: 950000000,
    max_supply: null,
    price: 0.0412,
    price_change: {
        "1h": 0.15,
        "24h": 2.34,
        "7d": -5.21,
        "30d": 8.45
    },
    market_cap: 11600000,
    market_cap_change_24h: -1.23,
    fdv: 18800000,
    liquidity: 18800000,
    liquidity_change_24h: 5.67,
    volume: {
        "1h": 2500000,
        "24h": 23500000,
        "7d": 145000000,
        "30d": 580000000
    },
    volume_change_24h: 12.45,
    txns: {
        "1h": { total: 2840, buys: 1520, sells: 1320 },
        "24h": { total: 16720, buys: 8900, sells: 7820 },
        "7d": { total: 98500, buys: 52000, sells: 46500 }
    },
    txns_change_24h: 8.91,
    holders: {
        count: 1450,
        change_24h: 3.21,
        unique_wallets_24h: 892,
        top_10_percent: 45.2,
        top_20_percent: 62.8,
        insider_percent: 8.5
    },
    audit: {
        mint_authority: {
            disabled: true,
            address: null
        },
        freeze_authority: {
            disabled: true,
            address: null
        },
        lp_burnt_percent: 98.5,
        has_social_links: true,
        is_verified: true,
        risk_score: 15,
        risk_factors: ["Low Liquidity", "High Concentration"]
    }
};

const mockTrades = [
    {
        tx_hash: "5KJp9Xn4vRzQ8hL2mN7Tk3Yz1Bw6Fj8Vh4Np2Xr9Lq",
        timestamp: Date.now() - 120000,
        type: "BUY" as const,
        amount_token: 1234.56,
        amount_sol: 0.0508,
        price: 0.0412,
        price_usd: 50.89,
        market_cap: 11600000,
        trader_address: "7xΘ...k2L",
        tx_url: "https://solscan.io/tx/5KJp9Xn4vRzQ8hL2mN7Tk3Yz1Bw6Fj8Vh4Np2Xr9Lq"
    },
    {
        tx_hash: "8Mn5Kx2pY7Lz9Rq4Vt6Jh3Fw8Bn2Zx5Nh7Mp9Xr1Lq",
        timestamp: Date.now() - 300000,
        type: "SELL" as const,
        amount_token: 892.34,
        amount_sol: 0.0368,
        price: 0.0412,
        price_usd: 36.78,
        market_cap: 11800000,
        trader_address: "3a5...9mN",
        tx_url: "https://solscan.io/tx/8Mn5Kx2pY7Lz9Rq4Vt6Jh3Fw8Bn2Zx5Nh7Mp9Xr1Lq"
    },
    {
        tx_hash: "3Bw7Tx5Nz2Lk9Rp6Jh4Mq8Vt1Fy2Xn5Zh7Np3Lr9Xq",
        timestamp: Date.now() - 480000,
        type: "BUY" as const,
        amount_token: 2567.89,
        amount_sol: 0.1057,
        price: 0.0412,
        price_usd: 105.67,
        market_cap: 11400000,
        trader_address: "9k2...7xL",
        tx_url: "https://solscan.io/tx/3Bw7Tx5Nz2Lk9Rp6Jh4Mq8Vt1Fy2Xn5Zh7Np3Lr9Xq"
    }
];

const mockTopTraders = [
    {
        address: "7xΘ...k2L",
        name: "Whale Trader 1",
        total_pnl: 15420.5,
        roi_percent: 245.8,
        total_bought: 125000,
        total_sold: 98000,
        win_rate: 78.5,
        trades_count: 156
    },
    {
        address: "3a5...9mN",
        name: null,
        total_pnl: 8950.2,
        roi_percent: 156.3,
        total_bought: 85000,
        total_sold: 62000,
        win_rate: 72.1,
        trades_count: 98
    },
    {
        address: "9k2...7xL",
        name: "Smart Money",
        total_pnl: 6780.8,
        roi_percent: 134.5,
        total_bought: 68000,
        total_sold: 51000,
        win_rate: 68.9,
        trades_count: 78
    }
];

const mockHolders = [
    {
        address: "7xΘ...k2L",
        name: "Whale Wallet",
        balance: 125000,
        balance_percent: 12.5,
        avg_buy_price: 0.038,
        total_bought: 150000,
        total_sold: 25000,
        realized_pnl: 2500,
        unrealized_pnl: 5250,
        total_pnl: 7750,
        roi_percent: 136.8,
        first_tx_time: Date.now() - 2592000000,
        last_tx_time: Date.now() - 120000,
        tx_count: 45
    },
    {
        address: "3a5...9mN",
        name: null,
        balance: 98000,
        balance_percent: 9.8,
        avg_buy_price: 0.04,
        total_bought: 120000,
        total_sold: 22000,
        realized_pnl: 1800,
        unrealized_pnl: 1176,
        total_pnl: 2976,
        roi_percent: 3.0,
        first_tx_time: Date.now() - 1728000000,
        last_tx_time: Date.now() - 300000,
        tx_count: 32
    },
    {
        address: "9k2...7xL",
        name: "Early Adopter",
        balance: 85000,
        balance_percent: 8.5,
        avg_buy_price: 0.035,
        total_bought: 100000,
        total_sold: 15000,
        realized_pnl: 1050,
        unrealized_pnl: 5950,
        total_pnl: 7000,
        roi_percent: 200.0,
        first_tx_time: Date.now() - 5184000000,
        last_tx_time: Date.now() - 480000,
        tx_count: 28
    }
];

export function setupTokenMockApi(mock: FetchMockAdapter) {
    // Get chart data
    // NOTE: Disabled to fetch real data from API
    // mock.onGet(/\/api\/tokens\/.*\/chart/).reply((config) => {
    //   const params = config.params;
    //   const points = params?.limit || 60;

    //   return [
    //     200,
    //     {
    //       interval: params?.interval || '1m',
    //       points: generateChartData(20),
    //     },
    //   ];
    // });

    // Get trades
    // NOTE: Disabled to fetch real data from API
    // mock.onGet(/\/api\/tokens\/.*\/trades/).reply(200, {
    //   trades: mockTrades,
    //   total: mockTrades.length,
    // });

    // Get top traders
    // NOTE: Disabled to fetch real data from API
    // mock.onGet(/\/api\/tokens\/.*\/top-traders/).reply(200, {
    //   traders: mockTopTraders,
    // });

    // Get holders
    // NOTE: Disabled to fetch real data from API
    // mock.onGet(/\/api\/tokens\/.*\/holders/).reply(200, {
    //   holders: mockHolders,
    //   total: 1450,
    //   summary: {
    //     total_holders: 1450,
    //     top_10_holding_percent: 45.2,
    //     top_20_holding_percent: 62.8,
    //   },
    // });

    // Get token details
    // NOTE: Disabled to fetch real data from API based on token address
    // Uncomment the line below to re-enable mock data
    // mock.onGet(/\/api\/tokens\/.*/).reply((config) => {
    //   const address = config.url?.split('/').pop();
    //   return [200, mockTokenData];
    // });

    return mock;
}
