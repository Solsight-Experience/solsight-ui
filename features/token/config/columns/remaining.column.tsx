import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { currencyFormatter } from "@/lib/formatters";

export const remainingColumn: ColumnDef<Holder> = {
    id: "remaining",
    header: "Remaining",
    cell: ({ row }) => {
        const { remaining_usd, balance_percent } = row.original;
        const pct = Number.isFinite(balance_percent) ? balance_percent : 0;
        return (
            <div className="flex items-center gap-2">
                <span className="text-(--text-primary)">{currencyFormatter.format(remaining_usd)}</span>
                <span className="text-green-400 text-xs">{pct.toFixed(3)}%</span>
                <div className="w-8 h-1 bg-(--surface-btn) rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(pct * 10, 100)}%` }} />
                </div>
            </div>
        );
    }
};
