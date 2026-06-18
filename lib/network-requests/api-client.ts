import { AxiosApiTransport } from "./impl/AxiosHttpTransport";
import { DefaultApiClient } from "./impl/DefaultApiClient";

export type ApiParams = Record<string, unknown> | URLSearchParams;

export interface ApiRequestConfig {
    headers?: Record<string, string>;
    params?: ApiParams;
    signal?: AbortSignal;
}

export interface ApiClient {
    get<T>(url: string, config?: ApiRequestConfig): Promise<T>;
    post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
    put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
    patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
    delete<T>(url: string, config?: ApiRequestConfig): Promise<T>;
}

export const axiosTransport = new AxiosApiTransport();
export const axiosClient = axiosTransport.client;
export const apiClient: ApiClient = new DefaultApiClient(axiosTransport);

export default apiClient;
