import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import apiClient from "@/lib/api-client";
import useClusterStore from "@/stores/cluster.store";

describe("apiClient", () => {
    const originalAdapter = apiClient.client.defaults.adapter;
    let latestConfig: InternalAxiosRequestConfig | undefined;

    beforeEach(() => {
        latestConfig = undefined;
        useClusterStore.setState({ cluster: "devnet" });

        apiClient.client.defaults.adapter = (async (config) => {
            latestConfig = config;

            return {
                data: {},
                status: 200,
                statusText: "OK",
                headers: {},
                config
            };
        }) as AxiosAdapter;
    });

    afterEach(() => {
        apiClient.client.defaults.adapter = originalAdapter;
    });

    it("routes resource paths through the browser /api base path", async () => {
        await apiClient.get("/auth/login");

        expect(latestConfig?.baseURL).toBe("/api");
        expect(latestConfig?.url).toBe("/auth/login");
    });

    it("does not inject cluster into auth requests", async () => {
        await apiClient.get("/auth/login");

        expect(latestConfig?.params).toBeUndefined();
    });

    it("injects cluster into non-auth API requests", async () => {
        await apiClient.get("/swap/quote");

        expect(latestConfig?.params).toEqual({ cluster: "devnet" });
    });

    it("preserves an explicitly provided cluster param", async () => {
        await apiClient.get("/swap/quote", {
            params: {
                cluster: "mainnet",
                inputMint: "So11111111111111111111111111111111111111112"
            }
        });

        expect(latestConfig?.params).toEqual({
            cluster: "mainnet",
            inputMint: "So11111111111111111111111111111111111111112"
        });
    });
});
