import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownRight, ArrowUpRight, Users, Shield, Star, Zap } from "lucide-react";
import Sparkline from "../components/Sparkline";
import TokenCell from "../components/TokenCell";
import { TokenCategory, TokenTableData } from "./types";
import { cn } from "@/lib/utils";
import { compactFormatter, currencyFormatter, percentFormatter } from "@/lib/formatters";

const categoryStyles: Record<TokenCategory, string> = {
    MEME: "bg-fuchsia-500/20 text-fuchsia-400",
    GameFi: "bg-emerald-500/20 text-emerald-400",
    Infrastructure: "bg-blue-500/20 text-blue-400",
    AI: "bg-indigo-500/20 text-indigo-400",
    DeFi: "bg-orange-500/20 text-orange-400"
};

/**
 * Creates columns with optional favorite toggle handler
 */
export const createColumns = (
    toggleFavourite?: (tokenId: string) => void,
    favouriteIds?: Set<string>,
    quickBuyAmount?: string,
    onQuickBuy?: (token: TokenTableData) => void
): ColumnDef<TokenTableData>[] => [
    {
        id: "favourite",
        header: "",
        enableHiding: false,
        size: 40,
        cell: ({ row }) => {
            const isFavourite = favouriteIds?.has(row.original.id) ?? false;

            return toggleFavourite ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(row.original.id);
                    }}
                    className="text-muted-foreground hover:text-yellow-400 transition-colors"
                    aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                    <Star size={18} className={cn(isFavourite && "fill-yellow-400 text-yellow-400")} />
                </button>
            ) : null;
        }
    },
    {
        accessorKey: "token",
        header: "Pair Info",
        cell: ({ row }) => <TokenCell token={row.original.token} />
    },
    {
        id: "sparkline",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <Sparkline points={row.original.token.priceHistory} />
    },
    {
        accessorKey: "token.category",
        header: "Category",
        cell: ({ row }) => (
            <span className={cn("rounded-full px-3 py-1 text-xs font-medium uppercase", categoryStyles[row.original.token.category])}>
                {row.original.token.category}
            </span>
        )
    },
    {
        accessorKey: "marketCap.value",
        header: () => <span className="block text-right">Market Cap</span>,
        cell: ({ row }) => {
            const marketCap = row.original.marketCap;
            const isPositive = marketCap.changePercent24h > 0;
            const isNegative = marketCap.changePercent24h < 0;
            const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
            const accentColor = isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-muted-foreground";

            return (
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-semibold">{currencyFormatter.formatCompact(Number(marketCap.value))}</span>
                    <div className="flex items-center gap-1 text-xs font-medium">
                        {ChangeIcon ? <ChangeIcon className={cn("size-4", accentColor)} /> : null}
                        <span className={accentColor}>{percentFormatter.format(marketCap.changePercent24h)}</span>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "liquidity",
        header: () => <span className="block text-right">Liquidity</span>,
        cell: ({ row }) => {
            return <span className="block text-right font-medium">{currencyFormatter.formatCompact(Number(row.original.liquidity))}</span>;
        }
    },
    {
        accessorKey: "volume24h",
        header: () => <span className="block text-right">Volume</span>,
        cell: ({ row }) => {
            const { buyVolumn, sellVolumn } = row.original.transactions;

            return (
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-medium">{currencyFormatter.formatCompact(Number(row.original.volume24h))}</span>
                    <div className="flex items-center gap-1 text-xs font-medium">
                        <span className="text-emerald-400">{compactFormatter.format(buyVolumn)}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-rose-400">{compactFormatter.format(sellVolumn)}</span>
                    </div>
                </div>
            );
        }
    },
    {
        id: "transactions",
        header: () => <span className="block text-right">TXNS</span>,
        accessorFn: (row) => row.transactions.buyCount + row.transactions.sellCount,
        cell: ({ row }) => {
            const { buyCount, sellCount } = row.original.transactions;
            const total = Number(buyCount) + Number(sellCount);

            return (
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-medium">{compactFormatter.format(total)}</span>
                    <div className="flex items-center gap-1 text-xs font-medium">
                        <span className="text-emerald-400">{compactFormatter.format(buyCount)}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-rose-400">{compactFormatter.format(sellCount)}</span>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "audit",
        header: () => <span className="block text-right">Audit</span>,
        enableSorting: false,
        cell: ({ row }) => {
            const auditData = row.original.audit;

            if (!auditData || auditData.length === 0) {
                return <div className="text-right text-white/25 text-xs">—</div>;
            }

            const risk = auditData[0] || { value: "—", label: "Risk" };
            const fees = auditData[1] || { value: "—", label: "Fees" };

            return (
                <div className="flex items-center justify-end gap-2.5">
                    {/* Risk */}
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1">
                            <Users size={10} className="text-rose-400/70 shrink-0" />
                            <span className="text-[12px] font-bold tabular-nums text-rose-400">{risk.value}</span>
                        </div>
                        <span className="text-[9px] font-semibold tracking-[0.07em] uppercase text-white/25">{risk.label || "Risk"}</span>
                    </div>

                    <div className="w-px h-6 bg-white/[0.07] shrink-0" />

                    {/* Fees */}
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1">
                            <Shield size={10} className="text-emerald-400/70 shrink-0" />
                            <span className="text-[12px] font-bold tabular-nums text-emerald-400">{fees.value}</span>
                        </div>
                        <span className="text-[9px] font-semibold tracking-[0.07em] uppercase text-white/25">{fees.label || "Fees"}</span>
                    </div>
                </div>
            );
        }
    },
    {
        id: "action",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuickBuy?.(row.original);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
                               bg-violet-500/10 border border-violet-500/20 text-violet-300
                               text-[11px] font-semibold tracking-wide
                               hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-200
                               transition-all duration-150 cursor-pointer whitespace-nowrap"
                >
                    <Zap size={10} className="shrink-0" />
                    Buy {quickBuyAmount} SOL
                </button>
            </div>
        )
    }
];

// Default export for backward compatibility
const columns = createColumns();
export default columns;
