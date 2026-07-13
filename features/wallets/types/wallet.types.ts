import type { Transaction, VersionedTransaction } from "@solana/web3.js";

export type SupportedWalletName = "Phantom" | "Solflare";

export interface WalletCapabilities {
    canSignTransaction: boolean;
    canSignMessage: boolean;
}

export interface ExtensionWallet {
    name: string;
    publicKey: string | null;
    connected: boolean;
    capabilities: WalletCapabilities;
    signTransaction: (<T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>) | null;
    signMessage: ((msg: Uint8Array) => Promise<Uint8Array>) | null;
}
