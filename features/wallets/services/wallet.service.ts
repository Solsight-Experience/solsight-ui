import apiClient from '@/lib/api-client';
import { API_ENDPOINTS, PORTFOLIO_ENDPOINTS } from '@/lib/constants';
import { WalletResponseDto, CreateWalletDto } from '@/types/dto';
import { ApiResponse } from '@/types/api';

export class WalletService {
  // Connect wallet - sends public key to backend for registration
  static async connectWallet(publicKey: string, walletType: string): Promise<WalletResponseDto> {
    const response = await apiClient.post<{ success: boolean; wallet: WalletResponseDto }>(
      PORTFOLIO_ENDPOINTS.WALLETS,
      {
        address: publicKey,
        name: walletType === 'phantom' ? 'Phantom' : walletType,
        icon: walletType,
      }
    );
    return response.wallet;
  }

  // Get wallet balance from backend
  static async getWalletBalance(address: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ balance: number }>>(
      API_ENDPOINTS.WALLETS.BALANCE(address)
    );
    return response.data.balance;
  }

  // Get user's wallets
  static async getUserWallets(): Promise<WalletResponseDto[]> {
    const response = await apiClient.get<ApiResponse<WalletResponseDto[]>>(
      API_ENDPOINTS.WALLETS.LIST
    );
    return response.data;
  }

  // Disconnect wallet
  static async disconnectWallet(publicKey: string): Promise<void> {
    await apiClient.delete(PORTFOLIO_ENDPOINTS.DELETE_WALLET(publicKey));
  }
}
