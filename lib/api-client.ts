import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import useClusterStore from "@/stores/cluster.store";

const API_ORIGIN = process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function normalizeApiOrigin(origin: string): string {
    return origin.replace(/\/+$/, "").replace(/\/api$/, "");
}

export function getApiBaseUrl(): string {
    if (typeof window !== "undefined") {
        return "/api";
    }

    return `${normalizeApiOrigin(API_ORIGIN)}/api`;
}

export function isAuthEndpoint(url?: string): boolean {
    if (!url) return false;

    const pathname = url.split("?")[0].replace(/^\/+/, "");
    return pathname === "auth" || pathname.startsWith("auth/");
}

function getAxiosErrorMessage(error: AxiosError): string | undefined {
    const data = error.response?.data;

    if (data && typeof data === "object" && "message" in data) {
        const message = (data as { message?: unknown }).message;
        if (Array.isArray(message)) {
            return message.join(", ");
        }
        if (typeof message === "string") {
            return message;
        }
    }

    return undefined;
}

class ApiClient {
    public client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: getApiBaseUrl(),
            timeout: 0,
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true // Enable sending cookies
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - add auth token if available
        this.client.interceptors.request.use(
            (config) => {
                const token = Cookies.get("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                if (!isAuthEndpoint(config.url)) {
                    this.injectClusterParam(config);
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle common errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (axios.isAxiosError(error)) {
                    const message = getAxiosErrorMessage(error);
                    if (message) {
                        error.message = message;
                    }
                }
                // if (error.response?.status === 401) {
                //   // Handle unauthorized - redirect to login
                //   localStorage.removeItem('authToken');
                //   window.location.href = '/auth/login';
                // }
                return Promise.reject(error);
            }
        );
    }

    private injectClusterParam(config: AxiosRequestConfig) {
        const cluster = useClusterStore.getState().cluster;
        config.params = config.params ?? {};
        if (config.params.cluster == null) {
            config.params.cluster = cluster;
        }
    }

    // Generic HTTP methods
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url, config);
        return response.data;
    }

    async patch<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.patch(url, data, config);
        return response.data;
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience export for direct use
export default apiClient;
