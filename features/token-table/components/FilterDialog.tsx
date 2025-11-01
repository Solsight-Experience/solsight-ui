import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponentProps, ReactNode } from 'react';

enum FilterTabList {
    METRICS = 'Metrics',
    AUDITS = 'Audits',
    CATEGORIES = 'Categories',
}

export default function FilterDialog() {
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
                <MetricsFilterList />
            </TabsContent>

            <TabsContent value={FilterTabList.AUDITS}>
                <AuditsFilterList />
            </TabsContent>

            <TabsContent value={FilterTabList.CATEGORIES}>
                <MetricsFilterList />
            </TabsContent>
        </Tabs>
    );
}

function MetricsFilterList() {
    return (
        <FilterListContainer>
            <FilterField label="Token Age" placeholder="minutes" />
            <FilterField label="Liquidity" placeholder="$" />
            <FilterField label="Market Cap" placeholder="$" />
            <FilterField label="Volume" placeholder="$" />
            <FilterField label="Txns" />
            <FilterField label="Buys" />
            <FilterField label="Sells" />
        </FilterListContainer>
    );
}

function AuditsFilterList() {
    return (
        <FilterListContainer>
            <FilterField label="Test" />
        </FilterListContainer>
    );
}

function FilterListContainer({ children }: { children: ReactNode }) {
    return <div className="space-y-4 mt-5">{children}</div>;
}

type FilterFieldProps = {
    label: string;
} & Omit<ComponentProps<'input'>, 'className'>;

function FilterField({ label, ...props }: FilterFieldProps) {
    const input = () => (
        <Input
            type="number"
            className="text-right rounded-2xl [appearance:textfield] [::-webkit-inner-spin-button]:appearance-none [::-webkit-outer-spin-button]:appearance-none"
            {...props}
        />
    );
    return (
        <div className="grid grid-cols-4">
            <Label className="col-span-1">{label}</Label>
            <div className="flex items-center col-span-3 gap-2">
                {input()}
                <span>~</span>
                {input()}
            </div>
        </div>
    );
}
