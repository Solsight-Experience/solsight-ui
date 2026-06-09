export interface IFConfig {
    network: string;
    label: string;
    solscanNetworkParam: "" | "devnet";
    rpcUrl: string;
    ifProgramId: string;
    ifAuthority: string;
    isEnabled: boolean;
    unavailableReason?: string;
    stakePoolProgramId: string;
    stakePool: string;
    poolMint: string;
}

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
const IS_DEVNET = SOLANA_NETWORK === "devnet";

export const IF_MIN_STAKE_SOL = 0.01;
export const IF_RESERVE_SOL = 0.02;

export const SPL_STAKE_POOL_PROGRAM_ID = "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy";

export const IF_CONFIG: IFConfig = {
    network: SOLANA_NETWORK,
    label: IS_DEVNET ? "Devnet" : "Mainnet",
    solscanNetworkParam: IS_DEVNET ? "devnet" : "",
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
    ifProgramId: process.env.NEXT_PUBLIC_IF_PROGRAM_ID ?? "BWEVr3uY4g4oTsSAXc5jKKmxBmg5wjfprmaQYZfhTpHv",
    ifAuthority: process.env.NEXT_PUBLIC_IF_AUTHORITY ?? "HJnpCRqahd2Zunhx1VyY9d9Hj7UyLSNWQEavybJC3MSa",
    isEnabled: IS_DEVNET,
    unavailableReason: IS_DEVNET ? undefined : "Insurance Fund staking is currently configured for devnet.",
    stakePoolProgramId: SPL_STAKE_POOL_PROGRAM_ID,
    stakePool: process.env.NEXT_PUBLIC_IF_STAKE_POOL ?? "HaNMPvTNQvLz4Y7bvrQYAsimEnFYBPpJtKRNoABC2Ui2",
    poolMint: process.env.NEXT_PUBLIC_IF_POOL_MINT ?? "8JEGmSLLA1m4VMiWTD5LP4HwA9snurxuR3gHeRT8GfUv"
};

export function getSolscanTxUrl(signature: string): string {
    const suffix = IF_CONFIG.solscanNetworkParam ? `?cluster=${IF_CONFIG.solscanNetworkParam}` : "";
    return `https://solscan.io/tx/${signature}${suffix}`;
}
