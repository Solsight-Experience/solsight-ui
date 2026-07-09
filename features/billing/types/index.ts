export interface QuotaStatus {
    freeUsed: number;
    freeLimit: number;
    paidCredits: number;
    resetsAt: string;
}

export interface PaymentPackage {
    code: string;
    credits: number;
    lamports: string;
}

export interface BuiltPaymentTransaction {
    transaction: string;
    blockhash: string;
    lastValidBlockHeight: number;
}

export interface CreatedPaymentOrder extends BuiltPaymentTransaction {
    orderId: string;
    packageCode: string;
    credits: number;
    amountLamports: string;
    expiresAt: string;
}

export interface SubmitPaymentResult {
    success: boolean;
    creditsAdded: number;
    alreadyProcessed: boolean;
}

export interface PaymentOrderSummary {
    id: string;
    packageCode: string;
    credits: number;
    amountLamports: string;
    network: string;
    status: "pending" | "completed" | "expired" | "failed";
    txSignature: string | null;
    createdAt: string;
    expiresAt: string;
    completedAt: string | null;
}

export interface PaymentOrderPage {
    orders: PaymentOrderSummary[];
    total: number;
    page: number;
    limit: number;
}
