import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailService } from "../services/email.service";

const SUBSCRIPTION_KEY = ["email-subscription"];
const STATUS_KEY = ["email-status"];

export const useEmailSubscription = () =>
    useQuery({
        queryKey: SUBSCRIPTION_KEY,
        queryFn: emailService.getSubscription,
    });

export const useSubmitEmail = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (email: string) => emailService.submitEmail(email),
        onSuccess: () => qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY }),
    });
};

export const useEmailStatus = (enabled: boolean) => {
    const qc = useQueryClient();
    return useQuery({
        queryKey: STATUS_KEY,
        queryFn: emailService.getStatus,
        refetchInterval: enabled ? 3000 : false,
        enabled,
        select: (data) => {
            if (data.isVerified) {
                qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
            }
            return data;
        },
    });
};

export const useDisconnectEmail = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: emailService.disconnect,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
            qc.invalidateQueries({ queryKey: STATUS_KEY });
        },
    });
};
