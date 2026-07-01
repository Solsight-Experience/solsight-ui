import { Flame, BarChart2, Layers } from "lucide-react";
import { CurrencyFormatter, DecimalFormatter, Locale } from "@/lib/number-formatters";
import { FilterFormData, FilterListProps } from "../FilterDialog.types";
import { FilterField } from "./FilterField";

export function MetricsFilterList({ formData, onFormChange }: FilterListProps) {
    const handleFieldChange = (field: keyof FilterFormData, value: string | number | null) => {
        onFormChange({ [field]: value });
    };

    return (
        <div className="py-4 space-y-1">
            <FilterField
                label="Token Age"
                unit="min"
                icon={<Flame className="w-3.5 h-3.5" />}
                minValue={formData.age_min_minutes ?? 0}
                maxValue={formData.age_max_minutes ?? 0}
                onMinChange={(value) => handleFieldChange("age_min_minutes", value)}
                onMaxChange={(value) => handleFieldChange("age_max_minutes", value)}
                inputFormatter={new DecimalFormatter({ compact: true })}
            />
            <FilterField
                label="Liquidity"
                unit="USD"
                icon={<Layers className="w-3.5 h-3.5" />}
                minValue={formData.liquidity_min ?? 0}
                maxValue={formData.liquidity_max ?? 0}
                onMinChange={(value) => handleFieldChange("liquidity_min", value)}
                onMaxChange={(value) => handleFieldChange("liquidity_max", value)}
                inputFormatter={new CurrencyFormatter(Locale.US)}
            />
            <FilterField
                label="Market Cap"
                unit="USD"
                icon={<BarChart2 className="w-3.5 h-3.5" />}
                minValue={formData.market_cap_min ?? 0}
                maxValue={formData.market_cap_max ?? 0}
                onMinChange={(value) => handleFieldChange("market_cap_min", value)}
                onMaxChange={(value) => handleFieldChange("market_cap_max", value)}
                inputFormatter={new CurrencyFormatter()}
            />
            <FilterField
                label="Volume 24h"
                unit="USD"
                icon={<BarChart2 className="w-3.5 h-3.5" />}
                minValue={formData.volume_24h_min ?? 0}
                maxValue={formData.volume_24h_max ?? 0}
                onMinChange={(value) => handleFieldChange("volume_24h_min", value)}
                onMaxChange={(value) => handleFieldChange("volume_24h_max", value)}
                inputFormatter={new CurrencyFormatter()}
            />
            <FilterField
                label="Txns 24h"
                unit="count"
                icon={<BarChart2 className="w-3.5 h-3.5" />}
                minValue={formData.txns_24h_min ?? 0}
                maxValue={formData.txns_24h_max ?? 0}
                onMinChange={(value) => handleFieldChange("txns_24h_min", value)}
                onMaxChange={(value) => handleFieldChange("txns_24h_max", value)}
                inputFormatter={new DecimalFormatter({ compact: true })}
            />
        </div>
    );
}
