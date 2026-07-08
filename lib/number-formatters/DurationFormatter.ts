export class DurationFormatter {
    format(firstTxTimestamp: number): string {
        const now = Date.now();
        const diff = now - firstTxTimestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) return `${years}y`;
        if (months > 0) return `${months}mo`;
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
    }
}
