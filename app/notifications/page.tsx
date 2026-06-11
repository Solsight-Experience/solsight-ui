"use client";

import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { NotificationItem } from "@/features/notifications/components";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useTimedConfirm } from "@/features/notifications/hooks/useTimedConfirm";

function SkeletonItem() {
    return (
        <div className="flex items-center gap-3 p-3 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-white/[0.06] rounded animate-pulse w-3/4" />
                <div className="h-2 bg-white/[0.06] rounded animate-pulse w-full" />
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
                <h1 className="text-2xl font-bold text-white/90">Notifications</h1>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-sm text-violet-400 hover:text-violet-300 transition-colors duration-150">
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 &&
                        (confirmingClear ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/40">Clear all?</span>
                                <button
                                    onClick={handleClearAllCancel}
                                    className="px-3 py-1 rounded-lg text-sm text-white/40 hover:text-white/70
                                               hover:bg-white/[0.06] border border-transparent hover:border-white/10
                                               transition-all duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllConfirm}
                                    className="px-3 py-1 rounded-lg text-sm font-medium
                                               text-red-400 bg-red-500/10 border border-red-500/20
                                               hover:bg-red-500/20 transition-all duration-150"
                                >
                                    Confirm
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleClearAllClick}
                                className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-red-400 transition-colors duration-150"
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
              ${filter === tab ? "bg-violet-500/20 text-violet-300" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Card */}
            <div className="bg-white/[0.04] border border-white/[0.09] rounded-xl p-6">
                {isLoading && filteredNotifications.length === 0 ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Bell size={48} className="text-white/20" />
                        <span className="text-sm text-white/30">No notifications</span>
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
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm text-violet-400
                             hover:text-violet-300 hover:bg-violet-500/10 disabled:opacity-50
                             disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    {isLoading ? (
                                        <>
                                            <span
                                                className="w-3.5 h-3.5 rounded-full border-2 border-violet-400/40
                                       border-t-violet-400 animate-spin"
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
