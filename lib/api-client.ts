import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import useClusterStore from "@/stores/cluster.store";

// API client configuration for NestJS backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
    public client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
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

                // Inject cluster param if not explicitly provided
                this.injectClusterParam(config);

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle common errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
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
        try {
            const cluster = useClusterStore?.getState?.().cluster;
            if (cluster) {
                config.params = config.params ?? {};
                if (config.params.cluster == null) {
                    config.params.cluster = cluster;
                }
            }
        } catch (e) {
            // ignore
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
