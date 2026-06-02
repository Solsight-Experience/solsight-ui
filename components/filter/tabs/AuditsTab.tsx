"use client";

import { useMemo } from "react";
import { useFilterStore } from "@/stores/filter.stores";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";

const audits = [
    {
        key: "mint_authority_disabled" as const,
        label: "Mint Authority Disabled",
        description: "Cannot mint new tokens"
    },
    {
        key: "freeze_authority_disabled" as const,
        label: "Freeze Authority Disabled",
        description: "Cannot freeze token accounts"
    },
    {
        key: "lp_burnt" as const,
        label: "LP Burnt",
        description: "Liquidity provider tokens burned"
    },
    {
        key: "has_social_links" as const,
        label: "Has Social Links",
        description: "Token has social media presence"
    }
];

export const AuditsTab = () => {
    const { tokenAudits, setTokenAudit } = useFilterStore();
    const formatter = useMemo(() => new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 0 }), []);

    return (
        <div className="space-y-4 mt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Token Security Audits</h3>

            <div className="space-y-4">
                {audits.map(({ key, label, description }) => (
                    <div key={key} className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2 mt-1">
                            <Checkbox
                                id={key}
                                checked={tokenAudits[key] === true}
                                onCheckedChange={(checked) => {
                                    if (checked === "indeterminate") return;
                                    setTokenAudit(key, checked ? true : null);
                                }}
                            />
                            <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                                {label}
                            </Label>
                        </div>
                    </div>
                ))}

                {/* Risk Score Range */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Risk Score Range</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="min-risk" className="text-xs text-muted-foreground">
                                Min Score (0-100)
                            </Label>
                            <NumbericInput
                                id="min-risk"
                                formatter={formatter}
                                min={0}
                                max={100}
                                step={1}
                                showStepper
                                placeholder="0"
                                value={tokenAudits.min_risk_score === "" ? null : (tokenAudits.min_risk_score as number)}
                                onChange={(value) => setTokenAudit("min_risk_score", value === null ? "" : value)}
                                className="text-xs h-8"
                            />
                        </div>
                        <div>
                            <Label htmlFor="max-risk" className="text-xs text-muted-foreground">
                                Max Score (0-100)
                            </Label>
                            <NumbericInput
                                id="max-risk"
                                formatter={formatter}
                                min={0}
                                max={100}
                                step={1}
                                showStepper
                                placeholder="100"
                                value={tokenAudits.max_risk_score === "" ? null : (tokenAudits.max_risk_score as number)}
                                onChange={(value) => setTokenAudit("max_risk_score", value === null ? "" : value)}
                                className="text-xs h-8"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Lower scores indicate higher risk</p>
                </div>
            </div>
        </div>
    );
};
