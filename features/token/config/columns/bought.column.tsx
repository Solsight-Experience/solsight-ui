import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { currencyFormatter, compactFormatter } from "@/lib/formatters";

export const boughtColumn: ColumnDef<Holder> = {
    id: "bought",
    header: "Bought (Avg Buy)",
    cell: ({ row }) => {
        const { total_bought, avg_buy_price, buy_tx_count } = row.original;
        const totalBoughtUsd = total_bought * avg_buy_price;
        return (
            <div className="flex flex-col">
                <div className="flex items-center gap-1">
                    <span className="text-green-400 font-medium">{currencyFormatter.format(total_bought)}</span>
                    <span className="text-(--text-muted)">({currencyFormatter.format(totalBoughtUsd)})</span>
                </div>
                <span className="text-(--text-muted) text-xs">
                    {compactFormatter.format(total_bought / (buy_tx_count || 1))} / {buy_tx_count}
                </span>
            </div>
        );
    }
};
