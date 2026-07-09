export function shortenAddr(addr: string): string {
    return addr.slice(0, 5) + "…" + addr.slice(-4);
}
