import apiClient from "@/lib/network-requests/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { TransactionResponseDto, CreateTransactionDto } from "@/types/dto";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export class TransferService {
    // Create a new transfer (handled by backend)
    static async createTransfer(transferData: CreateTransactionDto): Promise<TransactionResponseDto> {
        const response = await apiClient.post<ApiResponse<TransactionResponseDto>>(API_ENDPOINTS.TRANSACTIONS.CREATE, transferData);
        return response.data;
    }

    // Get transfer history for an address
    static async getTransferHistory(address: string, page = 1, limit = 20): Promise<PaginatedResponse<TransactionResponseDto>> {
        const response = await apiClient.get<PaginatedResponse<TransactionResponseDto>>(
            `${API_ENDPOINTS.TRANSACTIONS.HISTORY(address)}?page=${page}&limit=${limit}`
        );
        return response;
    }

    // Get transaction status
    static async getTransactionStatus(transactionId: string): Promise<TransactionResponseDto> {
        const response = await apiClient.get<ApiResponse<TransactionResponseDto>>(API_ENDPOINTS.TRANSACTIONS.STATUS(transactionId));
        return response.data;
    }

    // Get all user transactions
    static async getUserTransactions(page = 1, limit = 20): Promise<PaginatedResponse<TransactionResponseDto>> {
        const response = await apiClient.get<PaginatedResponse<TransactionResponseDto>>(`${API_ENDPOINTS.TRANSACTIONS.LIST}?page=${page}&limit=${limit}`);
        return response;
    }
}
