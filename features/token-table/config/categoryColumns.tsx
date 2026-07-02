import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CategoryOverview } from "./types";
import { cn } from "@/lib/utils";
import { currencyFormatter } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Category Table Columns
 * Configuration for the Categories tab based on new Discovery API
 */
export const categoryColumns: ColumnDef<CategoryOverview>[] = [
    {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
        size: 180
    },
    {
        accessorKey: "top_3_coins",
        header: "Top Tokens",
        cell: ({ row }) => (
            <div className="flex -space-x-2">
                {row.original.top_3_coins?.slice(0, 3).map((tokenUrl, idx) => (
                    <Avatar
                        key={idx}
                        className="h-8 w-8 border-2 border-white bg-white cursor-pointer transition-transform hover:scale-110 hover:z-10"
                        title={row.original.top_3_coins_id?.[idx]}
                    >
                        <AvatarImage src={tokenUrl} />
                        <AvatarFallback className="bg-gray-800 text-xs font-semibold text-white">
                            {row.original.top_3_coins_id?.[idx]?.slice(0, 2).toUpperCase() || "T"}
                        </AvatarFallback>
                    </Avatar>
                ))}
            </div>
        ),
        size: 120
    },
    {
        accessorKey: "volume_24h",
        header: () => <span className="block text-right">Volume (24h)</span>,
        cell: ({ row }) => (
            <span className="block text-right font-medium text-purple-400">{currencyFormatter.formatCompact(row.original.volume_24h ?? 0)}</span>
        ),
        size: 120
    },
    {
        accessorKey: "market_cap",
        header: () => <span className="block text-right">Market Cap</span>,
        cell: ({ row }) => <span className="block text-right font-semibold text-white">{currencyFormatter.formatCompact(row.original.market_cap)}</span>,
        size: 120
    },
    {
        accessorKey: "market_cap_change_24h",
        header: () => <span className="block text-right">Market Cap Change (24h)</span>,
        cell: ({ row }) => {
            const change = row.original.market_cap_change_24h;
            // Guard for null/undefined
            if (change === null || change === undefined) {
                return <div className="text-right text-gray-500">-</div>;
            }

            const isPositive = change > 0;
            const isNegative = change < 0;
            const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
            const accentColor = isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-muted-foreground";

            return (
                <div className="flex items-center justify-end gap-1">
                    {ChangeIcon ? <ChangeIcon className={cn("size-4", accentColor)} /> : null}
                    <span className={cn("font-medium", accentColor)}>
                        {isNegative ? "-" : isPositive ? "+" : ""}
                        {Math.abs(Number(change)).toFixed(3)}%
                    </span>
                </div>
            );
        },
        size: 140
    }
];
