"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error: unknown) => {
                            // Don't retry on 4xx errors
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

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
