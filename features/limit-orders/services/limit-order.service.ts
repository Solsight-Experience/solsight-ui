import { apiClient } from "@/lib/api-client";
import { VersionedTransaction } from "@solana/web3.js";
import type {
    CreateLimitOrderRequest,
    CreateLimitOrderResponse,
    ExecuteLimitOrderRequest,
    ExecuteLimitOrderResponse,
    GetOrdersResponse,
    CancelOrderResponse
} from "../types/limit-order.types";

export class LimitOrderService {
    /**
     * Create a new limit order
     */
    static async createOrder(request: CreateLimitOrderRequest): Promise<CreateLimitOrderResponse> {
        const response = await apiClient.post<{ success: boolean; data: CreateLimitOrderResponse }>("/api/limit-orders/create", request);
        if (!response.success || !response.data) {
            throw new Error("Failed to create limit order");
        }
        return response.data;
    }

    /**
     * Execute a signed limit order transaction
     */
    static async executeOrder(request: ExecuteLimitOrderRequest): Promise<ExecuteLimitOrderResponse> {
        const response = await apiClient.post<{ success: boolean; data: ExecuteLimitOrderResponse }>("/api/limit-orders/execute", request);
        if (!response.success || !response.data) {
            throw new Error("Failed to execute limit order");
        }
        return response.data;
    }

    /**
     * Create, sign, and execute a limit order in a single call.
     */
    static async createSignAndExecuteOrder(args: {
        request: CreateLimitOrderRequest;
        signTransaction: <T extends VersionedTransaction>(transaction: T) => Promise<T>;
    }): Promise<{ signature: string; order: string; requestId: string }> {
        const createResponse = await this.createOrder(args.request);
        const txBuffer = Buffer.from(createResponse.transaction, "base64");
        const transaction = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await args.signTransaction(transaction);
        const signedTransaction = Buffer.from(signedTx.serialize()).toString("base64");
        const executeResponse = await this.executeOrder({
            requestId: createResponse.requestId,
            signedTransaction
        });

        return {
            signature: executeResponse.signature,
            order: createResponse.order,
            requestId: createResponse.requestId
        };
    }

    /**
     * Get limit orders for a wallet
     */
    static async getOrders(
        user: string,
        orderStatus: "active" | "history",
        options?: {
            inputMint?: string;
            outputMint?: string;
            page?: number;
        }
    ): Promise<GetOrdersResponse> {
        const params = new URLSearchParams({
            user,
            orderStatus,
            ...(options?.inputMint && { inputMint: options.inputMint }),
            ...(options?.outputMint && { outputMint: options.outputMint }),
            ...(options?.page && { page: options.page.toString() })
        });

        const response = await apiClient.get<{ success: boolean; data: GetOrdersResponse }>(`/api/limit-orders?${params.toString()}`);
        if (!response.success || !response.data) {
            throw new Error("Failed to fetch limit orders");
        }
        return response.data;
    }

    /**
     * Cancel a single limit order
     */
    static async cancelOrder(maker: string, order: string): Promise<CancelOrderResponse> {
        const response = await apiClient.post<{ success: boolean; data: CancelOrderResponse }>("/api/limit-orders/cancel", {
            maker,
            order,
            computeUnitPrice: "auto"
        });
        if (!response.success || !response.data) {
            throw new Error("Failed to cancel limit order");
        }
        return response.data;
    }

    /**
     * Cancel multiple limit orders
     */
    static async cancelMultipleOrders(maker: string, orders: string[]): Promise<{ transactions: string[]; requestId: string }> {
        const response = await apiClient.post<{ success: boolean; data: { transactions: string[]; requestId: string } }>("/api/limit-orders/cancel-multiple", {
            maker,
            orders,
            computeUnitPrice: "auto"
        });
        if (!response.success || !response.data) {
            throw new Error("Failed to cancel limit orders");
        }
        return response.data;
    }
}
