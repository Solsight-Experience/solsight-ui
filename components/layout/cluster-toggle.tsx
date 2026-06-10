"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useClusterStore, { type Cluster } from "@/stores/cluster.store";

const isClusterValue = (value: string): value is Cluster => value === "mainnet" || value === "devnet";

export default function ClusterToggle() {
    const cluster = useClusterStore((s) => s.cluster);
    const setCluster = useClusterStore((s) => s.setCluster);

    return (
        <div className="flex items-center" data-testid="cluster-toggle">
            <Tabs
                value={cluster}
                onValueChange={(value) => {
                    if (isClusterValue(value)) {
                        setCluster(value);
                    }
                }}
            >
                <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 flex">
                    <TabsTrigger
                        value="mainnet"
                        data-testid="cluster-toggle-mainnet"
                        className={`px-3 py-1 rounded-md text-[12px] font-semibold ${cluster === "mainnet" ? "bg-white/[0.06] text-white" : "text-white/60"}`}
                    >
                        Mainnet
                    </TabsTrigger>
                    <TabsTrigger
                        value="devnet"
                        data-testid="cluster-toggle-devnet"
                        className={`ml-1 px-3 py-1 rounded-md text-[12px] font-semibold ${cluster === "devnet" ? "bg-white/[0.06] text-white" : "text-white/60"}`}
                    >
                        Devnet
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
