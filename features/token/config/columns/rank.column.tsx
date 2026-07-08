import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../../types/token.types";

export const rankColumn: ColumnDef<Holder> = {
    id: "rank",
    header: "#",
    cell: ({ row }) => <span className="text-(--text-muted) font-medium">{row.index + 1}</span>
};
