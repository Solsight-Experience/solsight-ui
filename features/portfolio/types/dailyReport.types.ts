export type DailyReportChannel = "telegram" | "email";

export interface DailyReportSettings {
    enabled: boolean;
    channels: DailyReportChannel[];
    hour?: number;
    minute?: number;
    telegramConnected: boolean;
    emailConnected: boolean;
}

export interface UpdateDailyReportSettingsDto {
    enabled: boolean;
    channels?: DailyReportChannel[];
    hour?: number;
    minute?: number;
}
