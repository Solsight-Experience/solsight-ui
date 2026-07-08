import React from "react";
import { Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useTokenUIStore } from "../stores/token.stores";

const COLUMN_OPTIONS = [
    { id: "balance", label: "Bal/Last Active" },
    { id: "bought", label: "Bought/Avg MC" },
    { id: "sold", label: "Sold/Avg MC" },
    { id: "unrealized", label: "Unrealized" },
    { id: "remaining", label: "Remaining" },
    { id: "funding", label: "Funding/TF Amount" },
    { id: "held", label: "Holding Duration" }
];

export const HoldersTableSettings: React.FC = () => {
    const { holdersTableColumns, toggleHoldersTableColumn } = useTokenUIStore();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="cursor-pointer text-(--text-muted) hover:text-(--text-primary) transition-colors p-px">
                    <Settings2 className="w-3.5 h-3.5" />
                </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-50 p-2 bg-(--surface-card) backdrop-blur-md border border-(--border-subtle) shadow-xl rounded-lg">
                <div className="flex items-center px-1 pb-2 mb-1 border-b border-(--border-faint)">
                    <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-widest">Table Settings</span>
                </div>
                <div className="space-y-0.5">
                    {COLUMN_OPTIONS.map((col) => (
                        <label
                            key={col.id}
                            className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-(--surface-btn) rounded cursor-pointer group transition-colors"
                        >
                            <Checkbox
                                checked={holdersTableColumns[col.id]}
                                onCheckedChange={() => toggleHoldersTableColumn(col.id)}
                                className="border-(--border-default) data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 rounded"
                            />
                            <span className="text-xs text-(--text-muted) group-hover:text-(--text-primary) transition-colors flex-1">{col.label}</span>
                        </label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};
