import { TokenTableData } from './types';

export const mockTokenData: TokenTableData[] = [
    // 1. MORON
    {
        id: 'moron_contract_address_xyz',
        token: {
            iconUrl: '/icons/moron.png',
            ticker: 'MORON',
            name: 'MORON',
            priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
            category: 'MEME',
            age: '10m',
        },
        marketCap: {
            value: 123000,
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 46.8,
        },
        liquidity: 38000,
        volume24h: 20400,
        transactions: {
            buyCount: 2860,
            sellCount: 2010,
            buyVolumn: 27000,
            sellVolumn: 12000,
        },
        audit: [
            { label: 'Risk', value: '22.6%', trend: 'down' },
            { label: 'Fees', value: '0.83%', trend: 'up' },
            { label: 'Score', value: 'B 139', trend: 'neutral' },
        ],
    },
    // 2. RENDER
    {
        id: 'render_contract_address_abc',
        token: {
            iconUrl: '/icons/render.png',
            ticker: 'RENDER',
            name: 'RENDER',
            priceHistory: [80, 75, 70, 65, 60, 55, 50], // Downward trend
            category: 'GameFi',
            age: '7d',
        },
        marketCap: {
            value: 2030000000, // 2.03B
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: -26.5,
        },
        liquidity: 115000000, // 115M
        volume24h: 980000000, // 980M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 83000,
            sellVolumn: 46000,
        },
        audit: [
            { label: 'Risk', value: '28.3%', trend: 'down' },
            { label: 'Fees', value: '0.63%', trend: 'up' },
            { label: 'Score', value: 'A 271', trend: 'neutral' },
        ],
    },
    // 3. UOG
    {
        id: 'uog_contract_address_123',
        token: {
            iconUrl: '/icons/uog.png',
            ticker: 'UOG',
            name: 'University Of Games',
            priceHistory: [50, 52, 51, 53, 52, 54, 53], // Neutral / Slight Up
            category: 'GameFi',
            age: '2mo 4d',
        },
        marketCap: {
            value: 530800,
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 0.0,
        },
        liquidity: 82260,
        volume24h: 68740,
        transactions: {
            buyCount: 482000,
            sellCount: 480000,
            buyVolumn: 278000,
            sellVolumn: 204000,
        },
        audit: [
            { label: 'Risk', value: '18.4%', trend: 'down' },
            { label: 'Fees', value: '0.71%', trend: 'up' },
            { label: 'Score', value: 'B 188', trend: 'neutral' },
        ],
    },
    // 4. 2Z
    {
        id: '2z_contract_address_456',
        token: {
            iconUrl: '/icons/2z.png',
            ticker: '2Z',
            name: 'DoubleZero',
            priceHistory: [70, 65, 75, 60, 68, 55, 60], // Volatile / Down
            category: 'Infrastructure',
            age: '10d',
        },
        marketCap: {
            value: 865190000, // 865.19M
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: -10.1,
        },
        liquidity: 72580000, // 72.58M
        volume24h: 12400000, // 12.4M
        transactions: {
            buyCount: 12400,
            sellCount: 12000,
            buyVolumn: 6800,
            sellVolumn: 5600,
        },
        audit: [
            { label: 'Risk', value: '30.5%', trend: 'down' },
            { label: 'Fees', value: '0.54%', trend: 'up' },
            { label: 'Score', value: 'A 272', trend: 'neutral' },
        ],
    },
    // 5. SOON
    {
        id: 'soon_contract_address_789',
        token: {
            iconUrl: '/icons/soon.png',
            ticker: 'SOON',
            name: 'SOON',
            priceHistory: [20, 25, 23, 30, 28, 35, 38], // Upward trend
            category: 'Infrastructure',
            age: '10m',
        },
        marketCap: {
            value: 234800000, // 234.8M
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 3.4,
        },
        liquidity: 120800000, // 120.8M
        volume24h: 118600000, // 118.6M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 1500,
            sellVolumn: 2500,
        },
        audit: [
            { label: 'Risk', value: '14.2%', trend: 'down' },
            { label: 'Fees', value: '0.72%', trend: 'up' },
            { label: 'Score', value: 'A 265', trend: 'neutral' },
        ],
    },
    // 6. DOGE
    {
        id: 'doge_contract_address_dog',
        token: {
            iconUrl: '/icons/doge.png',
            ticker: 'DOGE',
            name: 'Dogecoin',
            priceHistory: [40, 38, 42, 35, 37, 30, 32], // Downward trend
            category: 'MEME',
            age: '10y',
        },
        marketCap: {
            value: 28500000000, // 28.5B
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: -2.0,
        },
        liquidity: 3700000000, // 3.7B
        volume24h: 28500000, // 28.5M
        transactions: {
            buyCount: 331000,
            sellCount: 330000,
            buyVolumn: 130000,
            sellVolumn: 200000,
        },
        audit: [
            { label: 'Risk', value: '25.8%', trend: 'down' },
            { label: 'Fees', value: '0.59%', trend: 'up' },
            { label: 'Score', value: 'B 112', trend: 'neutral' },
        ],
    },
    // 7. FET
    {
        id: 'fet_contract_address_ai',
        token: {
            iconUrl: '/icons/fet.png',
            ticker: 'FET',
            name: 'Artificial Superintelligence',
            priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
            category: 'AI',
            age: '10m',
        },
        marketCap: {
            value: 963300000, // 963.3M
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 46.8,
        },
        liquidity: 300100000, // 300.1M
        volume24h: 143700000, // 143.7M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 1500,
            sellVolumn: 2500,
        },
        audit: [
            { label: 'Risk', value: '19.1%', trend: 'down' },
            { label: 'Fees', value: '0.68%', trend: 'up' },
            { label: 'Score', value: 'A 270', trend: 'neutral' },
        ],
    },
];
