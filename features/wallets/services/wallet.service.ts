import apiClient from "@/lib/network-requests/api-client";
import { API_ENDPOINTS, PORTFOLIO_ENDPOINTS } from "@/lib/constants";
import { WalletResponseDto, GetWalletsResponseDto } from "@/types/dto";
import { ApiResponse } from "@/types/api";

export class WalletService {
    // Connect wallet - sends public key to backend for registration
    static async connectWallet(publicKey: string, walletName: string, walletIcon: string): Promise<WalletResponseDto> {
        const response = await apiClient.post<{ success: boolean; wallet: WalletResponseDto }>(PORTFOLIO_ENDPOINTS.WALLETS, {
            address: publicKey,
            name: walletName,
            icon: walletIcon
        });
        return response.wallet;
    }

    // Get wallet balance from backend
    static async getWalletBalance(address: string): Promise<number> {
        const response = await apiClient.get<ApiResponse<{ balance: number }>>(API_ENDPOINTS.WALLETS.BALANCE(address));
        return response.data.balance;
    }

    // Get user's wallets
    static async getUserWallets(): Promise<WalletResponseDto[]> {
        const response = await apiClient.get<GetWalletsResponseDto>(API_ENDPOINTS.WALLETS.LIST);
        // Handle new API response structure with { wallets: [...] }
        const wallets = response?.wallets || [];
        return Array.isArray(wallets) ? wallets : [];
    }

    // Disconnect wallet
    static async disconnectWallet(publicKey: string): Promise<void> {
        await apiClient.delete(PORTFOLIO_ENDPOINTS.DELETE_WALLET(publicKey));
    }

    // Disconnect all wallets
    static async disconnectAllWallets(): Promise<void> {
        await apiClient.delete(PORTFOLIO_ENDPOINTS.WALLETS);
    }
}
