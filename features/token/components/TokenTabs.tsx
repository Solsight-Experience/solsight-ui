import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenUIStore } from "../stores/token.stores";
import { TradesTable } from "./TradesTable";
import { TopTradersTable } from "./TopTraderTable";
import { HoldersTable } from "./HoldersTable";

import { TradeTab } from "@/lib/constants";

interface TokenTabsProps {
    tokenAddress: string;
}

export const TokenTabs: React.FC<TokenTabsProps> = ({ tokenAddress }) => {
    const { currentTradeTab, setCurrentTradeTab } = useTokenUIStore();

    return (
        <div className="flex flex-col w-full h-full">
            <Tabs value={currentTradeTab} onValueChange={(v: string) => setCurrentTradeTab(v as TradeTab)} className="flex flex-col w-full h-full">
                <div className="shrink-0 p-4 pb-0 z-20">
                    <TabsList>
                        <TabsTrigger value="trades">Trades</TabsTrigger>
                        <TabsTrigger value="top_traders">Top Traders</TabsTrigger>
                        <TabsTrigger value="holders">Holders</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden p-0 flex flex-col">
                    <TabsContent forceMount value="trades" className="flex-1 m-0 h-full data-[state=inactive]:hidden flex flex-col pt-2">
                        <TradesTable tokenAddress={tokenAddress} />
                    </TabsContent>

                    <TabsContent forceMount value="top_traders" className="flex-1 m-0 h-full data-[state=inactive]:hidden flex flex-col pt-2">
                        <TopTradersTable tokenAddress={tokenAddress} />
                    </TabsContent>

                    <TabsContent forceMount value="holders" className="flex-1 m-0 h-full data-[state=inactive]:hidden flex flex-col pt-2">
                        <HoldersTable tokenAddress={tokenAddress} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};
