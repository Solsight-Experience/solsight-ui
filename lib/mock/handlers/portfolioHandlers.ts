import type MockAdapter from "axios-mock-adapter";
import { PORTFOLIO_ENDPOINTS } from "@/lib/constants";
import { mockWallets, mockActivities, mockPnlChartData, mockPhantomWallet } from "../data/portfolioData";

export function setupPortfolioMocks(mock: MockAdapter) {
    let wallets = [...mockWallets]; // Use mutable copy for testing

    const getTotalBalances = () => ({
        totalBalanceSol: wallets.reduce((sum, w) => sum + w.balance_sol, 0),
        totalBalanceUsd: wallets.reduce((sum, w) => sum + w.balance_usd, 0)
    });

    // GET: Wallets
    mock.onGet(PORTFOLIO_ENDPOINTS.WALLETS).reply(() => {
        const { totalBalanceSol, totalBalanceUsd } = getTotalBalances();
        return [
            200,
            {
                wallets,
                total_wallets: wallets.length,
                total_balance_sol: totalBalanceSol,
                total_balance_usd: totalBalanceUsd
            }
        ];
    });

    // GET: Overview
    mock.onGet(PORTFOLIO_ENDPOINTS.OVERVIEW).reply(200, {
        total_balance_usd: 3578.5,
        total_balance_sol: 16.4696,
        balance_change_24h: 2.5,
        pnl: {
            total: 230.04,
            realized: 34.84,
            unrealized: 195.2,
            change_24h: 5.2,
            roi_percent: 7.67
        },
        transactions: {
            total: 252,
            buys: 114,
            sells: 138,
            transfers: 0,
            last_24h: 12
        },
        top_tokens: [
            {
                address: "So11111111111111111111111111111111111111112",
                symbol: "SOL",
                name: "Solana",
                logo_uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
                balance: 16.4696,
                value_usd: 2478.36,
                percent_of_portfolio: 69.3,
                pnl: 141.24,
                price_change_24h: 3.2
            },
            {
                address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                symbol: "USDC",
                name: "USD Coin",
                logo_uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
                balance: 450.25,
                value_usd: 450.25,
                percent_of_portfolio: 12.6,
                pnl: 0,
                price_change_24h: 0
            },
            {
                address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
                symbol: "JUP",
                name: "Jupiter",
                logo_uri: "https://static.jup.ag/jup/icon.png",
                balance: 125.5,
                value_usd: 94.13,
                percent_of_portfolio: 2.6,
                pnl: 14.01,
                price_change_24h: 5.8
            }
        ],
        allocation: [
            { symbol: "SOL", value_usd: 2478.36, percent: 69.3 },
            { symbol: "USDC", value_usd: 450.25, percent: 12.6 },
            { symbol: "Others", value_usd: 649.89, percent: 18.1 }
        ]
    });

    // GET: Positions
    mock.onGet(PORTFOLIO_ENDPOINTS.POSITIONS).reply((config) => {
        const walletAddress = config.params?.wallet_address;
        if (!walletAddress) return [400, { error: "wallet_address is required" }];

        const wallet = mockWallets.find((w) => w.address === walletAddress);
        if (!wallet) return [404, { error: "Wallet not found" }];

        return [
            200,
            {
                positions: wallet.positions,
                summary: wallet.summary
            }
        ];
    });

    // GET: Activities
    mock.onGet(PORTFOLIO_ENDPOINTS.ACTIVITIES).reply(200, {
        activities: mockActivities,
        total: mockActivities.length,
        summary: {
            total_volume_usd: 21.74,
            total_fees_usd: 0.007
        }
    });

    // GET: PNL Chart
    mock.onGet(PORTFOLIO_ENDPOINTS.PNL_CHART).reply(200, {
        chart_data: mockPnlChartData
    });

    // PATCH: Set Default Wallet
    mock.onPatch(new RegExp("/users/me/wallets/.*/set-default")).reply((config) => {
        const address = config.url?.split("/").slice(-2, -1)[0];
        if (!address) return [400, { error: "Invalid wallet address" }];

        const walletIndex = wallets.findIndex((w) => w.address === address);
        if (walletIndex === -1) return [404, { error: "Wallet not found" }];

        // Remove default from all wallets
        wallets = wallets.map((w) => ({ ...w, is_default: false }));
        // Set new default
        wallets[walletIndex] = { ...wallets[walletIndex], is_default: true };

        return [200, { success: true }];
    });

    // DELETE: Delete Wallet
    mock.onDelete(new RegExp("/users/me/wallets/.*")).reply((config) => {
        const address = config.url?.split("/").pop();
        if (!address) return [400, { error: "Invalid wallet address" }];

        const walletIndex = wallets.findIndex((w) => w.address === address);
        if (walletIndex === -1) return [404, { error: "Wallet not found" }];

        // Cannot delete if it's the only wallet
        if (wallets.length === 1) {
            return [400, { error: "Cannot delete the last wallet" }];
        }

        const wasDefault = wallets[walletIndex].is_default;

        // Remove wallet
        wallets = wallets.filter((w) => w.address !== address);

        // If deleted wallet was default, make first wallet default
        if (wasDefault && wallets.length > 0) {
            wallets[0] = { ...wallets[0], is_default: true };
        }

        return [200, { success: true }];
    });

    // POST: Add Wallet (Connect Phantom)
    mock.onPost(PORTFOLIO_ENDPOINTS.WALLETS).reply((config) => {
        JSON.parse(config.data || "{}");

        // For mock, we'll just add the Phantom wallet
        if (wallets.find((w) => w.address === mockPhantomWallet.address)) {
            return [400, { error: "Wallet already exists" }];
        }

        const newWallet = {
            ...mockPhantomWallet,
            added_at: new Date().toISOString()
        };

        wallets.push(newWallet);

        return [
            200,
            {
                success: true,
                wallet: {
                    address: newWallet.address,
                    name: newWallet.name,
                    icon: newWallet.icon,
                    is_default: newWallet.is_default,
                    added_at: newWallet.added_at
                }
            }
        ];
    });
}
