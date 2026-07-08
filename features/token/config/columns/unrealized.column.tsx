import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { currencyFormatter } from "@/lib/formatters";

export const unrealizedColumn: ColumnDef<Holder> = {
    id: "unrealized",
    header: "U. PnL ↑↓",
    cell: ({ row }) => {
        const { unrealized_pnl } = row.original;
        return (
            <span className={`font-medium ${unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {unrealized_pnl >= 0 ? "+" : ""}
                {currencyFormatter.format(unrealized_pnl)}
            </span>
        );
    }
};
