import type { Adapter } from "@solana/wallet-adapter-base";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { ExtensionWallet, WalletCapabilities } from "../types/wallet.types";

type SignerAdapter = Adapter & {
    signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
    signMessage?: (msg: Uint8Array) => Promise<Uint8Array>;
};

function getCapabilities(adapter: Adapter | null): WalletCapabilities {
    if (!adapter) return { canSignTransaction: false, canSignMessage: false };
    const a = adapter as SignerAdapter;
    return {
        canSignTransaction: typeof a.signTransaction === "function",
        canSignMessage: typeof a.signMessage === "function"
    };
}

export function toExtensionWallet(
    wallet: WalletContextState["wallet"] | null,
    publicKey: WalletContextState["publicKey"] | null,
    connected: boolean
): ExtensionWallet {
    const adapter = (wallet?.adapter ?? null) as SignerAdapter | null;
    const capabilities = getCapabilities(adapter);

    return {
        name: adapter?.name ?? "",
        publicKey: publicKey?.toBase58() ?? null,
        connected,
        capabilities,
        signTransaction: capabilities.canSignTransaction ? (tx) => adapter!.signTransaction!(tx) : null,
        signMessage: capabilities.canSignMessage ? (msg) => adapter!.signMessage!(msg) : null
    };
}

export function getWalletNetwork(wallet: WalletContextState["wallet"] | null): "mainnet" | "devnet" | null {
    // The adapter exposes network info only for native providers.
    // Cast to any to probe the underlying provider if available.
    const provider = (wallet?.adapter as unknown as { _provider?: { network?: string } })?._provider;
    const raw = provider?.network?.toLowerCase();
    if (!raw) return null;
    if (raw === "devnet") return "devnet";
    if (raw === "mainnet" || raw === "mainnet-beta") return "mainnet";
    return null;
}

export function waitForWalletSelection(wallets: WalletContextState["wallets"], walletName: string, timeoutMs = 1000): Promise<void> {
    const startedAt = Date.now();

    return new Promise<void>((resolve, reject) => {
        const poll = () => {
            if (wallets.find((c) => c.adapter.name === walletName)?.adapter) {
                resolve();
                return;
            }
            if (Date.now() - startedAt >= timeoutMs) {
                reject(new Error(`Wallet ${walletName} is not ready yet.`));
                return;
            }
            window.setTimeout(poll, 25);
        };
        poll();
    });
}
