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

    useEffect(() => {
        // Đọc trực tiếp từ store thay vì subscribe qua hook, để effect chỉ chạy 1 lần
        // khi app load và recover payment đã persist từ phiên trước — không re-run khi
        // usePurchaseCredits set pending cho lượt mua hiện tại (nó đã tự submit rồi).
        const { pending, clearPending } = usePendingPaymentStore.getState();
        if (!pending) return;

        BillingService.submitPayment(pending.orderId, pending.signedTransactionBase64)
            .then(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota() });
            })
            .catch(() => {})
            .finally(() => {
                clearPending();
            });
    }, [queryClient]);
}
