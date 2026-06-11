import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zaloService } from "../services/zalo.service";

const SUBSCRIPTION_KEY = ["zalo-subscription"];
const STATUS_KEY = ["zalo-status"];

export const useZaloSubscription = () =>
    useQuery({
        queryKey: SUBSCRIPTION_KEY,
        queryFn: zaloService.getSubscription
    });

export const useGenerateZaloToken = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: zaloService.generateToken,
        onSuccess: () => qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY })
    });
};

export const useZaloStatus = (enabled: boolean) => {
    const qc = useQueryClient();
    return useQuery({
        queryKey: STATUS_KEY,
        queryFn: zaloService.getStatus,
        refetchInterval: enabled ? 3000 : false,
        enabled,
        select: (data) => {
            if (data.isVerified) {
                qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
            }
            return data;
        }
    });
};

export const useDisconnectZalo = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: zaloService.disconnect,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
            qc.invalidateQueries({ queryKey: STATUS_KEY });
        }
    });
};
