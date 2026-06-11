import React from "react";
import { WalletList } from "./Walletlist";
import { PortfolioFilters } from "./Portfoliofilters";

export const PortfolioSidebar: React.FC = () => {
    return (
        <div className="sticky top-[32px] flex flex-col gap-5 px-5 pb-32 overflow-y-auto max-h-[calc(100vh-82px)]">
            <WalletList />
            <div className="h-px bg-[var(--border-faint)]" />
            <PortfolioFilters />
        </div>
    );
};
