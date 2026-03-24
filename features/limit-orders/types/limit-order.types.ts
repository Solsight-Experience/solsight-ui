export interface LimitOrderParams {
    makingAmount: string; // Amount in base units (lamports)
    takingAmount: string; // Amount in base units
    slippageBps?: string; // Optional slippage in basis points (as string)
    expiredAt?: number; // Unix timestamp
    feeBps?: number;
}

export interface CreateLimitOrderRequest {
    inputMint: string;
    outputMint: string;
    maker: string;
    payer: string;
    params: LimitOrderParams;
    computeUnitPrice?: string | number;
    wrapAndUnwrapSol?: boolean;
}

export interface CreateLimitOrderResponse {
    order: string; // Order account public key
    transaction: string; // Base64 encoded transaction
    requestId: string;
}

export interface ExecuteLimitOrderRequest {
    requestId: string;
    signedTransaction: string;
}

export interface ExecuteLimitOrderResponse {
    signature: string;
}

export interface LimitOrder {
    account: string;
    makingAmount: string;
    takingAmount: string;
    maker: string;
    inputMint: string;
    outputMint: string;
    expiredAt: number | null;
    createdAt: number;
    state?: string;
}

export interface GetOrdersResponse {
    orders: LimitOrder[];
    hasMoreData: boolean;
}

export interface CancelOrderResponse {
    transaction: string;
    requestId: string;
}
