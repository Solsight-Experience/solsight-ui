import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { useSwapInfo } from "@/features/swap/hooks/use-swap-info";
import { ExecutorCapability, type SwapInfoResponse } from "@/features/swap/types";
import { serializeAllSwapConfig } from "@/features/swap-config/serialize";
import { useSwapConfigStore } from "@/features/swap-config/store";
import { antiMevItem } from "@/features/swap-config/items/anti-mev-item";
import { gaslessItem } from "@/features/swap-config/items/gasless-item";
import type { ConfigCtx } from "@/features/swap-config/core/types";
import { useClusterStore } from "@/stores/cluster.store";

function createSwapInfo(executorKey: "jupiter" | "solsight", capabilities: ExecutorCapability[]): SwapInfoResponse {
    return {
        autoPriorityFeeLamports: 100_000,
        autoTipLamports: 50_000,
        autoSlippageBps: null,
        maxAutoFeeLamports: 450_000,
        executorKey,
        capabilities,
        gaslessEnabled: capabilities.includes(ExecutorCapability.Gasless),
        gaslessSupportedTokens: capabilities.includes(ExecutorCapability.Gasless) ? ["InputMint"] : [],
        payerPubkey: capabilities.includes(ExecutorCapability.Gasless) ? "PayerPubkey" : null
    };
}

function createContext(swapInfo: SwapInfoResponse): ConfigCtx {
    return {
        swapInfo,
        pair: {
            quote: { mint: "InputMint", symbol: "IN", decimals: 6 },
            receive: { mint: "OutputMint", symbol: "OUT", decimals: 6 }
        },
        getItemState: () => undefined
    };
}

describe("swap executor capabilities", () => {
    it("shows Anti-MEV only for Jupiter and gasless only for capable Solsight Executor", () => {
        const mainnetContext = createContext(createSwapInfo("jupiter", [ExecutorCapability.MevProtection]));
        const devnetContext = createContext(createSwapInfo("solsight", [ExecutorCapability.Gasless]));

        expect(antiMevItem.isVisible(mainnetContext)).toBe(true);
        expect(gaslessItem.isVisible(mainnetContext)).toBe(false);
        expect(antiMevItem.isVisible(devnetContext)).toBe(false);
        expect(gaslessItem.isVisible(devnetContext)).toBe(true);
    });

    it("does not serialize hidden executor-specific configuration", () => {
        const states = {
            ...useSwapConfigStore.getState().items,
            antiMev: { value: "sec" },
            gasless: { value: "quote" }
        };
        const mainnetConfig = serializeAllSwapConfig(states, createContext(createSwapInfo("jupiter", [ExecutorCapability.MevProtection])));
        const devnetConfig = serializeAllSwapConfig(states, createContext(createSwapInfo("solsight", [ExecutorCapability.Gasless])));

        expect(mainnetConfig).toMatchObject({ antiMevRpc: "sec" });
        expect(mainnetConfig).not.toHaveProperty("gaslessFeeToken");
        expect(devnetConfig).toMatchObject({ gaslessFeeToken: "InputMint" });
        expect(devnetConfig).not.toHaveProperty("antiMevRpc");
    });

    it("partitions swap-info queries by cluster", () => {
        act(() => useClusterStore.setState({ cluster: "mainnet" }));
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
        const { rerender } = renderHook(() => useSwapInfo({ inputMint: "InputMint", outputMint: "OutputMint", enabled: false }), { wrapper });

        expect(queryClient.getQueryCache().find({ queryKey: ["swap-info", "mainnet", "InputMint", "OutputMint"] })).toBeDefined();

        act(() => {
            useClusterStore.setState({ cluster: "devnet" });
            rerender();
        });

        expect(queryClient.getQueryCache().find({ queryKey: ["swap-info", "devnet", "InputMint", "OutputMint"] })).toBeDefined();
    });
});
