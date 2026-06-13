export interface IFConfig {
    network: string;
    label: string;
    solscanNetworkParam: "" | "devnet";
    rpcUrl: string;
    isEnabled: boolean;
    unavailableReason?: string;
}

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
const CONFIGURED_CLUSTER = SOLANA_NETWORK === "mainnet" || SOLANA_NETWORK === "mainnet-beta" ? "mainnet" : "devnet";
const IS_DEVNET = CONFIGURED_CLUSTER === "devnet";

export const IF_MIN_STAKE_SOL = 0.01;
export const IF_RESERVE_SOL = 0.02;

export const IF_CONFIG: IFConfig = {
    network: CONFIGURED_CLUSTER,
    label: IS_DEVNET ? "Devnet" : "Mainnet",
    solscanNetworkParam: IS_DEVNET ? "devnet" : "",
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
    isEnabled: true,
    unavailableReason: undefined
};

export function getSolscanTxUrl(signature: string): string {
    const suffix = IF_CONFIG.solscanNetworkParam ? `?cluster=${IF_CONFIG.solscanNetworkParam}` : "";
    return `https://solscan.io/tx/${signature}${suffix}`;
}
