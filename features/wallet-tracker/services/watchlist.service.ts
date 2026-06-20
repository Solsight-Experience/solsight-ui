import { apiClient } from "@/lib/network-requests/api-client";
import { WATCHLIST_ENDPOINTS } from "@/lib/constants";
import type { WatchedWallet, WatchlistResponse, AddWatchedWalletDto, UpdateWatchedWalletDto } from "../types/watchlist.types";

export const watchlistApi = {
    getWatchlist: async (): Promise<WatchlistResponse> => {
        return await apiClient.get<WatchlistResponse>(WATCHLIST_ENDPOINTS.LIST);
    },

    addWallet: async (data: AddWatchedWalletDto): Promise<WatchedWallet> => {
        return await apiClient.post<WatchedWallet>(WATCHLIST_ENDPOINTS.ADD, data);
    },

    updateWallet: async (address: string, data: UpdateWatchedWalletDto): Promise<WatchedWallet> => {
        return await apiClient.patch<WatchedWallet>(WATCHLIST_ENDPOINTS.UPDATE(address), data);
    },

    removeWallet: async (address: string): Promise<{ success: boolean }> => {
        return await apiClient.delete<{ success: boolean }>(WATCHLIST_ENDPOINTS.REMOVE(address));
    }
};
