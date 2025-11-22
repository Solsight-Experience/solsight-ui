import React from 'react';
import { QuickLinks } from './Quicklinks';
import { WalletList } from './Walletlist';
import { PortfolioFilters } from './Portfoliofilters';

export const PortfolioSidebar: React.FC = () => {
  return (
    <div className="border-r-2 sticky top-0 left-0 border-gray-700 flex flex-col gap-4 p-4 pb-32 overflow-y-auto max-h-screen">
      <QuickLinks />
      <WalletList />
      <PortfolioFilters />
    </div>
  );
};
