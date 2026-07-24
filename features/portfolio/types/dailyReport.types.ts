import type { Cluster } from "@/stores/cluster.store";

export type DailyReportChannel = "telegram" | "email";

export interface DailyReportSettings {
    enabled: boolean;
    channels: DailyReportChannel[];
    hour?: number;
    minute?: number;
    network?: Cluster;
    telegramConnected: boolean;
    emailConnected: boolean;
}

export interface UpdateDailyReportSettingsDto {
    enabled: boolean;
    channels?: DailyReportChannel[];
    hour?: number;
    minute?: number;
    network?: Cluster;
}
