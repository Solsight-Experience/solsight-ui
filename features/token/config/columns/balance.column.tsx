import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";
import { LastActiveTimer } from "../../components/LastActiveTimer";
import { compactFormatter } from "@/lib/formatters";

export const balanceColumn: ColumnDef<Holder> = {
    id: "balance",
    header: "SOL Balance (Last Active)",
    cell: ({ row }) => {
        const { balance, last_active_ts } = row.original;
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-(--text-muted)">≡</span>
                <span className="text-(--text-primary)">{compactFormatter.format(balance)}</span>
                <span className="text-(--text-muted)">
                    (<LastActiveTimer timestamp={last_active_ts} />)
                </span>
            </div>
        );
    }
};
