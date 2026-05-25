"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useClusterStore from "@/stores/cluster.store";

export default function ClusterToggle() {
    const cluster = useClusterStore((s) => s.cluster);
    const setCluster = useClusterStore((s) => s.setCluster);

    return (
        <div className="flex items-center">
            <Tabs value={cluster} onValueChange={(v) => setCluster(v as "mainnet" | "devnet")}>
                <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 flex">
                    <TabsTrigger
                        value="mainnet"
                        className={`px-3 py-1 rounded-md text-[12px] font-semibold ${cluster === "mainnet" ? "bg-white/[0.06] text-white" : "text-white/60"}`}
                    >
                        Mainnet
                    </TabsTrigger>
                    <TabsTrigger
                        value="devnet"
                        className={`ml-1 px-3 py-1 rounded-md text-[12px] font-semibold ${cluster === "devnet" ? "bg-white/[0.06] text-white" : "text-white/60"}`}
                    >
                        Devnet
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
