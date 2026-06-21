import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiRequest, HttpTransport } from "../http-transport";
import { getApiBaseUrl, getApiErrorMessage } from "../utils";
export class AxiosApiTransport implements HttpTransport {
    public readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: getApiBaseUrl(),
            timeout: 0,
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });
    }

    async request<T>(request: ApiRequest): Promise<T> {
        try {
            const response = await this.client.request<T>(this.toAxiosConfig(request));
            return response.data;
        } catch (error) {
            throw this.normalizeError(error);
        }
    }

    private toAxiosConfig(request: ApiRequest): AxiosRequestConfig {
        return {
            url: request.url,
            method: request.method,
            data: request.data,
            headers: request.headers,
            params: request.params,
            signal: request.signal
        };
    }

    private normalizeError(error: unknown): unknown {
        if (!axios.isAxiosError(error)) {
            return error;
        }

        const message = getApiErrorMessage(error.response?.data);
        if (message) {
            error.message = message;
        }

        return error;
    }
}
