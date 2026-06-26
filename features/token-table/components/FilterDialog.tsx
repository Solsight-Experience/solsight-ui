import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TokenFilterRequest } from "@/types/filter";
import { LoadingSpinner } from "@/components/loading";
import { useCategories } from "../hooks/useTokenFilter";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { CurrencyFormatter, DecimalFormatter, INumberFormatter, Locale } from "@/lib/number-formatters";

enum FilterTabList {
    METRICS = "Metrics",
    AUDITS = "Audits",
    CATEGORIES = "Categories"
}

export interface FilterFormData {
    // Metrics
    age_min_minutes: number;
    age_max_minutes: number | null;
    liquidity_min: number;
    liquidity_max: number | null;
    market_cap_min: number;
    market_cap_max: number | null;
    volume_24h_min: number;
    volume_24h_max: number | null;
    txns_24h_min: number;
    txns_24h_max: number | null;

    // Audits
    mint_authority_disabled: boolean;
    freeze_authority_disabled: boolean;
    lp_burnt: boolean;
    has_social_links: boolean;

    // Categories
    categories: string[];
}

export interface FilterDialogProps {
    formData: FilterFormData;
    onFormChange: (data: Partial<FilterFormData>) => void;
}

export default function FilterDialog({ formData, onFormChange }: FilterDialogProps) {
    const tabList = Object.values(FilterTabList);

    return (
        <Tabs defaultValue={FilterTabList.METRICS}>
            <TabsList className="w-full">
                {tabList.map((tab) => (
                    <TabsTrigger key={tab} value={tab}>
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value={FilterTabList.METRICS}>
                <MetricsFilterList formData={formData} onFormChange={onFormChange} />
            </TabsContent>

            <TabsContent value={FilterTabList.AUDITS}>
                <AuditsFilterList formData={formData} onFormChange={onFormChange} />
            </TabsContent>

            <TabsContent value={FilterTabList.CATEGORIES}>
                <CategoriesFilterList formData={formData} onFormChange={onFormChange} />
            </TabsContent>
        </Tabs>
    );
}

export function getFilterRequestBody(formData: FilterFormData): TokenFilterRequest {
    const tokenRequest: TokenFilterRequest = {};

    // Metrics — each bound is independent; 0 means "not set"
    const metrics: TokenFilterRequest["metrics"] = {};
    if (formData.volume_24h_min) metrics.volume_24h_min = formData.volume_24h_min;
    if (formData.volume_24h_max) metrics.volume_24h_max = formData.volume_24h_max;
    if (formData.txns_24h_min) metrics.txns_24h_min = formData.txns_24h_min;
    if (formData.txns_24h_max) metrics.txns_24h_max = formData.txns_24h_max;
    if (formData.liquidity_min) metrics.liquidity_min = formData.liquidity_min;
    if (formData.liquidity_max) metrics.liquidity_max = formData.liquidity_max;
    if (formData.market_cap_min) metrics.market_cap_min = formData.market_cap_min;
    if (formData.market_cap_max) metrics.market_cap_max = formData.market_cap_max;
    if (formData.age_min_minutes) metrics.age_min_minutes = formData.age_min_minutes;
    if (formData.age_max_minutes) metrics.age_max_minutes = formData.age_max_minutes;

    if (Object.keys(metrics).length > 0) {
        tokenRequest.metrics = metrics;
    }

    // Audits
    const audit_filters: TokenFilterRequest["audit_filters"] = {};
    if (formData.mint_authority_disabled) {
        audit_filters.mint_authority_disabled = true;
    }
    if (formData.freeze_authority_disabled) {
        audit_filters.freeze_authority_disabled = true;
    }
    if (formData.lp_burnt) {
        audit_filters.lp_burnt = true;
    }
    if (formData.has_social_links) {
        audit_filters.has_social_links = true;
    }

    if (Object.keys(audit_filters).length > 0) {
        tokenRequest.audit_filters = audit_filters;
    }

    // Categories
    if (formData.categories.length > 0) {
        tokenRequest.categories = formData.categories;
    }

    return tokenRequest;
}

function MetricsFilterList({ formData, onFormChange }: { formData: FilterFormData; onFormChange: (data: Partial<FilterFormData>) => void }) {
    const handleFieldChange = (field: keyof FilterFormData, value: string | number | null) => {
        onFormChange({ [field]: value });
    };

    return (
        <FilterListContainer>
            <FilterField
                label="Token Age"
                placeholder="minutes"
                minValue={formData.age_min_minutes}
                maxValue={formData.age_max_minutes}
                onMinChange={(value) => handleFieldChange("age_min_minutes", value)}
                onMaxChange={(value) => handleFieldChange("age_max_minutes", value)}
                inputFormatter={new DecimalFormatter({ compact: true })}
            />
            <FilterField
                label="Liquidity"
                prefix="$"
                minValue={formData.liquidity_min}
                maxValue={formData.liquidity_max}
                onMinChange={(value) => handleFieldChange("liquidity_min", value)}
                onMaxChange={(value) => handleFieldChange("liquidity_max", value)}
                inputFormatter={new CurrencyFormatter(Locale.US)}
            />
            <FilterField
                label="Market Cap"
                prefix="$"
                minValue={formData.market_cap_min}
                maxValue={formData.market_cap_max}
                onMinChange={(value) => handleFieldChange("market_cap_min", value)}
                onMaxChange={(value) => handleFieldChange("market_cap_max", value)}
                inputFormatter={new CurrencyFormatter()}
            />
            <FilterField
                label="Volume"
                prefix="$"
                minValue={formData.volume_24h_min}
                maxValue={formData.volume_24h_max}
                onMinChange={(value) => handleFieldChange("volume_24h_min", value)}
                onMaxChange={(value) => handleFieldChange("volume_24h_max", value)}
                inputFormatter={new CurrencyFormatter()}
            />
            <FilterField
                label="Txns"
                minValue={formData.txns_24h_min}
                maxValue={formData.txns_24h_max}
                onMinChange={(value) => handleFieldChange("txns_24h_min", value)}
                onMaxChange={(value) => handleFieldChange("txns_24h_max", value)}
                inputFormatter={new DecimalFormatter({ compact: true })}
            />
        </FilterListContainer>
    );
}

function AuditsFilterList({ formData, onFormChange }: { formData: FilterFormData; onFormChange: (data: Partial<FilterFormData>) => void }) {
    const handleCheckboxChange = (field: keyof FilterFormData, checked: boolean) => {
        onFormChange({ [field]: checked });
    };

    return (
        <FilterListContainer className="grid grid-cols-1 md:grid-cols-2 px-4">
            <FilterCheckBoxField
                label="Mint Auth Disable"
                checked={formData.mint_authority_disabled}
                onCheckedChange={(checked) => handleCheckboxChange("mint_authority_disabled", checked)}
            />
            <FilterCheckBoxField
                label="Freezable Disabled"
                checked={formData.freeze_authority_disabled}
                onCheckedChange={(checked) => handleCheckboxChange("freeze_authority_disabled", checked)}
            />
            <FilterCheckBoxField
                label="At least 1 Social"
                checked={formData.has_social_links}
                onCheckedChange={(checked) => handleCheckboxChange("has_social_links", checked)}
            />
            <FilterCheckBoxField label="Burnt" checked={formData.lp_burnt} onCheckedChange={(checked) => handleCheckboxChange("lp_burnt", checked)} />
        </FilterListContainer>
    );
}

function CategoriesFilterList({ formData, onFormChange }: { formData: FilterFormData; onFormChange: (data: Partial<FilterFormData>) => void }) {
    const { data, isLoading, error } = useCategories();

    const handleCategoryToggle = (slug: string, checked: boolean) => {
        if (slug === "all") {
            // "All Categories" clears the filter
            onFormChange({ categories: [] });
        } else {
            const newCategories = checked ? [...formData.categories, slug] : formData.categories.filter((c) => c !== slug);
            onFormChange({ categories: newCategories });
        }
    };

    const isAllSelected = formData.categories.length === 0;

    if (isLoading) {
        return (
            <FilterListContainer className="grid grid-cols-1 px-4">
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            </FilterListContainer>
        );
    }

    if (error) {
        return (
            <FilterListContainer className="grid grid-cols-1 px-4">
                <div className="text-center py-8 text-red-500">Failed to load categories</div>
            </FilterListContainer>
        );
    }

    const categories = data?.categories ?? [];

    return (
        <FilterListContainer className="grid grid-cols-1 px-4">
            <FilterCheckBoxField label="All Categories" checked={isAllSelected} onCheckedChange={(checked) => handleCategoryToggle("all", checked)} />
            {categories.map((category) => (
                <FilterCheckBoxField
                    key={category.slug}
                    label={category.name}
                    checked={formData.categories.includes(category.slug)}
                    onCheckedChange={(checked) => handleCategoryToggle(category.slug, checked)}
                />
            ))}
        </FilterListContainer>
    );
}

function FilterListContainer({ className, children }: { children: ReactNode; className?: string }) {
    return <div className={cn("space-y-4 my-5", className)}>{children}</div>;
}

type FilterFieldProps = {
    label: string;
    placeholder?: string;
    prefix?: string;
    minValue: number;
    maxValue: number | null;
    onMinChange: (value: number | string) => void;
    onMaxChange: (value: number | null) => void;
    inputFormatter: INumberFormatter;
};

function FilterField({ label, placeholder, prefix, minValue, maxValue, onMinChange, onMaxChange, inputFormatter }: FilterFieldProps) {
    const hasError = maxValue !== null && minValue > maxValue;
    const inputClassName =
        "text-right rounded-2xl [appearance:textfield] [::-webkit-inner-spin-button]:appearance-none [::-webkit-outer-spin-button]:appearance-none";

    return (
        <div className="grid grid-cols-4 gap-y-1">
            <Label className="col-span-1 self-center">{label}</Label>
            <div className="flex items-center col-span-3 gap-2">
                <NumbericInput
                    value={minValue}
                    onChange={(val) => {
                        if (val !== null && !isNaN(val)) onMinChange(val);
                    }}
                    formatter={inputFormatter}
                    placeholder={placeholder}
                    prefix={prefix}
                    className={inputClassName}
                />
                <span>~</span>
                <NumbericInput
                    value={maxValue}
                    onChange={(val) => onMaxChange(val !== null && !isNaN(val) ? val : null)}
                    onFocus={() => {
                        if (maxValue === null) onMaxChange(0);
                    }}
                    formatter={inputFormatter}
                    placeholder="∞"
                    prefix={prefix}
                    className={inputClassName}
                />
            </div>
            {hasError && <p className="col-start-2 col-span-3 text-xs text-red-500 mt-0.5">Min must not exceed max</p>}
        </div>
    );
}

type FilterCheckBoxFieldProps = {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
};

function FilterCheckBoxField({ label, checked, onCheckedChange }: FilterCheckBoxFieldProps) {
    return (
        <div className="flex items-center gap-4">
            <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
            <Label>{label}</Label>
        </div>
    );
}
