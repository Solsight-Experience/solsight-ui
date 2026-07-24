import { apiClient } from "@/lib/network-requests/api-client";
import { DAILY_REPORT_ENDPOINTS } from "@/lib/constants";
import type { DailyReportSettings, UpdateDailyReportSettingsDto } from "../types/dailyReport.types";

export const dailyReportService = {
    getSettings: () => apiClient.get<DailyReportSettings>(DAILY_REPORT_ENDPOINTS.SETTINGS),
    updateSettings: (dto: UpdateDailyReportSettingsDto) => apiClient.put<DailyReportSettings>(DAILY_REPORT_ENDPOINTS.SETTINGS, dto)
};
