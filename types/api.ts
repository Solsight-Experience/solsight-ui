// API response types that mirror your NestJS backend
export interface ApiResponse<T = object> {
    data: T;
    message?: string;
    statusCode: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Error response type
export interface ApiError {
    message: string | string[];
    error?: string;
    statusCode: number;
}
