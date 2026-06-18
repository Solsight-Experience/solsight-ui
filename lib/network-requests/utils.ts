import { ApiParams } from "./api-client";

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

export function getApiErrorMessage(data: unknown): string | undefined {
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

export function createApiError(message: string, status?: number, cause?: unknown): Error {
    const error = new Error(message);
    if (status != null) {
        Object.assign(error, { status });
    }
    if (cause != null) {
        Object.assign(error, { cause });
    }
    return error;
}

export function appendParams(url: string, params?: ApiParams): string {
    if (!params) return url;

    const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams();
    if (!(params instanceof URLSearchParams)) {
        Object.entries(params).forEach(([key, value]) => {
            if (value == null) return;
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item != null) {
                        searchParams.append(key, String(item));
                    }
                });
                return;
            }
            searchParams.set(key, String(value));
        });
    }

    const query = searchParams.toString();
    if (!query) return url;

    return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}
