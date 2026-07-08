import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { DurationFormatter } from "@/lib/number-formatters";

const durationFormatter = new DurationFormatter();

export const heldColumn: ColumnDef<Holder> = {
    id: "held",
    header: "Held",
    cell: ({ row }) => {
        const { first_tx_time } = row.original;
        return (
            <span className={`font-medium ${first_tx_time > Date.now() - 3600000 ? "text-green-500 dark:text-green-400" : "text-(--text-secondary)"}`}>
                {durationFormatter.format(first_tx_time)}
            </span>
        );
    }
};
