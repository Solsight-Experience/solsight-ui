"use client";

import { Fragment, useEffect, useState } from "react";
import { CalendarClock, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Toggle from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { useDailyReportSettings, useUpdateDailyReportSettings } from "../hooks/dailyReport.hooks";
import { DailyReportChannel, UpdateDailyReportSettingsDto } from "../types/dailyReport.types";
import { DailyReportTelegramDialog } from "./DailyReportTelegramDialog";
import { DailyReportEmailDialog } from "./DailyReportEmailDialog";

const SELECT_CLASSNAME =
    "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)] px-3 py-2 " +
    "text-[12px] text-[var(--text-primary)] outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50";

function clamp(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
}

interface DailyReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DailyReportDialog({ open, onOpenChange }: DailyReportDialogProps) {
    const { data: settings, isLoading } = useDailyReportSettings();
    const { mutateAsync: updateSettings, isPending: isSaving } = useUpdateDailyReportSettings();

    const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [channels, setChannels] = useState<DailyReportChannel[]>(["telegram"]);
    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);

    useEffect(() => {
        if (!settings) return;
        setEnabled(settings.enabled);
        setChannels(settings.channels?.length ? settings.channels : ["telegram"]);
        setHour(settings.hour ?? 7);
        setMinute(settings.minute ?? 0);
    }, [settings]);

    const telegramConnected = settings?.telegramConnected ?? false;
    const emailConnected = settings?.emailConnected ?? false;
    const noChannelConnected = !telegramConnected && !emailConnected;

    function toggleChannel(target: DailyReportChannel, checked: boolean) {
        setChannels((prev) => (checked ? [...prev.filter((c) => c !== target), target] : prev.filter((c) => c !== target)));
    }

    async function handleSave() {
        if (enabled && hour === undefined) {
            toast.error("Please choose an hour");
            return;
        }
        if (enabled && channels.length === 0) {
            toast.error("Please choose at least one channel");
            return;
        }

        const dto: UpdateDailyReportSettingsDto = enabled ? { enabled: true, channels, hour, minute } : { enabled: false };

        try {
            await updateSettings(dto);
            toast.success("Daily report settings saved");
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save settings");
        }
    }

    return (
        <Fragment>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[440px] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2.5 text-[14px] font-semibold">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/15 ring-1 ring-violet-500/25">
                                <CalendarClock size={13} className="text-violet-500" />
                            </div>
                            Daily Report
                        </DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="size-5 text-[var(--text-muted)] animate-spin" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Enable toggle */}
                            <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
                                <div>
                                    <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">Send daily report</div>
                                    <div className="text-[11px] text-[var(--text-muted)]">
                                        {noChannelConnected
                                            ? "Connect Telegram or Email below to enable daily reports"
                                            : "Get a summary of your portfolio every day"}
                                    </div>
                                </div>
                                <Toggle enabled={enabled} onChange={setEnabled} size="sm" />
                            </div>

                            {/* Schedule */}
                            <div className={`flex flex-col gap-3 ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Channels</label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-[12px] text-[var(--text-primary)]">
                                            <Checkbox
                                                checked={channels.includes("telegram")}
                                                onCheckedChange={(checked) => toggleChannel("telegram", checked === true)}
                                            />
                                            Telegram
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-[var(--text-primary)]">
                                            <Checkbox
                                                checked={channels.includes("email")}
                                                onCheckedChange={(checked) => toggleChannel("email", checked === true)}
                                            />
                                            Email
                                        </label>
                                    </div>
                                    {channels.includes("telegram") && !telegramConnected && (
                                        <p className="text-[11px] text-amber-500">Connect Telegram below first.</p>
                                    )}
                                    {channels.includes("email") && !emailConnected && <p className="text-[11px] text-amber-500">Connect Email below first.</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Hour (UTC)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={hour}
                                            onChange={(e) => setHour(clamp(Number(e.target.value), 0, 23))}
                                            className={SELECT_CLASSNAME}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Minute (UTC)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={minute}
                                            onChange={(e) => setMinute(clamp(Number(e.target.value), 0, 59))}
                                            className={SELECT_CLASSNAME}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Connection rows */}
                            <div className="flex flex-col gap-2">
                                <div
                                    className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors
                  ${
                      telegramConnected
                          ? "border-green-500/30 bg-green-500/[0.06] dark:border-green-500/20 dark:bg-green-500/[0.04]"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)]"
                  }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0
                    ${telegramConnected ? "bg-green-500/15 ring-1 ring-green-500/25" : "bg-[var(--surface-btn)]"}`}
                                    >
                                        <Send className={`size-3.5 ${telegramConnected ? "text-green-600 dark:text-green-400" : "text-[var(--text-muted)]"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-semibold text-[var(--text-primary)]">Telegram Bot</div>
                                        <div
                                            className={`text-[11px] ${telegramConnected ? "text-green-600 dark:text-green-400/80" : "text-[var(--text-muted)]"}`}
                                        >
                                            {telegramConnected ? "Connected" : "Not connected"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTelegramDialogOpen(true)}
                                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150
                    ${
                        telegramConnected
                            ? "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-btn)] border border-[var(--border-subtle)]"
                            : "text-blue-600 dark:text-blue-300 bg-blue-500/15 border border-blue-500/25 hover:bg-blue-500/25"
                    }`}
                                    >
                                        {telegramConnected ? "Manage" : "Connect"}
                                    </button>
                                </div>

                                <div
                                    className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors
                  ${
                      emailConnected
                          ? "border-green-500/30 bg-green-500/[0.06] dark:border-green-500/20 dark:bg-green-500/[0.04]"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)]"
                  }`}
                                >
                                    <div
                                        className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0
                    ${emailConnected ? "bg-green-500/15 ring-1 ring-green-500/25" : "bg-[var(--surface-btn)]"}`}
                                    >
                                        <Mail className={`size-3.5 ${emailConnected ? "text-green-600 dark:text-green-400" : "text-[var(--text-muted)]"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-semibold text-[var(--text-primary)]">Email</div>
                                        <div className={`text-[11px] ${emailConnected ? "text-green-600 dark:text-green-400/80" : "text-[var(--text-muted)]"}`}>
                                            {emailConnected ? "Connected" : "Not connected"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEmailDialogOpen(true)}
                                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150
                    ${
                        emailConnected
                            ? "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-btn)] border border-[var(--border-subtle)]"
                            : "text-violet-600 dark:text-violet-300 bg-violet-500/15 border border-violet-500/25 hover:bg-violet-500/25"
                    }`}
                                    >
                                        {emailConnected ? "Manage" : "Connect"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || isLoading}>
                            {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DailyReportTelegramDialog open={telegramDialogOpen} onOpenChange={setTelegramDialogOpen} />
            <DailyReportEmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
        </Fragment>
    );
}
