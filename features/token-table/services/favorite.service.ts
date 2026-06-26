import { apiClient } from "@/lib/network-requests/api-client";
import { TOKEN_ENDPOINTS } from "@/lib/constants";
import useClusterStore from "@/stores/cluster.store";

export const favoriteService = {
    // Add to favorites
    addFavorite: async (address: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post<{ success: boolean }>(TOKEN_ENDPOINTS.ADD_FAVORITE(address), {
            token_address: address,
            network: useClusterStore.getState().cluster
        });
        return response;
    },

    // Remove from favorites
    removeFavorite: async (address: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(TOKEN_ENDPOINTS.REMOVE_FAVORITE(address), {
            params: { network: useClusterStore.getState().cluster }
        });
        return response;
    }
};
