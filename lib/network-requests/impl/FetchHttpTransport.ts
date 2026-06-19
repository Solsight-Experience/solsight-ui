import { ApiRequest, HttpTransport } from "../http-transport";
import { appendParams, createApiError, getApiBaseUrl, getApiErrorMessage } from "../utils";

export class FetchApiTransport implements HttpTransport {
    constructor(private readonly baseUrl = getApiBaseUrl()) {}

    async request<T>(request: ApiRequest): Promise<T> {
        const response = await fetch(this.createUrl(request), this.createInit(request));
        const data = await this.parseResponse(response);

        if (!response.ok) {
            const message = (getApiErrorMessage(data) ?? response.statusText) || "Request failed";
            throw createApiError(message, response.status, data);
        }

        return data as T;
    }

    private createUrl(request: ApiRequest): string {
        const base = this.baseUrl.replace(/\/+$/, "");
        const path = request.url.replace(/^\/+/, "");
        return appendParams(`${base}/${path}`, request.params);
    }

    private createInit(request: ApiRequest): RequestInit {
        return {
            method: request.method,
            headers: {
                "Content-Type": "application/json",
                ...request.headers
            },
            body: request.data == null ? undefined : JSON.stringify(request.data),
            credentials: "include",
            signal: request.signal
        };
    }

    private async parseResponse(response: Response): Promise<unknown> {
        if (response.status === 204) {
            return undefined;
        }

        const text = await response.text();
        if (!text) {
            return undefined;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }
}
