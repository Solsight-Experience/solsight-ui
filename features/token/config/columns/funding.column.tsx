import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { FundingIcon } from "../../components/FundingIcon";
import { DurationFormatter } from "@/lib/number-formatters";

const durationFormatter = new DurationFormatter();

export const fundingColumn: ColumnDef<Holder> = {
    id: "funding",
    header: "Funding",
    cell: ({ row }) => {
        const { funding_label, first_tx_time } = row.original;
        return funding_label ? (
            <div className="flex flex-col">
                <FundingIcon label={funding_label} />
                <span className="text-(--text-muted) text-[10px]">{durationFormatter.format(first_tx_time)} • ≡ 0.01 • 1</span>
            </div>
        ) : (
            <span className="text-(--text-muted)">—</span>
        );
    }
};
