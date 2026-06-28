import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { telegramService } from "../services/telegram.service";

const SUBSCRIPTION_KEY = ["telegram-subscription"];
const STATUS_KEY = ["telegram-status"];

export const useTelegramSubscription = () =>
    useQuery({
        queryKey: SUBSCRIPTION_KEY,
        queryFn: telegramService.getSubscription
    });

export const useGenerateTelegramToken = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: telegramService.generateToken,
        onSuccess: () => qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY })
    });
};

export const useTelegramStatus = (enabled: boolean) => {
    const qc = useQueryClient();
    return useQuery({
        queryKey: STATUS_KEY,
        queryFn: telegramService.getStatus,
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

export const useDisconnectTelegram = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: telegramService.disconnect,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
            qc.invalidateQueries({ queryKey: STATUS_KEY });
        }
    });
};
