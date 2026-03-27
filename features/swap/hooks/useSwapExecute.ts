import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SwapService, SwapParams } from "../services/swap.service";

export function useSwapExecute() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: SwapParams) => SwapService.executeSwap(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio"] });
            queryClient.invalidateQueries({ queryKey: ["token-balance"] });
        }
    });
}
