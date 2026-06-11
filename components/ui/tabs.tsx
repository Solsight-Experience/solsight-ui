"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex items-center gap-0 border-b border-white/[0.06] w-full", className)} {...props} />
    );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "relative inline-flex items-center gap-1.5 px-4 py-2.5",
                "text-[11px] font-semibold tracking-[0.07em] uppercase whitespace-nowrap",
                "text-white/35 transition-colors duration-150",
                "hover:text-white/70",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full",
                "after:bg-transparent after:transition-colors after:duration-150",
                "data-[state=active]:text-white data-[state=active]:after:bg-violet-500",
                "focus-visible:outline-none",
                "disabled:pointer-events-none disabled:opacity-30",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:opacity-70",
                className
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
