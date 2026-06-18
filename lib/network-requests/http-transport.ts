import { ApiRequestConfig } from "./api-client";

export interface ApiRequest extends ApiRequestConfig {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    data?: unknown;
}

export interface HttpTransport {
    request<T>(request: ApiRequest): Promise<T>;
}
