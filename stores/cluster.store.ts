import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export type Cluster = "mainnet" | "devnet";

interface ClusterState {
    cluster: Cluster;
    setCluster: (c: Cluster) => void;
}

const noopStorage: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const storage = createJSONStorage<ClusterState>(() => (typeof window === "undefined" ? noopStorage : localStorage));

export const useClusterStore = create<ClusterState>()(
    persist(
        (set) => ({
            cluster: "mainnet",
            setCluster: (c: Cluster) => set({ cluster: c })
        }),
        {
            name: "solsight.cluster",
            storage
        }
    )
);

export default useClusterStore;
