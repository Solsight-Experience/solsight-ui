import type { SupportedWalletName } from "../types/wallet.types";

interface WalletRegistryEntry {
    name: SupportedWalletName;
    walletIcon: "phantom" | "custom";
    installUrl: string;
}

export const SUPPORTED_WALLETS: WalletRegistryEntry[] = [
    { name: "Phantom", walletIcon: "phantom", installUrl: "https://phantom.app/" },
    { name: "Solflare", walletIcon: "custom", installUrl: "https://solflare.com/" }
];

export function getWalletEntry(name: string): WalletRegistryEntry | undefined {
    return SUPPORTED_WALLETS.find((w) => w.name === name);
}

export function normalizeWalletIcon(walletName?: string): "phantom" | "custom" {
    return walletName?.toLowerCase() === "phantom" ? "phantom" : "custom";
}

export const PREFERRED_WALLET_NAMES: SupportedWalletName[] = ["Phantom", "Solflare"];
