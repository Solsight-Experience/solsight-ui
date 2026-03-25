import { Notification } from "../types/notification.types";
import { NotificationIcon } from "./NotificationIcon";

function formatRelativeTime(dateStr: string): string {
    const now = new Date().getTime();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
    isLast?: boolean;
}

export function NotificationItem({ notification, onClick, isLast }: NotificationItemProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 p-3 w-full text-left
                 transition-colors duration-150 hover:bg-white/[0.04]
                 animate-in fade-in-50 slide-in-from-left-2 duration-200
                 ${!notification.isRead ? "border-l-2 border-violet-500 bg-violet-500/[0.06]" : "border-l-2 border-transparent"}
                 ${!isLast ? "border-b border-white/[0.06]" : ""}`}
        >
            {/* Icon container */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.05] shrink-0">
                <NotificationIcon type={notification.type} size={16} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-white/90 truncate">{notification.title}</p>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-snug mt-0.5">{notification.message}</p>
            </div>

            {/* Relative time */}
            <span className="text-[10px] text-white/30 shrink-0 self-start mt-0.5">{formatRelativeTime(notification.createdAt)}</span>
        </button>
    );
}
