import { TokenTableData, CategoryOverview } from "./types";

export const mockTokenData: TokenTableData[] = [
    // 1. MORON
    {
        id: "moron_contract_address_xyz",
        token: {
            iconUrl: "/icons/moron.png",
            ticker: "MORON",
            name: "MORON",
            priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
            category: "MEME",
            age: "10m"
        },
        marketCap: {
            value: 123000,
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: 46.8
        },
        liquidity: 38000,
        volume24h: 20400,
        transactions: {
            buyCount: 2860,
            sellCount: 2010,
            buyVolumn: 27000,
            sellVolumn: 12000
        },
        audit: [
            { label: "Risk", value: "22.6%", trend: "down" },
            { label: "Fees", value: "0.83%", trend: "up" },
            { label: "Score", value: "B 139", trend: "neutral" }
        ]
    },
    // 2. RENDER
    {
        id: "render_contract_address_abc",
        token: {
            iconUrl: "/icons/render.png",
            ticker: "RENDER",
            name: "RENDER",
            priceHistory: [80, 75, 70, 65, 60, 55, 50], // Downward trend
            category: "GameFi",
            age: "7d"
        },
        marketCap: {
            value: 2030000000, // 2.03B
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: -26.5
        },
        liquidity: 115000000, // 115M
        volume24h: 980000000, // 980M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 83000,
            sellVolumn: 46000
        },
        audit: [
            { label: "Risk", value: "28.3%", trend: "down" },
            { label: "Fees", value: "0.63%", trend: "up" },
            { label: "Score", value: "A 271", trend: "neutral" }
        ]
    },
    // 3. UOG
    {
        id: "uog_contract_address_123",
        token: {
            iconUrl: "/icons/uog.png",
            ticker: "UOG",
            name: "University Of Games",
            priceHistory: [50, 52, 51, 53, 52, 54, 53], // Neutral / Slight Up
            category: "GameFi",
            age: "2mo 4d"
        },
        marketCap: {
            value: 530800,
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: 0.0
        },
        liquidity: 82260,
        volume24h: 68740,
        transactions: {
            buyCount: 482000,
            sellCount: 480000,
            buyVolumn: 278000,
            sellVolumn: 204000
        },
        audit: [
            { label: "Risk", value: "18.4%", trend: "down" },
            { label: "Fees", value: "0.71%", trend: "up" },
            { label: "Score", value: "B 188", trend: "neutral" }
        ]
    },
    // 4. 2Z
    {
        id: "2z_contract_address_456",
        token: {
            iconUrl: "/icons/2z.png",
            ticker: "2Z",
            name: "DoubleZero",
            priceHistory: [70, 65, 75, 60, 68, 55, 60], // Volatile / Down
            category: "Infrastructure",
            age: "10d"
        },
        marketCap: {
            value: 865190000, // 865.19M
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: -10.1
        },
        liquidity: 72580000, // 72.58M
        volume24h: 12400000, // 12.4M
        transactions: {
            buyCount: 12400,
            sellCount: 12000,
            buyVolumn: 6800,
            sellVolumn: 5600
        },
        audit: [
            { label: "Risk", value: "30.5%", trend: "down" },
            { label: "Fees", value: "0.54%", trend: "up" },
            { label: "Score", value: "A 272", trend: "neutral" }
        ]
    },
    // 5. SOON
    {
        id: "soon_contract_address_789",
        token: {
            iconUrl: "/icons/soon.png",
            ticker: "SOON",
            name: "SOON",
            priceHistory: [20, 25, 23, 30, 28, 35, 38], // Upward trend
            category: "Infrastructure",
            age: "10m"
        },
        marketCap: {
            value: 234800000, // 234.8M
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: 3.4
        },
        liquidity: 120800000, // 120.8M
        volume24h: 118600000, // 118.6M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 1500,
            sellVolumn: 2500
        },
        audit: [
            { label: "Risk", value: "14.2%", trend: "down" },
            { label: "Fees", value: "0.72%", trend: "up" },
            { label: "Score", value: "A 265", trend: "neutral" }
        ]
    },
    // 6. DOGE
    {
        id: "doge_contract_address_dog",
        token: {
            iconUrl: "/icons/doge.png",
            ticker: "DOGE",
            name: "Dogecoin",
            priceHistory: [40, 38, 42, 35, 37, 30, 32], // Downward trend
            category: "MEME",
            age: "10y"
        },
        marketCap: {
            value: 28500000000, // 28.5B
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: -2.0
        },
        liquidity: 3700000000, // 3.7B
        volume24h: 28500000, // 28.5M
        transactions: {
            buyCount: 331000,
            sellCount: 330000,
            buyVolumn: 130000,
            sellVolumn: 200000
        },
        audit: [
            { label: "Risk", value: "25.8%", trend: "down" },
            { label: "Fees", value: "0.59%", trend: "up" },
            { label: "Score", value: "B 112", trend: "neutral" }
        ]
    },
    // 7. FET
    {
        id: "fet_contract_address_ai",
        token: {
            iconUrl: "/icons/fet.png",
            ticker: "FET",
            name: "Artificial Superintelligence",
            priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
            category: "AI",
            age: "10m"
        },
        marketCap: {
            value: 963300000, // 963.3M
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: 46.8
        },
        liquidity: 300100000, // 300.1M
        volume24h: 143700000, // 143.7M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 1500,
            sellVolumn: 2500
        },
        audit: [
            { label: "Risk", value: "19.1%", trend: "down" },
            { label: "Fees", value: "0.68%", trend: "up" },
            { label: "Score", value: "A 270", trend: "neutral" }
        ]
    }
];

/**
 * Mock Category Data for Categories Tab
 */
export const mockCategoryData: CategoryOverview[] = [
    {
        name: "Stable Coins",
        slug: "stable-coins",
        description: "Stablecoins are cryptocurrencies designed to minimize price volatility",
        market_cap: 313851621578,
        change_1h: -0.1,
        change_24h: -2.6,
        change_7d: -5.8,
        volume: 65331399574,
        num_tokens: 136,
        top_tokens: ["0x1a2b3c4d5e6f", "0x7g8h9i0j1k2l", "0x3m4n5o6p7q8r"]
    },
    {
        name: "Decentralized Finance (DeFi)",
        slug: "defi",
        description: "Financial applications built on blockchain technology",
        market_cap: 137537804592,
        change_1h: 0.0,
        change_24h: 1.8,
        change_7d: 2.3,
        volume: 5449950728,
        num_tokens: 1446,
        top_tokens: ["0xa1b2c3d4e5f6", "0xg7h8i9j0k1l2", "0xm3n4o5p6q7r8"]
    },
    {
        name: "Proof of Work (PoW)",
        slug: "pow",
        description: "Blockchain consensus mechanism requiring computational work",
        market_cap: 2197816842736,
        change_1h: 0.0,
        change_24h: 0.6,
        change_7d: -3.3,
        volume: 31692689239,
        num_tokens: 171,
        top_tokens: ["0xb1c2d3e4f5g6", "0xh7i8j9k0l1m2", "0xn3o4p5q6r7s8"]
    },
    {
        name: "Meme",
        slug: "meme",
        description: "Cryptocurrency tokens inspired by internet memes and jokes",
        market_cap: 60896712673,
        change_1h: -0.1,
        change_24h: 2.2,
        change_7d: -0.3,
        volume: 4099533998,
        num_tokens: 5802,
        top_tokens: ["0xc1d2e3f4g5h6", "0xi7j8k9l0m1n2", "0xo3p4q5r6s7t8"]
    },
    {
        name: "Infrastructure",
        slug: "infrastructure",
        description: "Blockchain infrastructure and development tools",
        market_cap: 25659637833,
        change_1h: -0.1,
        change_24h: 0.5,
        change_7d: -1.2,
        volume: 2051263637,
        num_tokens: 233,
        top_tokens: ["0xd1e2f3g4h5i6", "0xj7k8l9m0n1o2", "0xp3q4r5s6t7u8"]
    },
    {
        name: "Gaming (GameFi)",
        slug: "gamefi",
        description: "Gaming and play-to-earn blockchain projects",
        market_cap: 9849532508,
        change_1h: -0.1,
        change_24h: 0.5,
        change_7d: 0.5,
        volume: 1317414524,
        num_tokens: 930,
        top_tokens: ["0xe1f2g3h4i5j6", "0xk7l8m9n0o1p2", "0xq3r4s5t6u7v8"]
    },
    {
        name: "AI Agents",
        slug: "ai-agents",
        description: "Artificial intelligence and machine learning blockchain projects",
        market_cap: 3727144190,
        change_1h: -0.1,
        change_24h: 0.9,
        change_7d: -5.1,
        volume: 661993061,
        num_tokens: 544,
        top_tokens: ["0xf1g2h3i4j5k6", "0xl7m8n9o0p1q2", "0xr3s4t5u6v7w8"]
    },
    {
        name: "Entertainments",
        slug: "entertainments",
        description: "Entertainment and media blockchain projects",
        market_cap: 12727567298,
        change_1h: 0.0,
        change_24h: 1.1,
        change_7d: -2.3,
        volume: 562742880,
        num_tokens: 111,
        top_tokens: ["0xg1h2i3j4k5l6", "0xm7n8o9p0q1r2", "0xs3t4u5v6w7x8"]
    },
    {
        name: "Layer 1 (L1)",
        slug: "layer-1",
        description: "Base layer blockchain protocols",
        market_cap: 3030953335847,
        change_1h: 0.0,
        change_24h: 0.9,
        change_7d: -1.9,
        volume: 61127358326,
        num_tokens: 383,
        top_tokens: ["0xh1i2j3k4l5m6", "0xn7o8p9q0r1s2", "0xt3u4v5w6x7y8"]
    }
];
