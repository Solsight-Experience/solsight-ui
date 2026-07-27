"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VersionedTransaction } from "@solana/web3.js";
import { usePendingPaymentStore } from "@/stores/pendingPayment.store";
import { queryKeys } from "@/lib/react-query-keys";
import { getErrorMessage } from "@/lib/error-utils";
import { BillingService } from "../services/billing.service";
import type { PaymentPackage, SubmitPaymentResult } from "../types";

export type PurchaseStatus = "idle" | "creating" | "signing" | "submitting" | "done" | "error";

export type SignTransactionFn = (tx: VersionedTransaction) => Promise<VersionedTransaction>;

interface PurchaseState {
    status: PurchaseStatus;
    creditsAdded: number | null;
    error: string | null;
}

const INIT_STATE: PurchaseState = { status: "idle", creditsAdded: null, error: null };

function base64ToBytes(value: string): Uint8Array {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function isRejectionError(err: unknown): boolean {
    const message = getErrorMessage(err).toLowerCase();
    return message.includes("rejected") || message.includes("cancelled") || message.includes("user rejected");
}

function isBlockhashExpiredError(err: unknown): boolean {
    const message = getErrorMessage(err).toLowerCase();
    return message.includes("blockhash") || message.includes("expired");
}

// Backend build tx (đúng số tiền/ví nhận/memo), FE chỉ ký rồi gửi tx đã ký về cho
// backend tự submit+confirm+cộng credits — mirror pattern của executeJupiterSwap.
async function signAndSubmit(
    orderId: string,
    transactionBase64: string,
    lastValidBlockHeight: number,
    sign: SignTransactionFn,
    onPending: (signedTransactionBase64: string, lastValidBlockHeight: number) => void
): Promise<SubmitPaymentResult> {
    const tx = VersionedTransaction.deserialize(base64ToBytes(transactionBase64));
    const signed = await sign(tx);
    const signedTransactionBase64 = Buffer.from(signed.serialize()).toString("base64");
    onPending(signedTransactionBase64, lastValidBlockHeight);
    return BillingService.submitPayment(orderId, signedTransactionBase64, lastValidBlockHeight);
}

export function usePurchaseCredits(
    connected: boolean,
    walletPubkey: string | null,
    signTransaction: SignTransactionFn | null,
    ensureWalletReadyForUserAction: (actionLabel?: string) => boolean
) {
    const [state, setState] = useState<PurchaseState>(INIT_STATE);
    const setPending = usePendingPaymentStore((s) => s.setPending);
    const clearPending = usePendingPaymentStore((s) => s.clearPending);
    const queryClient = useQueryClient();

    const reset = useCallback(() => setState(INIT_STATE), []);

    const handlePurchase = useCallback(
        async (pkg: PaymentPackage) => {
            setState(INIT_STATE);
            if (!ensureWalletReadyForUserAction("buy credits")) return false;
            if (!connected || !walletPubkey || !signTransaction) {
                toast.error("Wallet not connected. Please connect and try again.");
                return false;
            }

            setState((s) => ({ ...s, status: "creating" }));
            try {
                const order = await BillingService.createOrder(pkg.code, walletPubkey);
                setState((s) => ({ ...s, status: "signing" }));

                const onPending = (signedTransactionBase64: string, lastValidBlockHeight: number) => {
                    setPending({ orderId: order.orderId, signedTransactionBase64, lastValidBlockHeight, createdAt: Date.now() });
                    setState((s) => ({ ...s, status: "submitting" }));
                };

                let result: SubmitPaymentResult;
                try {
                    result = await signAndSubmit(order.orderId, order.transaction, order.lastValidBlockHeight, signTransaction, onPending);
                } catch (err) {
                    if (!isBlockhashExpiredError(err)) throw err;
                    // Người dùng chần chừ ký quá lâu (>60-90s) — build lại tx với blockhash
                    // mới cho CÙNG order rồi ký lại 1 lần, không tạo order mới.
                    const refreshed = await BillingService.refreshTransaction(order.orderId, walletPubkey);
                    setState((s) => ({ ...s, status: "signing" }));
                    result = await signAndSubmit(order.orderId, refreshed.transaction, refreshed.lastValidBlockHeight, signTransaction, onPending);
                }

                clearPending();
                setState({ status: "done", creditsAdded: result.creditsAdded, error: null });
                queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota() });
                toast.success(`Purchased ${result.creditsAdded} credits!`);
                return true;
            } catch (err) {
                const rejected = isRejectionError(err);
                const message = getErrorMessage(err, "Purchase failed. Please try again.");
                setState({ status: "error", creditsAdded: null, error: rejected ? null : message });
                if (rejected) toast.info("Purchase cancelled.");
                else toast.error(message, { duration: 8000 });
                return false;
            }
        },
        [connected, walletPubkey, signTransaction, ensureWalletReadyForUserAction, setPending, clearPending, queryClient]
    );

    return { state, reset, handlePurchase };
}
