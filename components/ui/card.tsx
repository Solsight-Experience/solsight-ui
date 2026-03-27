import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card" className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
                className
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />;
}

// --- Compositions ---

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    change?: number;
    isUpdating?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

function StatCard({ label, value, change, isUpdating, icon, className }: StatCardProps) {
    const isPositive = change !== undefined && change >= 0;
    return (
        <div
            data-slot="stat-card"
            className={cn(
                "flex flex-col rounded-xl border p-4 transition-all duration-300",
                isUpdating ? "border-purple-500 bg-black shadow-lg shadow-purple-500/20" : "border-border bg-card hover:border-purple-500",
                "hover:shadow-md hover:shadow-purple-500/10",
                className
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                {icon && <span className="text-muted-foreground">{icon}</span>}
            </div>
            <span className={cn("text-lg font-bold transition-all duration-300", isUpdating ? "scale-105" : "scale-100")}>{value}</span>
            {change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                    <span className={cn("text-sm font-semibold", isPositive ? "text-emerald-400" : "text-rose-400")}>
                        {isPositive ? "+" : ""}
                        {change.toFixed(2)}%
                    </span>
                </div>
            )}
        </div>
    );
}

interface PageCardProps {
    title: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

function PageCard({ title, action, children, className, contentClassName }: PageCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {action && <CardAction>{action}</CardAction>}
            </CardHeader>
            <CardContent className={contentClassName}>{children}</CardContent>
        </Card>
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, StatCard, PageCard };
export type { StatCardProps, PageCardProps };
