"use client";

import { useFilterStore } from "@/stores/filter.stores";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const MetricsTab = () => {
    const { activeTab, tokenMetrics, poolMetrics, setTokenMetric, setPoolMetric } = useFilterStore();

    const isTokenTab = activeTab === "token";

    const tokenFields = [
        { key: "age_min_minutes" as const, label: "Token Age (min)", placeholder: "Min age" },
        { key: "age_max_minutes" as const, label: "Token Age (max)", placeholder: "Max age" },
        { key: "liquidity_min" as const, label: "Liquidity (min)", placeholder: "Min $" },
        { key: "liquidity_max" as const, label: "Liquidity (max)", placeholder: "Max $" },
        { key: "market_cap_min" as const, label: "Market Cap (min)", placeholder: "Min $" },
        { key: "market_cap_max" as const, label: "Market Cap (max)", placeholder: "Max $" },
        { key: "volume_24h_min" as const, label: "Volume 24h (min)", placeholder: "Min $" },
        { key: "volume_24h_max" as const, label: "Volume 24h (max)", placeholder: "Max $" },
        { key: "txns_24h_min" as const, label: "Transactions 24h (min)", placeholder: "Min count" },
        { key: "txns_24h_max" as const, label: "Transactions 24h (max)", placeholder: "Max count" },
        { key: "holders_min" as const, label: "Holders (min)", placeholder: "Min count" },
        { key: "holders_max" as const, label: "Holders (max)", placeholder: "Max count" },
        { key: "price_change_24h_min" as const, label: "Price Change 24h (min)", placeholder: "Min %" },
        { key: "price_change_24h_max" as const, label: "Price Change 24h (max)", placeholder: "Max %" }
    ];

    const poolFields = [
        { key: "fee_min_percent" as const, label: "Fee (min %)", placeholder: "Min %" },
        { key: "fee_max_percent" as const, label: "Fee (max %)", placeholder: "Max %" },
        { key: "age_min_minutes" as const, label: "Pool Age (min)", placeholder: "Min minutes" },
        { key: "age_max_minutes" as const, label: "Pool Age (max)", placeholder: "Max minutes" },
        { key: "liquidity_min" as const, label: "Liquidity (min)", placeholder: "Min $" },
        { key: "liquidity_max" as const, label: "Liquidity (max)", placeholder: "Max $" },
        { key: "volume_24h_min" as const, label: "Volume 24h (min)", placeholder: "Min $" },
        { key: "volume_24h_max" as const, label: "Volume 24h (max)", placeholder: "Max $" },
        { key: "apr_min" as const, label: "APR (min %)", placeholder: "Min %" },
        { key: "apr_max" as const, label: "APR (max %)", placeholder: "Max %" }
    ];

    return (
        <div className="space-y-4 mt-4">
            <h3 className="text-sm font-medium text-muted-foreground">{isTokenTab ? "Token Metrics" : "Pool Metrics"}</h3>

            <div className="grid gap-4">
                {isTokenTab ? (
                    <>
                        {tokenFields.map(({ key, label, placeholder }) => (
                            <div key={key} className="grid grid-cols-4 items-center gap-2">
                                <Label className="col-span-1 text-xs">{label}</Label>
                                <div className="col-span-3">
                                    <Input
                                        type="number"
                                        placeholder={placeholder}
                                        value={tokenMetrics[key] === "" ? "" : String(tokenMetrics[key])}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? "" : Number(e.target.value);
                                            setTokenMetric(key, value);
                                        }}
                                        className="text-right text-xs h-8"
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {poolFields.map(({ key, label, placeholder }) => (
                            <div key={key} className="grid grid-cols-4 items-center gap-2">
                                <Label className="col-span-1 text-xs">{label}</Label>
                                <div className="col-span-3">
                                    <Input
                                        type="number"
                                        placeholder={placeholder}
                                        value={poolMetrics[key] === "" ? "" : String(poolMetrics[key])}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? "" : Number(e.target.value);
                                            setPoolMetric(key, value);
                                        }}
                                        className="text-right text-xs h-8"
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
