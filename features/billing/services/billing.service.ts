import apiClient from "@/lib/network-requests/api-client";
import { BILLING_ENDPOINTS } from "@/lib/constants";
import type { BuiltPaymentTransaction, CreatedPaymentOrder, PaymentOrderPage, PaymentPackage, QuotaStatus, SubmitPaymentResult } from "../types";

export class BillingService {
    static async getQuota(): Promise<QuotaStatus> {
        return apiClient.get<QuotaStatus>(BILLING_ENDPOINTS.QUOTA);
    }

    static async getPackages(): Promise<PaymentPackage[]> {
        return apiClient.get<PaymentPackage[]>(BILLING_ENDPOINTS.PACKAGES);
    }

    static async createOrder(packageCode: string, walletAddress: string): Promise<CreatedPaymentOrder> {
        return apiClient.post<CreatedPaymentOrder>(BILLING_ENDPOINTS.CREATE_ORDER, { packageCode, walletAddress });
    }

    static async refreshTransaction(orderId: string, walletAddress: string): Promise<BuiltPaymentTransaction> {
        return apiClient.post<BuiltPaymentTransaction>(BILLING_ENDPOINTS.REFRESH_TX(orderId), { walletAddress });
    }

    static async submitPayment(orderId: string, signedTransaction: string, lastValidBlockHeight: number): Promise<SubmitPaymentResult> {
        return apiClient.post<SubmitPaymentResult>(BILLING_ENDPOINTS.SUBMIT_PAYMENT(orderId), { signedTransaction, lastValidBlockHeight });
    }

    static async getOrders(page = 1, limit = 20): Promise<PaymentOrderPage> {
        return apiClient.get<PaymentOrderPage>(BILLING_ENDPOINTS.ORDERS, { params: { page, limit } });
    }
}
