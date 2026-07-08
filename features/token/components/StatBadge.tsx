import React from "react";

interface StatBadgeProps {
    value: number | string;
    variant?: "default" | "muted";
}

export const StatBadge: React.FC<StatBadgeProps> = ({ value, variant = "default" }) => (
    <span
        className={`text-[10px] px-1 py-0.5 rounded ${variant === "muted" ? "bg-(--surface-btn) text-(--text-muted)" : "bg-(--surface-btn) text-(--text-secondary)"}`}
    >
        {value}
    </span>
);
