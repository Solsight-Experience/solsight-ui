import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Cluster = "mainnet" | "devnet";

interface ClusterState {
    cluster: Cluster;
    setCluster: (c: Cluster) => void;
}

/**
 * Cluster store - persisted to localStorage under `solsight.cluster`.
 * SSR-safe: defaults to `mainnet` when window/localStorage are not available.
 */
export const useClusterStore = create<ClusterState>()(
    persist(
        (set) => ({
            cluster: "mainnet",
            setCluster: (c: Cluster) => set({ cluster: c })
        }),
        {
            name: "solsight.cluster",
            // Custom storage wrapper so imports are SSR-safe (no direct access to window during SSR)
            storage: {
                getItem: (name: string) => {
                    if (typeof window === "undefined") return null;
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    try {
                        return JSON.parse(str);
                    } catch (e) {
                        return null;
                    }
                },
                // persist expects a generic value type; accept any to satisfy types
                setItem: (name: string, value: any) => {
                    if (typeof window === "undefined") return;
                    try {
                        localStorage.setItem(name, value);
                    } catch (e) {
                        // ignore
                    }
                },
                removeItem: (name: string) => {
                    if (typeof window === "undefined") return;
                    try {
                        localStorage.removeItem(name);
                    } catch (e) {
                        // ignore
                    }
                }
            }
        }
    )
);

export default useClusterStore;
