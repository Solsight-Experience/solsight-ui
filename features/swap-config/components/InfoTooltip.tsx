"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const InfoTooltip = ({ content, className }: { content: string; className?: string }) => {
    return (
        <div title={content}>
            <Info className={cn("h-3 w-3 text-(--text-muted)", className)} />
        </div>
    );
};
