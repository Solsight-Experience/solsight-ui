import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenUIStore } from "../stores/token.stores";
import { TradesTable } from "./TradesTable";
import { TopTradersTable } from "./TopTraderTable";
import { HoldersTable } from "./HoldersTable";

interface TokenTabsProps {
    tokenAddress: string;
}

export const TokenTabs: React.FC<TokenTabsProps> = ({ tokenAddress }) => {
    const { currentTradeTab, setCurrentTradeTab } = useTokenUIStore();

    return (
        <div className="flex p-4 w-full col-span-3">
            <Tabs value={currentTradeTab} onValueChange={(v: string) => setCurrentTradeTab(v)} className="w-full">
                <TabsList>
                    <TabsTrigger value="trades">Trades</TabsTrigger>
                    <TabsTrigger value="top_traders">Top Traders</TabsTrigger>
                    <TabsTrigger value="holders">Holders</TabsTrigger>
                </TabsList>

                <TabsContent value="trades">
                    <TradesTable tokenAddress={tokenAddress} />
                </TabsContent>

                <TabsContent value="top_traders" className="m-0">
                    <TopTradersTable tokenAddress={tokenAddress} />
                </TabsContent>

                <TabsContent value="holders" className="m-0">
                    <HoldersTable tokenAddress={tokenAddress} />
                </TabsContent>
            </Tabs>
        </div>
    );
};
