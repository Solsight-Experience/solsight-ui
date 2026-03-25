import React from "react";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useWallets } from "../hooks/portfolio.hooks";
import AddWalletButton from "./AddWalletButton";
import WalletDropdownMenu from "./WalletDropdownMenu";

export const WalletList: React.FC = () => {
    const { data: walletsData, isLoading, error } = useWallets();

    // mapping url
    for (const wallet of walletsData?.wallets || []) {
        switch (wallet.icon) {
            case "phantom":
                wallet.icon = "https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/688cfdedc848baa5dcb46202_685aaee76364cd101625876d_Phantom-logo.png";
                break;
        }
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Wallets</Label>
                    <AddWalletButton />
                </div>
                <div className="border border-purple-600 bg-purple-950/20 p-6 rounded-lg">
                    <div className="flex items-center gap-3 text-purple-500">
                        <AlertTriangle className="size-5" />
                        <div>
                            <div className="font-medium">Error Loading Wallets</div>
                            <div className="text-sm text-gray-400 mt-1">{error instanceof Error ? error.message : "Network error. Please try again."}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Wallets</Label>
                    <AddWalletButton />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border flex items-center gap-4 rounded-lg border-gray-600 p-2 animate-pulse">
                        <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded mb-2 w-24"></div>
                            <div className="h-3 bg-gray-700 rounded w-32"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!walletsData?.wallets) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <Label className="text-base">Wallets</Label>
                <AddWalletButton />
            </div>
            {walletsData.wallets.length === 0 ? (
                <div className="border border-gray-600 p-8 rounded-lg">
                    <div className="text-center text-gray-400">
                        <div className="text-base mb-2">No wallets added</div>
                        <div className="text-sm">Click the + button to add your first wallet</div>
                    </div>
                </div>
            ) : (
                [...walletsData.wallets]
                    .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
                    .map((wallet) => (
                        <div key={wallet.address} className="border flex items-center gap-4 rounded-lg border-gray-600 p-2  transition-colors">
                            <img src={wallet.icon} className="rounded-lg h-8 w-8 object-contain" alt={wallet.name} />
                            <div className="flex flex-col flex-1">
                                <div className="text-sm font-medium">
                                    {wallet.name}
                                    {wallet.is_default && <span className="ml-2 text-sx text-purple-300 font-normal">(Default)</span>}
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="text-base font-semibold">{wallet.balance_sol.toFixed(4)} SOL</div>
                                    <div className="text-sm text-gray-400">${wallet.balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                    {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                                </div>
                            </div>
                            <WalletDropdownMenu walletAddress={wallet.address} isDefault={wallet.is_default} />
                        </div>
                    ))
            )}
        </div>
    );
};
