"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink, Copy, Check, Trash2 } from "lucide-react";
import { Notification, NotificationEventType } from "../types/notification.types";

function relativeTime(dateStr: string): string {
    const normalized = /[Zz]|[+-]\d{2}:\d{2}$/.test(dateStr) ? dateStr : dateStr + "Z";
    const diff = Date.now() - new Date(normalized).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

function TokenLogo({ mint, logo, symbol, size = "size-7" }: { mint?: string; logo?: string; symbol?: string; size?: string }) {
    const sources = [logo, mint ? `https://img.jup.ag/tokens/${mint}` : undefined].filter(Boolean) as string[];
    const [idx, setIdx] = useState(0);
    const letter = symbol?.[0]?.toUpperCase() ?? "?";

    if (idx < sources.length) {
        return (
            <Image
                src={sources[idx]}
                alt={symbol ?? ""}
                width={28}
                height={28}
                className={`${size} rounded-full object-cover shrink-0 bg-[var(--surface-btn)]`}
                onError={() => setIdx((i) => i + 1)}
                unoptimized
            />
        );
    }
    return (
        <div
            className={`${size} rounded-full bg-[var(--surface-btn)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] shrink-0`}
        >
            {letter}
        </div>
    );
}

const BADGE_CONFIG: Partial<Record<NotificationEventType, { label: string; color: string }>> = {
    [NotificationEventType.SWAP_EXECUTED]: { label: "Swap", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    [NotificationEventType.SWAP_FAILED]: { label: "Failed", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    [NotificationEventType.TRANSACTION_CONFIRMED]: { label: "Transfer", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    [NotificationEventType.TRANSACTION_FAILED]: { label: "Failed", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    [NotificationEventType.PRICE_ALERT_TRIGGERED]: { label: "Alert", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    [NotificationEventType.SECURITY_ALERT]: { label: "Security", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    [NotificationEventType.SYSTEM_ANNOUNCEMENT]: { label: "System", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" }
};

function TypeBadge({ type }: { type: NotificationEventType }) {
    const cfg = BADGE_CONFIG[type] ?? { label: type, color: "text-[var(--text-muted)] bg-[var(--surface-btn)] border-[var(--border-subtle)]" };
    return <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-semibold shrink-0 ${cfg.color}`}>{cfg.label}</span>;
}

function LogoArea({ notification }: { notification: Notification }) {
    const meta = notification.metadata ?? {};

    if (notification.type === NotificationEventType.SWAP_EXECUTED) {
        return (
            <div className="flex items-center gap-1.5 shrink-0">
                <TokenLogo mint={meta.mintIn} logo={meta.tokenInLogo} symbol={meta.tokenIn} />
                <ArrowRight className="size-3 text-violet-400/70 shrink-0" strokeWidth={2.5} />
                <TokenLogo mint={meta.mintOut} logo={meta.tokenOutLogo} symbol={meta.tokenOut} />
            </div>
        );
    }

    if (notification.type === NotificationEventType.PRICE_ALERT_TRIGGERED) {
        return <TokenLogo mint={meta.tokenMint} logo={meta.tokenLogo} symbol={meta.tokenSymbol} />;
    }

    if (notification.type === NotificationEventType.TRANSACTION_CONFIRMED || notification.type === NotificationEventType.TRANSACTION_FAILED) {
        return <TokenLogo logo={meta.tokenLogo} symbol="SOL" />;
    }

    return (
        <div className="size-7 rounded-full bg-[var(--surface-btn)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
            <span className="text-[10px] text-[var(--text-muted)]">?</span>
        </div>
    );
}

function CopyBtn({ value, display }: { value: string; display: string }) {
    const [copied, setCopied] = useState(false);
    function handleCopy(e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }
    return (
        <button
            onClick={handleCopy}
            title={value}
            className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
            {display}
            {copied ? <Check className="size-2.5 text-emerald-400" /> : <Copy className="size-2.5" />}
        </button>
    );
}

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
    onDelete?: (id: string) => void;
    isLast?: boolean;
}

export function NotificationItem({ notification, onClick, onDelete, isLast }: NotificationItemProps) {
    const meta = notification.metadata ?? {};
    const isUnread = !notification.isRead;

    return (
        <div
            onClick={onClick}
            className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150
                  hover:bg-[var(--surface-btn)]
                  ${onDelete ? "pr-10" : ""}
                  ${isUnread ? "bg-violet-500/[0.05]" : ""}
                  ${!isLast ? "border-b border-[var(--border-faint)]" : ""}`}
        >
            {/* Unread strip */}
            {isUnread && <div className="absolute left-0 top-3.5 bottom-3.5 w-[2px] rounded-r-full bg-violet-500/70" />}

            {/* Delete button — right edge, vertically centered */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
                    title="Delete notification"
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               opacity-0 group-hover:opacity-100
                               flex items-center justify-center w-6 h-6 rounded-md
                               text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10
                               border border-transparent hover:border-red-500/20
                               transition-all duration-150"
                >
                    <Trash2 className="size-3.5" />
                </button>
            )}

            {/* Token logo(s) */}
            <div className="mt-0.5 shrink-0">
                <LogoArea notification={notification} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Row 1: type badge + title + time */}
                <div className="flex items-center gap-2 min-w-0">
                    <TypeBadge type={notification.type} />
                    <p
                        className={`text-[12px] font-semibold truncate flex-1 min-w-0 ${isUnread ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                    >
                        {notification.title}
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0 tabular-nums">{relativeTime(notification.createdAt)}</span>
                </div>

                {/* Row 2: message */}
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{String(notification?.message ?? "")}</p>

                {/* Row 3: wallet + solscan */}
                {(meta.walletShort || meta.txUrl) && (
                    <div className="flex items-center gap-2 mt-1.5">
                        {meta.walletAddress && meta.walletShort && (
                            <CopyBtn value={String(meta.walletAddress ?? "")} display={String(meta.walletShort ?? "")} />
                        )}
                        {meta.txUrl && (
                            <a
                                href={String(meta.txUrl ?? "")}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--prim-brand-light-accent)] dark:hover:text-violet-400 transition-colors ml-auto"
                            >
                                Solscan <ExternalLink className="size-2.5" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
