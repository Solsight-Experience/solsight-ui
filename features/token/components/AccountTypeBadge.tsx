import React from "react";
import { Wallet } from "lucide-react";
import type { Holder } from "../types/token.types";

interface AccountTypeBadgeProps {
    type: Holder["account_type"];
}

export const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({ type }) => {
    if (type === "LP") {
        return (
            <span className="text-purple-400 text-xs font-medium flex items-center gap-0.5">
                <Wallet className="w-3 h-3" />
                LIQUIDITY POOL
            </span>
        );
    }
    return null;
};
