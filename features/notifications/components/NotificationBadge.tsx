interface NotificationBadgeProps {
    count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
    if (count === 0) return null;

    return (
        <span
            className="absolute -top-1 -right-1 bg-red-500 !text-white text-[9px]
                 border-2 border-background rounded-full min-w-[16px] h-[16px] px-1
                 font-semibold animate-in zoom-in-75 duration-150
                 flex items-center justify-center"
        >
            {count > 9 ? "9+" : count}
        </span>
    );
}
