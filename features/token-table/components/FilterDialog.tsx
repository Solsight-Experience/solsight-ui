import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TokenFilterRequest } from "@/types/filter";
import { LoadingSpinner } from "@/components/loading";
import { useCategories } from "../hooks/useTokenFilter";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { CurrencyFormatter, DecimalFormatter, INumberFormatter, Locale } from "@/lib/number-formatters";
import { ShieldCheck, Flame, Link2, LockKeyhole, BarChart2, Layers, Tag } from "lucide-react";

enum FilterTabList {
    METRICS = "Metrics",
    AUDITS = "Audits",
    CATEGORIES = "Categories"
}

export interface FilterFormData {
    // Metrics
    age_min_minutes: number | null;
    age_max_minutes: number | null;
    liquidity_min: number | null;
    liquidity_max: number | null;
    market_cap_min: number | null;
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
        <Tabs defaultValue={FilterTabList.METRICS} className="w-full">
            <TabsList className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 h-auto gap-1">
                {tabList.map((tab) => (
                    <TabsTrigger
                        key={tab}
                        value={tab}
                        className="flex-1 rounded-lg text-[11px] font-semibold tracking-wide uppercase py-2 
                                   data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 data-[state=active]:after:hidden
                                   data-[state=active]:shadow-[0_0_0_1px_rgba(139,92,246,0.3)]
                                   text-white/40 hover:text-white/70 after:hidden transition-all duration-200"
                    >
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value={FilterTabList.METRICS} className="mt-0">
                <MetricsFilterList formData={formData} onFormChange={onFormChange} />
            </TabsContent>

            <TabsContent value={FilterTabList.AUDITS} className="mt-0">
                <AuditsFilterList formData={formData} onFormChange={onFormChange} />
            </TabsContent>

            <TabsContent value={FilterTabList.CATEGORIES} className="mt-0">
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

function AuditsFilterList({ formData, onFormChange }: { formData: FilterFormData; onFormChange: (data: Partial<FilterFormData>) => void }) {
    const handleCheckboxChange = (field: keyof FilterFormData, checked: boolean) => {
        onFormChange({ [field]: checked });
    };

    const auditItems = [
        {
            field: "mint_authority_disabled" as keyof FilterFormData,
            label: "Mint Auth Disabled",
            description: "Token cannot mint new supply",
            icon: <LockKeyhole className="w-4 h-4" />,
            color: "emerald",
            checked: formData.mint_authority_disabled
        },
        {
            field: "freeze_authority_disabled" as keyof FilterFormData,
            label: "Freeze Disabled",
            description: "Wallets cannot be frozen",
            icon: <ShieldCheck className="w-4 h-4" />,
            color: "blue",
            checked: formData.freeze_authority_disabled
        },
        {
            field: "has_social_links" as keyof FilterFormData,
            label: "Has Social Links",
            description: "At least one social presence",
            icon: <Link2 className="w-4 h-4" />,
            color: "violet",
            checked: formData.has_social_links
        },
        {
            field: "lp_burnt" as keyof FilterFormData,
            label: "LP Burnt",
            description: "Liquidity pool tokens burned",
            icon: <Flame className="w-4 h-4" />,
            color: "orange",
            checked: formData.lp_burnt
        }
    ];

    const colorMap: Record<string, string> = {
        emerald: "border-emerald-500/30 bg-emerald-500/5 data-[active=true]:border-emerald-500/50 data-[active=true]:bg-emerald-500/10",
        blue: "border-blue-500/30 bg-blue-500/5 data-[active=true]:border-blue-500/50 data-[active=true]:bg-blue-500/10",
        violet: "border-violet-500/30 bg-violet-500/5 data-[active=true]:border-violet-500/50 data-[active=true]:bg-violet-500/10",
        orange: "border-orange-500/30 bg-orange-500/5 data-[active=true]:border-orange-500/50 data-[active=true]:bg-orange-500/10"
    };

    const iconColorMap: Record<string, string> = {
        emerald: "text-emerald-400",
        blue: "text-blue-400",
        violet: "text-violet-400",
        orange: "text-orange-400"
    };

    /** Static indicator dot classes — dynamic template literals don't work with Tailwind JIT */
    const indicatorCheckedMap: Record<string, string> = {
        emerald: "border-emerald-400 bg-emerald-400",
        blue: "border-blue-400 bg-blue-400",
        violet: "border-violet-400 bg-violet-400",
        orange: "border-orange-400 bg-orange-400"
    };

    return (
        <div className="py-4 grid grid-cols-2 gap-2.5">
            {auditItems.map((item) => (
                <button
                    key={item.field}
                    type="button"
                    data-active={item.checked}
                    onClick={() => handleCheckboxChange(item.field, !item.checked)}
                    className={cn(
                        "relative flex flex-col gap-2 p-3.5 rounded-xl border cursor-pointer text-left",
                        "transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
                        colorMap[item.color]
                    )}
                >
                    <div className="flex items-start justify-between">
                        <span className={cn("opacity-80", iconColorMap[item.color])}>{item.icon}</span>
                        <div
                            className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                item.checked ? indicatorCheckedMap[item.color] : "border-white/20 bg-transparent"
                            )}
                        >
                            {item.checked && (
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-[12px] font-semibold text-white/90 leading-tight">{item.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 leading-snug">{item.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}

function CategoriesFilterList({ formData, onFormChange }: { formData: FilterFormData; onFormChange: (data: Partial<FilterFormData>) => void }) {
    const { data, isLoading, error } = useCategories();

    const handleCategoryToggle = (slug: string, checked: boolean) => {
        if (slug === "all") {
            onFormChange({ categories: [] });
        } else {
            const newCategories = checked ? [...formData.categories, slug] : formData.categories.filter((c) => c !== slug);
            onFormChange({ categories: newCategories });
        }
    };

    const isAllSelected = formData.categories.length === 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center py-10 gap-2">
                <span className="text-red-400 text-sm">Failed to load categories</span>
            </div>
        );
    }

    const categories = data?.categories ?? [];

    return (
        <div className="py-4 space-y-3">
            {/* All categories pill */}
            <button
                type="button"
                onClick={() => handleCategoryToggle("all", true)}
                className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left",
                    "transition-all duration-150",
                    isAllSelected
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                        : "border-white/[0.07] bg-white/[0.03] text-white/50 hover:border-white/15 hover:text-white/70"
                )}
            >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[12px] font-semibold">All Categories</span>
                {isAllSelected && (
                    <span className="ml-auto text-[10px] font-bold tracking-wider bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">ACTIVE</span>
                )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="text-[10px] font-semibold tracking-wider text-white/25 uppercase">or select</span>
                <div className="h-px flex-1 bg-white/[0.05]" />
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(139,92,246,0.2)_transparent]">
                {categories.map((category) => {
                    const isSelected = formData.categories.includes(category.slug);
                    return (
                        <button
                            key={category.slug}
                            type="button"
                            onClick={() => handleCategoryToggle(category.slug, !isSelected)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border text-left",
                                "transition-all duration-150 text-[11px] font-medium",
                                isSelected
                                    ? "border-violet-500/40 bg-violet-500/12 text-violet-300"
                                    : "border-white/[0.06] bg-white/[0.025] text-white/50 hover:border-white/12 hover:text-white/70"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 transition-all",
                                    isSelected ? "border-violet-400 bg-violet-500" : "border-white/20"
                                )}
                            >
                                {isSelected && (
                                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="truncate">{category.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

type FilterFieldProps = {
    label: string;
    unit?: string;
    icon?: ReactNode;
    minValue: number;
    maxValue: number;
    onMinChange: (value: number | string) => void;
    onMaxChange: (value: number | null) => void;
    inputFormatter: INumberFormatter;
};

function FilterField({ label, unit, icon, minValue, maxValue, onMinChange, onMaxChange, inputFormatter }: FilterFieldProps) {
    const inputClass = cn(
        "w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5",
        "text-[12px] font-mono text-white/80 text-right placeholder:text-white/20",
        "focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5",
        "transition-all duration-150",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    );

    return (
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-1 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
            {/* Label */}
            <div className="flex items-center gap-2 min-w-0">
                {icon && <span className="text-violet-400/60 shrink-0">{icon}</span>}
                <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white/75 leading-none">{label}</p>
                    {unit && <p className="text-[10px] text-white/30 mt-0.5">{unit}</p>}
                </div>
            </div>

            {/* Inputs */}
            <div className="flex items-center gap-1.5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold tracking-wider text-white/25 uppercase text-center">Min</span>
                    <NumbericInput
                        value={minValue}
                        onChange={(val) => {
                            if (val !== null && !isNaN(val)) onMinChange(val);
                        }}
                        formatter={inputFormatter}
                        className={inputClass}
                        style={{ width: "90px" }}
                    />
                </div>
                <span className="text-white/20 text-[12px] mt-3.5">–</span>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold tracking-wider text-white/25 uppercase text-center">Max</span>
                    <NumbericInput
                        value={maxValue}
                        onChange={(val) => {
                            if (val !== null && !isNaN(val)) onMaxChange(val);
                        }}
                        formatter={inputFormatter}
                        className={inputClass}
                        style={{ width: "90px" }}
                    />
                </div>
            </div>
        </div>
    );
}
