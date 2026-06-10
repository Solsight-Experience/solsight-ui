import { cn } from "@/lib/utils";
import { Flame, BarChart2, LayoutGrid, Star } from "lucide-react";
import { memo, HTMLAttributes } from "react";

export type TokenTableTabOption = "TRENDING" | "TOP" | "CATEGORIES" | "FAVOURITES";

const TAB_OPTIONS: Array<{ value: TokenTableTabOption; label: string; icon: React.ReactNode }> = [
    { value: "TRENDING", label: "Trending", icon: <Flame size={12} /> },
    { value: "TOP", label: "Top", icon: <BarChart2 size={12} /> },
    { value: "CATEGORIES", label: "Categories", icon: <LayoutGrid size={12} /> },
    { value: "FAVOURITES", label: "Favourites", icon: <Star size={12} /> }
];

interface TokenTabsProps {
    onTabClick: (tab: TokenTableTabOption) => void;
    activeTab?: TokenTableTabOption;
    showFavourites?: boolean;
}

export const TokenTabs = memo<TokenTabsProps>(function TokenTabs({ onTabClick, activeTab = "TRENDING", showFavourites = true }) {
    const visibleTabs = showFavourites ? TAB_OPTIONS : TAB_OPTIONS.filter((tab) => tab.value !== "FAVOURITES");

    return (
        <div className="flex items-center gap-1" role="tablist" aria-label="Token categories">
            {visibleTabs.map((tab) => (
                <TokenTab
                    key={tab.value}
                    title={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.value}
                    onClick={() => onTabClick(tab.value)}
                    aria-selected={activeTab === tab.value}
                />
            ))}
        </div>
    );
});

type TokenTabProps = {
    title: string;
    icon: React.ReactNode;
    isActive?: boolean;
} & HTMLAttributes<HTMLButtonElement>;

const TokenTab = memo<TokenTabProps>(function TokenTab({ className, title, icon, isActive = false, ...props }) {
    return (
        <button
            type="button"
            role="tab"
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "text-[11.5px] font-semibold tracking-[0.03em] transition-all duration-150 cursor-pointer",
                "border",
                isActive
                    ? "bg-violet-500/15 text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                    : "text-white/45 border-transparent hover:text-white/70 hover:bg-white/[0.05] hover:border-white/[0.07]",
                className
            )}
            aria-label={`${title} tab`}
            {...props}
        >
            <span className={isActive ? "text-violet-400" : "text-white/30"}>{icon}</span>
            {title}
        </button>
    );
});
