"use client";

import { useFilterStore } from "@/stores/filter.stores";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const categories = [
    { key: "MEME", label: "Meme Token" },
    { key: "GameFi", label: "GameFi Token" },
    { key: "Infrastructure", label: "Infrastructure" },
    { key: "AI", label: "AI Token" },
    { key: "DeFi", label: "DeFi" }
];

const protocols = [
    { key: "Raydium CLMM", label: "Raydium CLMM" },
    { key: "Orca", label: "Orca" },
    { key: "Meteora", label: "Meteora" },
    { key: "Jupiter", label: "Jupiter" }
];

export const CategoriesTab = () => {
    const { activeTab, categories: selectedCategories, protocols: selectedProtocols, tokens, setCategories, setProtocols, setTokens } = useFilterStore();

    const handleCategoryChange = (categoryKey: string, checked: boolean) => {
        if (checked) {
            setCategories([...selectedCategories, categoryKey]);
        } else {
            setCategories(selectedCategories.filter((c) => c !== categoryKey));
        }
    };

    const handleProtocolChange = (protocolKey: string, checked: boolean) => {
        if (checked) {
            setProtocols([...selectedProtocols, protocolKey]);
        } else {
            setProtocols(selectedProtocols.filter((p) => p !== protocolKey));
        }
    };

    const handleTokensChange = (value: string) => {
        const tokenList = value
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        setTokens(tokenList);
    };

    return (
        <div className="space-y-6 mt-4">
            {activeTab === "token" && (
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {categories.map(({ key, label }) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={key}
                                    checked={selectedCategories.includes(key)}
                                    onCheckedChange={(checked) => {
                                        if (checked === "indeterminate") return;
                                        handleCategoryChange(key, checked);
                                    }}
                                />
                                <Label htmlFor={key} className="text-sm cursor-pointer">
                                    {label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "pool" && (
                <>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Protocols</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {protocols.map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={selectedProtocols.includes(key)}
                                        onCheckedChange={(checked) => {
                                            if (checked === "indeterminate") return;
                                            handleProtocolChange(key, checked);
                                        }}
                                    />
                                    <Label htmlFor={key} className="text-sm cursor-pointer">
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Tokens</h3>
                        <div>
                            <Label htmlFor="tokens-input" className="text-xs text-muted-foreground">
                                Token addresses or symbols (comma-separated)
                            </Label>
                            <Input
                                id="tokens-input"
                                placeholder="SOL, USDC, EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                                value={tokens.join(", ")}
                                onChange={(e) => handleTokensChange(e.target.value)}
                                className="text-xs mt-1"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
