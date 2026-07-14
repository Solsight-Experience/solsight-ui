"use client";

import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { NotificationItem } from "@/features/notifications/components";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useTimedConfirm } from "@/features/notifications/hooks/useTimedConfirm";

function SkeletonItem() {
    return (
        <div className="flex items-center gap-3 p-3 border-b border-[var(--border-faint)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-btn)] animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-[var(--surface-btn)] rounded animate-pulse w-3/4" />
                <div className="h-2 bg-[var(--surface-btn)] rounded animate-pulse w-full" />
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const { notifications, unreadCount, hasMore, isLoading, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, loadMore } =
        useNotifications();
    const {
        confirming: confirmingClear,
        request: handleClearAllClick,
        confirm: handleClearAllConfirm,
        cancel: handleClearAllCancel
    } = useTimedConfirm(deleteAllNotifications);

    const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-[var(--prim-brand-light-accent)] hover:text-[var(--prim-brand-light-strong)]
                         dark:text-violet-400 dark:hover:text-violet-300 transition-colors duration-150"
                        >
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 &&
                        (confirmingClear ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--text-muted)]">Clear all?</span>
                                <button
                                    onClick={handleClearAllCancel}
                                    className="px-3 py-1 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                                               hover:bg-[var(--surface-btn)] border border-transparent hover:border-[var(--border-default)]
                                               transition-all duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllConfirm}
                                    className="px-3 py-1 rounded-lg text-sm font-medium
                                               text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20
                                               hover:bg-red-500/20 transition-all duration-150"
                                >
                                    Confirm
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleClearAllClick}
                                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
                            >
                                <Trash2 size={14} />
                                Clear all
                            </button>
                        ))}
                </div>
            </div>

            {/* Tab filters */}
            <div className="flex gap-1 mb-4">
                {(["all", "unread"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 capitalize
              ${
                  filter === tab
                      ? "bg-[var(--prim-brand-light-bg)] text-[var(--prim-brand-light-strong)] dark:bg-violet-500/20 dark:text-violet-300"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-btn)]"
              }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Card */}
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-[var(--shadow-card)]">
                {isLoading && filteredNotifications.length === 0 ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Bell size={48} className="text-[var(--text-disabled)]" />
                        <span className="text-sm text-[var(--text-muted)]">No notifications</span>
                    </div>
                ) : (
                    <>
                        {filteredNotifications.map((notification, index) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                isLast={index === filteredNotifications.length - 1 && !hasMore}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        markAsRead(notification.id);
                                    }
                                }}
                                onDelete={deleteNotification}
                            />
                        ))}

                        {/* Load more */}
                        {hasMore && (
                            <div className="pt-4 flex justify-center">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-[var(--prim-brand-light-accent)]
                             hover:text-[var(--prim-brand-light-strong)] dark:text-violet-400 dark:hover:text-violet-300
                             hover:bg-violet-500/10 disabled:opacity-50
                             disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    {isLoading ? (
                                        <>
                                            <span
                                                className="w-3.5 h-3.5 rounded-full border-2 border-[var(--prim-brand-light-accent)]/30
                                       border-t-[var(--prim-brand-light-accent)] dark:border-violet-400/40 dark:border-t-violet-400 animate-spin"
                                            />
                                            Loading...
                                        </>
                                    ) : (
                                        "Load more"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
