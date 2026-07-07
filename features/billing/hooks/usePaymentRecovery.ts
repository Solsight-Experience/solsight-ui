"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePendingPaymentStore } from "@/stores/pendingPayment.store";
import { queryKeys } from "@/lib/react-query-keys";
import { BillingService } from "../services/billing.service";

// Nếu app bị reload giữa lúc thanh toán (đã ký nhưng chưa chắc đã gửi tới backend),
// thử gửi lại ngay khi app load — an toàn vì backend idempotent theo orderId. Nếu
// blockhash đã hết hạn, bỏ qua lặng lẽ — user bấm mua lại sẽ tạo order mới.
export function usePaymentRecovery() {
    const queryClient = useQueryClient();
    const pending = usePendingPaymentStore((s) => s.pending);
    const clearPending = usePendingPaymentStore((s) => s.clearPending);

    useEffect(() => {
        if (!pending) return;

        BillingService.submitPayment(pending.orderId, pending.signedTransactionBase64)
            .then(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota() });
            })
            .catch(() => {})
            .finally(() => {
                clearPending();
            });
        // Chỉ chạy 1 lần khi app load.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
