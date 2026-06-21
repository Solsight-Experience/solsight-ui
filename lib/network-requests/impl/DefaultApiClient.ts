import useClusterStore from "@/stores/cluster.store";
import { ApiClient, ApiRequestConfig } from "../api-client";
import { ApiRequest, HttpTransport } from "../http-transport";
import { isAuthEndpoint } from "../utils";
import Cookies from "js-cookie";

export class DefaultApiClient implements ApiClient {
    constructor(private readonly transport: HttpTransport) {}

    async get<T>(url: string, config?: ApiRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "GET", url });
    }

    async post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "POST", url, data });
    }

    async put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "PUT", url, data });
    }

    async patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "PATCH", url, data });
    }

    async delete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "DELETE", url });
    }

    private request<T>(request: ApiRequest): Promise<T> {
        return this.transport.request<T>(this.withRequestPolicy(request));
    }

    private withRequestPolicy(request: ApiRequest): ApiRequest {
        const params = request.params instanceof URLSearchParams ? new URLSearchParams(request.params) : { ...(request.params ?? {}) };

        if (!isAuthEndpoint(request.url) && !(params instanceof URLSearchParams) && params.cluster == null) {
            params.cluster = useClusterStore.getState().cluster;
        }

        return {
            ...request,
            params,
            headers: {
                ...request.headers,
                ...this.getAuthHeaders()
            }
        };
    }

    private getAuthHeaders(): Record<string, string> {
        const token = Cookies.get("auth_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}
