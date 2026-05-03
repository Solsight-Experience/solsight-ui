import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface NavigationCardProps {
    data: {
        route: string;
        label?: string;
    };
}

const routeLabel: Record<string, string> = {
    "/": "Home",
    "/token/[tokenAddress]": "Token",
    "/portfolio": "Portfolio",
    "/multi-chart": "Multi-Chart",
    "/wallet-tracker": "Wallet Tracker",
    "/notifications": "Notifications"
};

export const NavigationCard: React.FC<NavigationCardProps> = ({ data }) => {
    const displayLabel = data.label ?? routeLabel[data.route] ?? data.route;

    return (
        <Link href={data.route} data-testid="navigation-card">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Navigate to</div>
                        <div className="text-sm font-medium text-violet-300">{displayLabel}</div>
                    </div>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </Link>
    );
};

export default NavigationCard;
