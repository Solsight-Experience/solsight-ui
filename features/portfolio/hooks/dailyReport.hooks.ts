import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dailyReportService } from "../service/dailyReport.service";
import type { UpdateDailyReportSettingsDto } from "../types/dailyReport.types";

const SETTINGS_KEY = ["daily-report-settings"];

export const useDailyReportSettings = () =>
    useQuery({
        queryKey: SETTINGS_KEY,
        queryFn: dailyReportService.getSettings
    });

export const useUpdateDailyReportSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateDailyReportSettingsDto) => dailyReportService.updateSettings(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY })
    });
};
