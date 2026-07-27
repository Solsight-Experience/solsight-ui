import { Connection, VersionedTransaction } from "@solana/web3.js";
import { CLUSTER_RPC_URLS, type Cluster } from "@/lib/constants";

/**
 * Client-side swap confirmation.
 *
 * The backend now sends the transaction and returns the signature immediately without
 * waiting for confirmation, so the browser subscribes to the signature and reports the
 * outcome. We confirm against a dedicated RPC connection (preferring the configured env
 * endpoint over the public cluster URL to avoid public-RPC rate limits).
 */

// One cached Connection per cluster, mirroring getStakingConnection().
const connections: Partial<Record<Cluster, Connection>> = {};

function resolveRpcUrl(cluster: Cluster): string {
    if (cluster === "mainnet") {
        return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || CLUSTER_RPC_URLS.mainnet;
    }
    return process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || CLUSTER_RPC_URLS.devnet;
}

export function getSwapConnection(cluster: Cluster): Connection {
    const existing = connections[cluster];
    if (existing) return existing;
    const connection = new Connection(resolveRpcUrl(cluster), "confirmed");
    connections[cluster] = connection;
    return connection;
}

/** Reads the recentBlockhash embedded in a signed (base64) transaction. */
export function readRecentBlockhash(signedTransactionBase64: string): string {
    const bytes = Uint8Array.from(Buffer.from(signedTransactionBase64, "base64"));
    return VersionedTransaction.deserialize(bytes).message.recentBlockhash;
}

export type ConfirmResult = { status: "confirmed" } | { status: "failed"; err: unknown } | { status: "expired" };

/**
 * Confirms a swap signature using the blockhash strategy: it resolves as soon as the tx
 * lands, and deterministically gives up once `lastValidBlockHeight` is exceeded (rather
 * than hanging forever on a dropped transaction, as a bare onSignature would).
 */
export async function confirmSwapSignature(params: {
    cluster: Cluster;
    signature: string;
    signedTransactionBase64: string;
    lastValidBlockHeight: number;
}): Promise<ConfirmResult> {
    const { cluster, signature, signedTransactionBase64, lastValidBlockHeight } = params;
    const connection = getSwapConnection(cluster);
    const blockhash = readRecentBlockhash(signedTransactionBase64);

    try {
        const res = await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
        return res.value.err ? { status: "failed", err: res.value.err } : { status: "confirmed" };
    } catch (error) {
        const name = error instanceof Error ? error.name : "";
        if (name.includes("BlockheightExceeded") || name.includes("Expired")) {
            return { status: "expired" };
        }
        return { status: "failed", err: error };
    }
}
