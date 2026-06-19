import { apiClient } from "@/lib/network-requests/api-client";
import { WALLET_ALERT_ENDPOINTS } from "@/lib/constants";
import { WalletAlert, CreateWalletAlertDto, UpdateWalletAlertDto } from "../types/watchlist.types";

export const walletAlertsService = {
    list: async (walletAddress: string): Promise<WalletAlert[]> => {
        return apiClient.get<WalletAlert[]>(WALLET_ALERT_ENDPOINTS.LIST(walletAddress));
    },

    create: async (walletAddress: string, dto: CreateWalletAlertDto): Promise<WalletAlert> => {
        return apiClient.post<WalletAlert>(WALLET_ALERT_ENDPOINTS.CREATE(walletAddress), dto);
    },

    update: async (walletAddress: string, alertId: string, dto: UpdateWalletAlertDto): Promise<WalletAlert> => {
        return apiClient.patch<WalletAlert>(WALLET_ALERT_ENDPOINTS.UPDATE(walletAddress, alertId), dto);
    },

    delete: async (walletAddress: string, alertId: string): Promise<void> => {
        return apiClient.delete(WALLET_ALERT_ENDPOINTS.DELETE(walletAddress, alertId));
    }
};
