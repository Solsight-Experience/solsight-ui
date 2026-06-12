"use client";

import { useFilterStore } from "@/stores/filter.stores";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const categories = [
    { key: "MEME", label: "Meme Token" },
    { key: "GameFi", label: "GameFi Token" },
    { key: "Infrastructure", label: "Infrastructure" },
    { key: "AI", label: "AI Token" },
    { key: "DeFi", label: "DeFi" }
];

export const CategoriesTab = () => {
    const { categories: selectedCategories, setCategories } = useFilterStore();

    const handleCategoryChange = (categoryKey: string, checked: boolean) => {
        if (checked) {
            setCategories([...selectedCategories, categoryKey]);
        } else {
            setCategories(selectedCategories.filter((c) => c !== categoryKey));
        }
    };

    return (
        <div className="space-y-6 mt-4">
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
        </div>
    );
};
