"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    ExternalLink,
    AlertTriangle,
    Coins,
    ArrowRightLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Bell,
    Copy,
    Check,
    ChevronDown,
    ArrowDownLeft,
    ArrowUpRight,
    Repeat2
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWatchedPositions, useWatchedActivities } from "../hooks/useWatchedPortfolio";
import { useWatchlistStore } from "../store/watchlistStore";
import { WalletAlertsTab } from "./WalletAlertsTab";

// ── Helpers ──────────────────────────────────────────────────────────────────

const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-6)}`;

const formatAmount = (value: number): string => {
    let decimals = 2;
    if (value !== 0 && Math.abs(value) < 1) {
        decimals = Math.max(2, -Math.floor(Math.log10(Math.abs(value))) + 1);
    }
    return value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

const toRelativeTime = (unixSeconds: number): string => {
    const diff = Math.floor(Date.now() / 1000) - unixSeconds;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(unixSeconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatUSD = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const formatChange = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
};

// ── TokenLogo ─────────────────────────────────────────────────────────────────

// Jupiter CDN covers the vast majority of Solana tokens
const jupiterLogoUrl = (address: string) => `https://img.jup.ag/tokens/${address}`;

const TokenLogo: React.FC<{ address?: string; uri?: string; symbol: string; size?: string }> = ({ address, uri, symbol, size = "size-5" }) => {
    // Try: explicit uri → Jupiter CDN by address → fallback avatar
    const sources = [uri, address ? jupiterLogoUrl(address) : undefined].filter(Boolean) as string[];
    const [idx, setIdx] = useState(0);

    // Reset when the token changes so stale failure state doesn't skip a valid URL
    const srcKey = sources[0] ?? symbol;
    React.useEffect(() => {
        setIdx(0);
    }, [srcKey]);

    if (idx < sources.length) {
        return (
            <img
                src={sources[idx]}
                alt={symbol}
                className={`${size} rounded-full object-cover shrink-0 bg-white/[0.06]`}
                onError={() => setIdx((i) => i + 1)}
            />
        );
    }
    return (
        <div className={`${size} rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-bold text-white/60 shrink-0`}>
            {symbol?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ rows?: number; height?: string }> = ({ rows = 5, height = "h-12" }) => (
    <div className="flex flex-col gap-2 mt-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className={`${height} rounded-xl bg-white/[0.04] animate-pulse`} />
        ))}
    </div>
);

// ── Activity type config ──────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
    SWAP: {
        label: "Swap",
        icon: <Repeat2 className="size-3" />,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20"
    },
    TRANSFER_IN: {
        label: "Received",
        icon: <ArrowDownLeft className="size-3" />,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    TRANSFER_OUT: {
        label: "Sent",
        icon: <ArrowUpRight className="size-3" />,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
    }
};

const getTypeConfig = (type: string) =>
    TYPE_CONFIG[type] ?? {
        label: type.replace(/_/g, " "),
        icon: <ArrowRightLeft className="size-3" />,
        color: "text-gray-400",
        bg: "bg-white/[0.05]",
        border: "border-white/[0.08]"
    };

// ── Positions Tab ─────────────────────────────────────────────────────────────

const PositionsTab: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
    const { data, isLoading, error } = useWatchedPositions(walletAddress, { sort_by: "value" });

    if (isLoading) return <Skeleton rows={5} />;

    if (error)
        return (
            <div className="flex items-center gap-2 text-red-400 text-sm py-10 justify-center">
                <AlertTriangle className="size-4" /> Failed to load positions
            </div>
        );

    if (!data?.positions?.length) return <div className="text-white/30 text-sm py-10 text-center">No positions found</div>;

    return (
        <div className="mt-4 rounded-xl border border-white/[0.06] overflow-hidden">
            <table className="w-full table-fixed">
                <colgroup>
                    <col className="w-[36%]" />
                    <col className="w-[20%]" />
                    <col className="w-[24%]" />
                    <col className="w-[20%]" />
                </colgroup>
                <thead>
                    <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">Asset</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">Balance</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">Price / 24h</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-white/30">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {data.positions.map((position, idx) => (
                        <tr key={position.token.address} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors last:border-0`}>
                            <td className="px-4 py-3">
                                <Link
                                    href={`/token/${position.token.address}`}
                                    target="_blank"
                                    className="flex items-center gap-2.5 hover:text-violet-400 transition-colors group"
                                >
                                    <TokenLogo address={position.token.address} uri={position.token.logo_uri} symbol={position.token.symbol} size="size-7" />
                                    <div>
                                        <div className="text-[12px] font-semibold text-white group-hover:text-violet-400 transition-colors">
                                            {position.token.symbol}
                                        </div>
                                        {position.token.name && <div className="text-[10px] text-white/30 truncate max-w-[100px]">{position.token.name}</div>}
                                    </div>
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-[12px] text-white/70 font-mono">
                                {position.balance >= 1000
                                    ? position.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })
                                    : formatAmount(position.balance)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-[12px] text-white/80">${formatAmount(position.current_price)}</div>
                                <div className={`text-[10px] font-medium ${position.price_change_24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {formatChange(position.price_change_24h)}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right text-[12px] font-semibold text-white">{formatUSD(position.value_usd)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ── Activity Filter Dropdown ──────────────────────────────────────────────────

const ActivityFilter: React.FC<{
    selected: Set<ActivityFilterType>;
    onToggle: (type: ActivityFilterType) => void;
    onToggleAll: () => void;
}> = ({ selected, onToggle, onToggleAll }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const label = selected.size === ALL_TYPES.length ? "All types" : [...selected].map((t) => FILTER_LABELS[t]).join(", ");

    return (
        <div ref={ref} className="relative self-start">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-semibold
                    transition-all duration-200 whitespace-nowrap
                    ${
                        open
                            ? "bg-white/[0.10] border-white/30 text-white shadow-[0_0_16px_rgba(255,255,255,0.06)]"
                            : "bg-white/[0.05] border-white/[0.12] text-white/70 hover:bg-white/[0.09] hover:border-white/25 hover:text-white"
                    }`}
            >
                <ArrowRightLeft className="size-3.5" />
                {label}
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    className="absolute left-0 top-[calc(100%+6px)] z-20
                        min-w-[160px] rounded-xl border border-white/[0.10]
                        bg-[#0d1117] shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                        py-1 flex flex-col"
                >
                    {/* All option */}
                    {(() => {
                        const allChecked = selected.size === ALL_TYPES.length;
                        return (
                            <button
                                onClick={() => {
                                    if (!allChecked)
                                        ALL_TYPES.forEach((t) => {
                                            if (!selected.has(t)) onToggle(t);
                                        });
                                    else onToggleAll();
                                }}
                                className="flex items-center justify-between gap-3 px-3 py-2.5
                           text-[12px] font-medium transition-colors border-b border-white/[0.07]
                           hover:bg-white/[0.05]"
                            >
                                <span className={`flex items-center gap-2 ${allChecked ? "text-white" : "text-white/50"}`}>All types</span>
                                <span
                                    className={`size-4 rounded flex items-center justify-center border transition-colors
                                  ${allChecked ? "bg-white/10 border-white/30" : "border-white/[0.15] bg-transparent"}`}
                                >
                                    {allChecked && <Check className="size-2.5 text-white" />}
                                </span>
                            </button>
                        );
                    })()}

                    {ALL_TYPES.map((type) => {
                        const cfg = getTypeConfig(type);
                        const active = selected.has(type);
                        return (
                            <button
                                key={type}
                                onClick={() => onToggle(type)}
                                className="flex items-center justify-between gap-3 px-3 py-2.5
                           text-[12px] font-medium transition-colors
                           hover:bg-white/[0.05]"
                            >
                                <span className={`flex items-center gap-2 ${active ? cfg.color : "text-white/50"}`}>
                                    {cfg.icon}
                                    {FILTER_LABELS[type]}
                                </span>
                                <span
                                    className={`size-4 rounded flex items-center justify-center border transition-colors
                                  ${active ? `${cfg.bg} ${cfg.border}` : "border-white/[0.15] bg-transparent"}`}
                                >
                                    {active && <Check className={`size-2.5 ${cfg.color}`} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Activity Tab ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ALL_TYPES = ["SWAP", "TRANSFER_IN", "TRANSFER_OUT", "STAKE", "UNSTAKE"] as const;
type ActivityFilterType = (typeof ALL_TYPES)[number];

const FILTER_LABELS: Record<ActivityFilterType, string> = {
    SWAP: "Swap",
    TRANSFER_IN: "Received",
    TRANSFER_OUT: "Sent",
    STAKE: "Stake",
    UNSTAKE: "Unstake"
};

// ── Single activity row ───────────────────────────────────────────────────────
const ActivityRow: React.FC<{ activity: any; isLast: boolean }> = ({ activity, isLast }) => {
    const cfg = getTypeConfig(activity.type);
    const isSwap = activity.type === "SWAP";
    const tokenIn = activity.token_in;
    const tokenOut = activity.token_out;
    const transferToken =
        activity.type === "TRANSFER_OUT"
            ? (tokenIn ?? activity.token)
            : activity.type === "TRANSFER_IN"
              ? (tokenOut ?? activity.token)
              : (activity.token ?? null);
    const appName = activity.app?.name && activity.app.name !== "Unknown" ? activity.app.name : null;

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.025] transition-colors
                     ${!isLast ? "border-b border-white/[0.05]" : ""}`}
        >
            {/* Type badge */}
            <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border
                       text-[11px] font-semibold whitespace-nowrap shrink-0 w-[82px] justify-center
                       ${cfg.bg} ${cfg.border} ${cfg.color}`}
            >
                {cfg.icon}
                {cfg.label}
            </div>

            {/* Content — swap vs transfer */}
            <div className="flex-1 min-w-0">
                {isSwap && tokenIn && tokenOut ? (
                    /* ── Swap row ── */
                    <div className="flex items-center gap-2">
                        {/* Token in */}
                        <div className="flex items-center gap-2 min-w-0">
                            <TokenLogo
                                key={tokenIn.address || tokenIn.symbol}
                                address={tokenIn.address}
                                uri={tokenIn.logo_uri}
                                symbol={tokenIn.symbol}
                                size="size-8"
                            />
                            <div className="min-w-0">
                                <div className="text-[13px] font-bold text-white leading-tight truncate">{tokenIn.symbol}</div>
                                <div className="text-[11px] font-mono text-red-400 tabular-nums leading-tight">-{formatAmount(tokenIn.amount)}</div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div
                            className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full
                            bg-white/[0.05] border border-white/[0.08]"
                        >
                            <ArrowRight className="size-3 text-white/40" />
                        </div>

                        {/* Token out */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <TokenLogo
                                key={tokenOut.address || tokenOut.symbol}
                                address={tokenOut.address}
                                uri={tokenOut.logo_uri}
                                symbol={tokenOut.symbol}
                                size="size-8"
                            />
                            <div className="min-w-0">
                                <div className="text-[13px] font-bold text-white leading-tight truncate">{tokenOut.symbol}</div>
                                <div className="text-[11px] font-mono text-emerald-400 tabular-nums leading-tight">+{formatAmount(tokenOut.amount)}</div>
                            </div>
                        </div>

                        {/* DEX name */}
                        {appName && (
                            <span
                                className="shrink-0 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20
                               text-[10px] font-semibold text-violet-400"
                            >
                                {appName}
                            </span>
                        )}
                    </div>
                ) : transferToken ? (
                    /* ── Transfer row ── */
                    <div className="flex items-center gap-2.5">
                        <TokenLogo
                            key={transferToken.address || transferToken.symbol}
                            address={transferToken.address}
                            uri={transferToken.logo_uri}
                            symbol={transferToken.symbol}
                            size="size-8"
                        />
                        <div>
                            <div className="text-[13px] font-bold text-white leading-tight">{transferToken.symbol}</div>
                            <div
                                className={`text-[11px] font-mono tabular-nums leading-tight
                              ${activity.type === "TRANSFER_IN" ? "text-emerald-400" : "text-red-400"}`}
                            >
                                {activity.type === "TRANSFER_IN" ? "+" : "-"}
                                {formatAmount(transferToken.amount)}
                            </div>
                        </div>
                        {appName && (
                            <span
                                className="ml-1 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]
                               text-[10px] font-medium text-white/35"
                            >
                                {appName}
                            </span>
                        )}
                    </div>
                ) : (
                    /* ── Other row ── */
                    <div className="flex items-center gap-2">
                        {appName && <span className="text-[12px] text-white/50">{appName}</span>}
                        <span className="text-[11px] text-white/25">{activity.type.replace(/_/g, " ")}</span>
                    </div>
                )}
            </div>

            {/* Time + link */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-white/30 tabular-nums whitespace-nowrap" title={new Date(activity.timestamp * 1000).toLocaleString()}>
                    {toRelativeTime(activity.timestamp)}
                </span>
                <a
                    href={activity.tx_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-white/30
                     hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                >
                    <ExternalLink className="size-3.5" />
                </a>
            </div>
        </div>
    );
};

const ActivityTab: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<ActivityFilterType>>(new Set(["SWAP"]));
    const { data, isLoading, error } = useWatchedActivities(walletAddress, { limit: 50 });

    const toggleType = (type: ActivityFilterType) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
                if (next.size === 0) return prev;
            } else {
                next.add(type);
            }
            return next;
        });
        setPage(1);
    };

    if (isLoading) return <Skeleton rows={6} height="h-[72px]" />;

    if (error)
        return (
            <div className="flex items-center gap-2 text-red-400 text-sm py-10 justify-center">
                <AlertTriangle className="size-4" /> Failed to load activity
            </div>
        );

    if (!data?.activities?.length) return <div className="text-white/30 text-sm py-10 text-center">No activity found</div>;

    const activities = data.activities.filter((a) => selected.has(a.type as ActivityFilterType));
    const totalPages = Math.ceil(activities.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const paginated = activities.slice(start, start + PAGE_SIZE);

    return (
        <div className="flex flex-col gap-3 mt-4">
            <ActivityFilter
                selected={selected}
                onToggle={toggleType}
                onToggleAll={() => {
                    setSelected(new Set(["SWAP"]));
                    setPage(1);
                }}
            />

            {!activities.length && <div className="text-white/30 text-sm py-10 text-center">No activity for selected filters</div>}

            {!!activities.length && (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    {paginated.map((activity, idx) => (
                        <ActivityRow key={activity.tx_hash} activity={activity} isLast={idx === paginated.length - 1} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/25 tabular-nums">
                        {start + 1}–{Math.min(start + PAGE_SIZE, activities.length)} of {activities.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => p - 1)}
                            disabled={page === 1}
                            className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/[0.08]
                         text-white/40 hover:text-white hover:border-white/20 disabled:opacity-25
                         disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="size-3.5" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${i}`} className="w-7 text-center text-[11px] text-white/25">
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all
                      ${
                          page === p
                              ? "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.4)] [color:white]"
                              : "border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20"
                      }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page === totalPages}
                            className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/[0.08]
                         text-white/40 hover:text-white hover:border-white/20 disabled:opacity-25
                         disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="size-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── CopyButton ────────────────────────────────────────────────────────────────

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center justify-center w-6 h-6 rounded-md text-white/30
                 hover:text-white/70 hover:bg-white/[0.06] transition-all"
            title="Copy address"
        >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const WatchedWalletDetail: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
    const { activeTab, setActiveTab } = useWatchlistStore();

    return (
        <div className="p-5 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-white font-mono tracking-tight">{shortenAddress(walletAddress)}</span>
                        <CopyButton text={walletAddress} />
                    </div>
                    <div className="text-[10px] text-white/25 mt-0.5 font-mono">{walletAddress}</div>
                </div>
                <a
                    href={`https://solscan.io/account/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08]
                     text-[11px] text-white/40 hover:text-violet-400 hover:border-violet-500/30
                     hover:bg-violet-500/[0.06] transition-all"
                >
                    Solscan <ExternalLink className="size-3" />
                </a>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                <TabsList>
                    <TabsTrigger value="positions">
                        <Coins className="size-3.5" />
                        Positions
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                        <ArrowRightLeft className="size-3.5" />
                        Activity
                    </TabsTrigger>
                    <TabsTrigger value="alerts">
                        <Bell className="size-3.5" />
                        Alerts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="positions">
                    <PositionsTab walletAddress={walletAddress} />
                </TabsContent>
                <TabsContent value="activity">
                    <ActivityTab walletAddress={walletAddress} />
                </TabsContent>
                <TabsContent value="alerts">
                    <WalletAlertsTab walletAddress={walletAddress} />
                </TabsContent>
            </Tabs>
        </div>
    );
};
