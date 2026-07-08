import React, { useEffect, useMemo, useRef, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useHolders } from "../hooks/token.hooks";
import { useTokenUIStore } from "../stores/token.stores";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/loading";
import { compactFormatter } from "@/lib/formatters";
import { createHoldersColumns } from "../config/holders.columns";
import { TokenSocketManager } from "../services/token.socket.services";

const PAGE_SIZE = 20;

function SocketStatusDot({ connected }: { connected: boolean }) {
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
            <span className={connected ? "text-(--text-muted)" : "text-amber-400"}>{connected ? "Live" : "Reconnecting…"}</span>
        </div>
    );
}

const HoldersSummary: React.FC<{
    loadedCount: number;
    total: number;
    top10Percent: number;
    top20Percent: number;
}> = ({ loadedCount, total, top10Percent, top20Percent }) => {
    const summaryItems = [
        { label: "Total Holders", value: compactFormatter.format(total) },
        { label: "Top 10", value: `${top10Percent.toFixed(1)}%` },
        { label: "Top 20", value: `${top20Percent.toFixed(1)}%` },
        { label: "Loaded", value: compactFormatter.format(loadedCount) }
    ];

    return (
        <div className="grid grid-cols-2 gap-2 border-b border-(--border-subtle) bg-(--surface-card) px-3 py-3 sm:grid-cols-4">
            {summaryItems.map((item) => (
                <div key={item.label} className="min-w-0">
                    <div className="text-[10px] font-medium uppercase text-(--text-muted)">{item.label}</div>
                    <div className="truncate text-sm font-semibold text-(--text-primary)">{item.value}</div>
                </div>
            ))}
        </div>
    );
};

interface HoldersTableProps {
    tokenAddress: string;
    tokenSymbol?: string;
}

export const HoldersTable: React.FC<HoldersTableProps> = ({ tokenAddress, tokenSymbol }) => {
    const { data: holdersData, isLoading, isError } = useHolders(tokenAddress, { limit: 100 });
    const { holdersTableColumns } = useTokenUIStore();
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [socketConnected, setSocketConnected] = useState(true);

    useEffect(() => {
        const socket = TokenSocketManager.getInstance().getSocket();
        const onConnect = () => setSocketConnected(true);
        const onDisconnect = () => setSocketConnected(false);
        setSocketConnected(socket.connected);
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    const allHolders = holdersData?.holders ?? [];
    const visibleHolders = allHolders.slice(0, visibleCount);
    const hasMore = visibleCount < allHolders.length;

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setVisibleCount((c) => Math.min(c + PAGE_SIZE, allHolders.length));
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, allHolders.length]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [tokenAddress]);

    const columns = useMemo(() => createHoldersColumns({ tokenSymbol, visibleColumns: holdersTableColumns }), [tokenSymbol, holdersTableColumns]);

    const table = useReactTable({
        data: visibleHolders,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-center py-8 text-(--text-muted)">Failed to load holders — retry</div>;
    }

    if (!holdersData?.holders || holdersData.holders.length === 0) {
        return <div className="text-center py-8 text-(--text-muted)">No holder data available</div>;
    }

    const totalHolders = holdersData.summary.total_holders || holdersData.total || holdersData.holders.length;
    const top10Percent = holdersData.summary.top_10_holding_percent;
    const top20Percent = holdersData.summary.top_20_holding_percent;

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            <HoldersSummary loadedCount={allHolders.length} total={totalHolders} top10Percent={top10Percent} top20Percent={top20Percent} />
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-(--border-subtle)">
                <SocketStatusDot connected={socketConnected} />
            </div>
            <div className="flex-1 overflow-auto w-full relative group scrollbar-thin pb-4">
                <Table className="whitespace-nowrap min-w-250">
                    <TableHeader className="sticky top-0 z-20 bg-(--surface-card) backdrop-blur-md text-xs text-(--text-muted) border-b border-(--border-subtle) shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-(--border-subtle) hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="py-2 px-2 font-medium text-(--text-muted) h-auto">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} className="border-b border-(--border-faint) hover:bg-(--surface-btn) text-[13px] group">
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-2.5 px-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div ref={sentinelRef} className="h-1" />
                {hasMore && (
                    <div className="flex items-center justify-center py-4 gap-2 text-(--text-muted) text-xs">
                        <LoadingSpinner size="sm" />
                        Loading more...
                    </div>
                )}
                {!hasMore && allHolders.length > 0 && (
                    <div className="flex items-center justify-center py-3 text-(--text-muted) text-xs">All holders loaded</div>
                )}
            </div>
        </div>
    );
};
