'use client';

import React, { useEffect } from 'react';
import { Coins, ArrowRightLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioSidebar } from '@/features/portfolio/components/Portfoliosidebar';
import { PortfolioDashboard } from '@/features/portfolio/components/Portfoliodashboard';
import { PositionsTab } from '@/features/portfolio/components/Positionstab';
import { ActivityTab } from '@/features/portfolio/components/Activitytab';
import { usePortfolioUIStore } from '@/features/portfolio/stores/portfolioUIStore';

import '@/lib/chart-config';

export default function PortfolioPage() {
  const { currentTab, setCurrentTab } = usePortfolioUIStore();

  return (
    <div className="grid grid-cols-[320px_1fr] min-h-screen">
      {/* Left Sidebar */}
      <PortfolioSidebar />

      {/* Right Content */}
      <div className="p-4 flex flex-col gap-4">
        <div className="text-xl text-white font-bold">Dashboard</div>

        {/* Portfolio Dashboard Cards */}
        <PortfolioDashboard />

        {/* Tabs Section */}
        <div className="flex flex-col gap-4">
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
            <TabsList>
              <TabsTrigger value="position">
                <Coins className="size-4" />
                Position
              </TabsTrigger>
              <TabsTrigger value="activity">
                <ArrowRightLeft className="size-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="position">
              <PositionsTab />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
