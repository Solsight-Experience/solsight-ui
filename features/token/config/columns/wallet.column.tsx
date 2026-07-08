import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Filter, ExternalLink } from "lucide-react";
import type { Holder } from "../../types/token.types";
import { WalletHoverCard } from "../../components/WalletHoverCard";
import { HoldersTableSettings } from "../../components/HoldersTableSettings";
import { AccountTypeBadge } from "../../components/AccountTypeBadge";
import { StatBadge } from "../../components/StatBadge";

export function createWalletColumn(tokenSymbol?: string): ColumnDef<Holder> {
    return {
        id: "wallet",
        header: () => (
            <div className="flex items-center gap-1.5">
                <HoldersTableSettings />
                Wallet
            </div>
        ),
        cell: ({ row }) => {
            const holder = row.original;
            const shortAddr = `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`;
            const isLP = holder.account_type === "LP";

            return (
                <WalletHoverCard holder={holder} tokenSymbol={tokenSymbol}>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                            <Filter className="w-3.5 h-3.5 text-(--text-muted) hover:text-(--text-primary) cursor-pointer" />
                            <ExternalLink className="w-3.5 h-3.5 text-(--text-muted) hover:text-(--text-primary) cursor-pointer" />
                        </div>
                        {isLP ? (
                            <AccountTypeBadge type={holder.account_type} />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-(--text-primary) font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                    {holder.name || shortAddr}
                                </span>
                                {holder.tx_count > 1 && <StatBadge value={holder.tx_count} />}
                                {holder.account_type === "DEV" && <StatBadge value="DEV" variant="muted" />}
                                {holder.account_type === "CEX" && <StatBadge value="CEX" variant="muted" />}
                            </div>
                        )}
                    </div>
                </WalletHoverCard>
            );
        }
    };
}
