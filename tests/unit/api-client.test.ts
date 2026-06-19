import { beforeEach, describe, expect, it } from "vitest";
import { axiosClient } from "@/lib/network-requests/api-client";
import useClusterStore from "@/stores/cluster.store";
import { ApiRequest, HttpTransport } from "@/lib/network-requests/http-transport";
import { DefaultApiClient } from "@/lib/network-requests/impl/DefaultApiClient";

describe("apiClient", () => {
    let latestRequest: ApiRequest | undefined;
    let client: DefaultApiClient;

    beforeEach(() => {
        latestRequest = undefined;
        useClusterStore.setState({ cluster: "devnet" });

        const transport: HttpTransport = {
            request: async <T>(request: ApiRequest) => {
                latestRequest = request;
                return {} as T;
            }
        };
        client = new DefaultApiClient(transport);
    });

    it("routes resource paths through the browser /api base path", async () => {
        await client.get("/auth/login");

        expect(axiosClient.defaults.baseURL).toBe("/api");
        expect(latestRequest?.url).toBe("/auth/login");
    });

    it("does not inject cluster into auth requests", async () => {
        await client.get("/auth/login");

        expect(latestRequest?.params).toEqual({});
    });

    it("injects cluster into non-auth API requests", async () => {
        await client.get("/swap/quote");

        expect(latestRequest?.params).toEqual({ cluster: "devnet" });
    });

    it("preserves an explicitly provided cluster param", async () => {
        await client.get("/swap/quote", {
            params: {
                cluster: "mainnet",
                inputMint: "So11111111111111111111111111111111111111112"
            }
        });

        expect(latestRequest?.params).toEqual({
            cluster: "mainnet",
            inputMint: "So11111111111111111111111111111111111111112"
        });
    });
});
