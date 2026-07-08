import { ColumnDef } from "@tanstack/react-table";
import type { Holder } from "../types/token.types";
import { rankColumn } from "./columns/rank.column";
import { createWalletColumn } from "./columns/wallet.column";
import { balanceColumn } from "./columns/balance.column";
import { boughtColumn } from "./columns/bought.column";
import { soldColumn } from "./columns/sold.column";
import { unrealizedColumn } from "./columns/unrealized.column";
import { remainingColumn } from "./columns/remaining.column";
import { fundingColumn } from "./columns/funding.column";
import { heldColumn } from "./columns/held.column";

export interface HoldersColumnsOptions {
    tokenSymbol?: string;
    visibleColumns: Record<string, boolean>;
}

export function createHoldersColumns({ tokenSymbol, visibleColumns }: HoldersColumnsOptions): ColumnDef<Holder>[] {
    const cols: ColumnDef<Holder>[] = [rankColumn, createWalletColumn(tokenSymbol)];

    if (visibleColumns.balance) cols.push(balanceColumn);
    if (visibleColumns.bought) cols.push(boughtColumn);
    if (visibleColumns.sold) cols.push(soldColumn);
    if (visibleColumns.unrealized) cols.push(unrealizedColumn);
    if (visibleColumns.remaining) cols.push(remainingColumn);
    if (visibleColumns.funding) cols.push(fundingColumn);
    if (visibleColumns.held) cols.push(heldColumn);

    return cols;
}
