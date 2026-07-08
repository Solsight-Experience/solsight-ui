import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { currencyFormatter, compactFormatter } from "@/lib/formatters";

export const soldColumn: ColumnDef<Holder> = {
    id: "sold",
    header: "Sold (Avg Sell)",
    cell: ({ row }) => {
        const { total_sold, avg_sell_price, sell_tx_count } = row.original;
        const totalSoldUsd = total_sold * avg_sell_price;
        return (
            <div className="flex flex-col">
                {total_sold > 0 ? (
                    <>
                        <div className="flex items-center gap-1">
                            <span className="text-red-400 font-medium">{currencyFormatter.format(total_sold)}</span>
                            <span className="text-(--text-muted)">({currencyFormatter.format(totalSoldUsd)})</span>
                        </div>
                        <span className="text-(--text-muted) text-xs">
                            {compactFormatter.format(total_sold / (sell_tx_count || 1))} / {sell_tx_count}
                        </span>
                    </>
                ) : (
                    <span className="text-(--text-muted)">$0</span>
                )}
            </div>
        );
    }
};
