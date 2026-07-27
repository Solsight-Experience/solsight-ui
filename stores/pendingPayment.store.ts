import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export interface PendingPayment {
    orderId: string;
    signedTransactionBase64: string;
    lastValidBlockHeight: number;
    createdAt: number;
}

interface PendingPaymentState {
    pending: PendingPayment | null;
    setPending: (p: PendingPayment) => void;
    clearPending: () => void;
}

const noopStorage: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const storage = createJSONStorage<PendingPaymentState>(() => (typeof window === "undefined" ? noopStorage : localStorage));

// Lưu tx đã ký (không chỉ orderId) để có thể gửi lại submit ngay sau khi reload
// mà không cần ký lại — backend idempotent theo orderId nên gọi lại vô hại.
export const usePendingPaymentStore = create<PendingPaymentState>()(
    persist(
        (set) => ({
            pending: null,
            setPending: (p: PendingPayment) => set({ pending: p }),
            clearPending: () => set({ pending: null })
        }),
        {
            name: "solsight.pendingPayment",
            storage
        }
    )
);

export default usePendingPaymentStore;
