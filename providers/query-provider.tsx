"use client";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import useClusterStore from "@/stores/cluster.store";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        gcTime: 10 * 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error: unknown) => {
                            if (error && typeof error === "object" && "response" in error) {
                                const resp = error.response;
                                if (resp && typeof resp === "object" && "status" in resp) {
                                    const status = resp.status;
                                    if (typeof status === "number" && status >= 400 && status < 500) {
                                        return false;
                                    }
                                }
                            }

                            return failureCount < 3;
                        }
                    },
                    mutations: {
                        retry: false
                    }
                }
            })
    );

    const [persister] = useState(() =>
        createSyncStoragePersister({
            storage: typeof window !== "undefined" ? window.localStorage : undefined,
            key: "solsight-query-cache"
        })
    );

    // Invalidate queries when cluster changes to avoid mixing caches
    const cluster = useClusterStore((s) => s.cluster);
    // We intentionally use subscribe here to avoid re-creating queryClient
    // on every cluster change; invalidateQueries will clear old cluster data
    // use subscribe(listener) since our store doesn't expose selector overload in this build
    useState(() => {
        try {
            let prev: string | undefined = undefined;
            const unsub = useClusterStore.subscribe((s) => {
                const next = (s as any).cluster as string;
                if (prev !== next) {
                    prev = next;
                    queryClient.invalidateQueries();
                }
            });
            return () => unsub?.();
        } catch (e) {
            // ignore
        }
        return () => {};
    });

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                maxAge: 10 * 60 * 1000,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => query.queryKey[0] === "tokens"
                }
            }}
        >
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
    );
}
