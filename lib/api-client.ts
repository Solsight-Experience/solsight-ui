import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface RequestConfig {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private buildURL(path: string, params?: Record<string, unknown>): string {
        const url = new URL(path, this.baseURL);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        for (const item of value) {
                            url.searchParams.append(key, String(item));
                        }
                    } else {
                        url.searchParams.set(key, String(value));
                    }
                }
            }
        }
        return url.toString();
    }

    private getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };
        const token = Cookies.get("auth_token");
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }

    private async request<T>(method: string, path: string, data?: object, config?: RequestConfig): Promise<T> {
        const url = this.buildURL(path, config?.params);
        const headers = { ...this.getAuthHeaders(), ...config?.headers };

        const init: RequestInit = {
            method,
            headers,
            credentials: "include",
            signal: config?.signal
        };

        if (data !== undefined) {
            init.body = JSON.stringify(data);
        }

        const response = await fetch(url, init);

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            const error = new Error(body.message || `Request failed with status ${response.status}`);
            (error as unknown as Record<string, unknown>).response = {
                status: response.status,
                data: body
            };
            throw error;
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    async get<T>(url: string, config?: RequestConfig): Promise<T> {
        return this.request<T>("GET", url, undefined, config);
    }

    async post<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
        return this.request<T>("POST", url, data, config);
    }

    async put<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
        return this.request<T>("PUT", url, data, config);
    }

    async delete<T>(url: string, config?: RequestConfig): Promise<T> {
        return this.request<T>("DELETE", url, undefined, config);
    }

    async patch<T>(url: string, data?: object, config?: RequestConfig): Promise<T> {
        return this.request<T>("PATCH", url, data, config);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;
