import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterDialogProps, FilterFormData } from "../types/Filterdialog.types";
import { MetricsFilterList } from "./MetricsFilterList";
import { AuditsFilterList } from "./AuditsFilterList";
import { CategoriesFilterList } from "./CategoriesFilterList";

enum FilterTabList {
    METRICS = "Metrics",
    AUDITS = "Audits",
    CATEGORIES = "Categories"
}

// Which FilterFormData fields belong to which tab — used to hide a whole tab
// when none of its fields are visible (see visibleFields below).
const TAB_FIELDS: Record<FilterTabList, (keyof FilterFormData)[]> = {
    [FilterTabList.METRICS]: [
        "age_min_minutes",
        "age_max_minutes",
        "liquidity_min",
        "liquidity_max",
        "market_cap_min",
        "market_cap_max",
        "volume_24h_min",
        "volume_24h_max",
        "txns_24h_min",
        "txns_24h_max"
    ],
    [FilterTabList.AUDITS]: ["mint_authority_disabled", "freeze_authority_disabled", "lp_burnt", "has_social_links"],
    [FilterTabList.CATEGORIES]: ["categories"]
};

export default function FilterDialog({ formData, onFormChange, visibleFields }: FilterDialogProps) {
    const isFieldVisible = (field: keyof FilterFormData) => !visibleFields || visibleFields.includes(field);
    const visibleTabs = Object.values(FilterTabList).filter((tab) => TAB_FIELDS[tab].some(isFieldVisible));

    const tabContent: Record<FilterTabList, ReactNode> = {
        [FilterTabList.METRICS]: <MetricsFilterList formData={formData} onFormChange={onFormChange} isFieldVisible={isFieldVisible} />,
        [FilterTabList.AUDITS]: <AuditsFilterList formData={formData} onFormChange={onFormChange} isFieldVisible={isFieldVisible} />,
        [FilterTabList.CATEGORIES]: <CategoriesFilterList formData={formData} onFormChange={onFormChange} />
    };

    // A single visible tab reads as noise — render its content directly, without the tab strip.
    if (visibleTabs.length <= 1) {
        return visibleTabs[0] ? tabContent[visibleTabs[0]] : null;
    }

    return (
        <Tabs defaultValue={visibleTabs[0]} className="w-full">
            <TabsList className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 h-auto gap-1">
                {visibleTabs.map((tab) => (
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

            {visibleTabs.map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                    {tabContent[tab]}
                </TabsContent>
            ))}
        </Tabs>
    );
}

export type { FilterFormData } from "../types/Filterdialog.types";
export { getFilterRequestBody } from "../utils/Filterdialog.utils";
