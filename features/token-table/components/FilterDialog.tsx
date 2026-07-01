import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterDialogProps } from "../types/Filterdialog.types";
import { MetricsFilterList } from "./MetricsFilterList";
import { AuditsFilterList } from "./AuditsFilterList";
import { CategoriesFilterList } from "./CategoriesFilterList";

enum FilterTabList {
    METRICS = "Metrics",
    AUDITS = "Audits",
    CATEGORIES = "Categories"
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

export type { FilterFormData } from "../types/Filterdialog.types";
export { getFilterRequestBody } from "../utils/Filterdialog.utils";
