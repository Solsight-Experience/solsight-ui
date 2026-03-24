import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

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

export function NotificationPanel() {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

    return (
        <div
            className="w-[380px] bg-[#0d1117] border border-white/10 rounded-xl
                    shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(139,92,246,0.08)]
                    overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-3 bg-purple-500/[0.06]">
                <span className="text-[14px] font-semibold text-white/90">Notifications</span>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors duration-150">
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="h-px bg-white/[0.07]" />

            {/* Body */}
            <div className="max-h-[380px] overflow-y-auto">
                {isLoading ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Bell size={48} className="text-white/20" />
                        <span className="text-[12px] text-white/30">No notifications yet</span>
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            isLast={index === notifications.length - 1}
                            onClick={() => {
                                if (!notification.isRead) {
                                    markAsRead(notification.id);
                                }
                            }}
                        />
                    ))
                )}
            </div>

            <div className="h-px bg-white/[0.07]" />

            {/* Footer */}
            <div className="px-3.5 py-2.5">
                <Link href="/notifications" className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors duration-150">
                    View all notifications
                </Link>
            </div>
        </div>
    );
}
