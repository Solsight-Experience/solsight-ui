"use client";

import { Fragment, useEffect, useState } from "react";
import { CalendarClock, Check, ChevronDown, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Toggle from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Cluster } from "@/stores/cluster.store";
import { useDailyReportSettings, useUpdateDailyReportSettings } from "../hooks/dailyReport.hooks";
import { DailyReportChannel, UpdateDailyReportSettingsDto } from "../types/dailyReport.types";
import { DailyReportTelegramDialog } from "./DailyReportTelegramDialog";
import { DailyReportEmailDialog } from "./DailyReportEmailDialog";

const SELECT_CLASSNAME =
    "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-overlay)] px-3 py-2 " +
    "text-[12px] text-[var(--text-primary)] outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50";

const UTC_OFFSETS = Array.from({ length: 27 }, (_, i) => i - 12); // -12..+14

function getDeviceUtcOffset(): number {
    return Math.round(-new Date().getTimezoneOffset() / 60);
}

function utcToOffsetTime(hour: number, minute: number, offset: number): string {
    const total = (((hour * 60 + minute + offset * 60) % 1440) + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function offsetTimeToUtc(value: string, offset: number): { hour: number; minute: number } {
    const [h, m] = value.split(":").map(Number);
    const total = (((h * 60 + m - offset * 60) % 1440) + 1440) % 1440;
    return { hour: Math.floor(total / 60), minute: total % 60 };
}

const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);

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
    const [time, setTime] = useState("07:00");
    const [utcOffset, setUtcOffset] = useState(0);
    const [network, setNetwork] = useState<Cluster>("mainnet");

    useEffect(() => {
        if (!settings) return;
        const h = settings.hour ?? 7;
        const m = settings.minute ?? 0;
        const offset = getDeviceUtcOffset();
        setEnabled(settings.enabled);
        setChannels(settings.channels?.length ? settings.channels : ["telegram"]);
        setUtcOffset(offset);
        setTime(utcToOffsetTime(h, m, offset));
        setNetwork(settings.network ?? "mainnet");
    }, [settings]);

    const telegramConnected = settings?.telegramConnected ?? false;
    const emailConnected = settings?.emailConnected ?? false;
    const noChannelConnected = !telegramConnected && !emailConnected;

    function toggleChannel(target: DailyReportChannel, checked: boolean) {
        setChannels((prev) => (checked ? [...prev.filter((c) => c !== target), target] : prev.filter((c) => c !== target)));
    }

    const [timeHour, timeMinute] = time.split(":").map(Number);

    function handleHourChange(newHour: number) {
        setTime(`${String(newHour).padStart(2, "0")}:${String(timeMinute).padStart(2, "0")}`);
    }

    function handleMinuteChange(newMinute: number) {
        setTime(`${String(timeHour).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`);
    }

    async function handleSave() {
        if (enabled && channels.length === 0) {
            toast.error("Please choose at least one channel");
            return;
        }

        const { hour, minute } = offsetTimeToUtc(time, utcOffset);

        const dto: UpdateDailyReportSettingsDto = enabled ? { enabled: true, channels, hour, minute, network } : { enabled: false, network };

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

                            {/* Network */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Network</label>
                                <Tabs
                                    value={network}
                                    onValueChange={(value) => {
                                        if (value === "mainnet" || value === "devnet") setNetwork(value);
                                    }}
                                >
                                    <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-1 flex w-fit">
                                        <TabsTrigger
                                            value="mainnet"
                                            className={`px-3 py-1 rounded-md text-[12px] font-semibold ${network === "mainnet" ? "bg-white/[0.06] text-white" : "text-white/60"}`}
                                        >
                                            Mainnet
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="devnet"
                                            className={`ml-1 px-3 py-1 rounded-md text-[12px] font-semibold ${network === "devnet" ? "bg-white/[0.06] text-white" : "text-white/60"}`}
                                        >
                                            Devnet
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
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
                                        <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Time</label>
                                        <div className="flex items-center gap-1.5">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button type="button" className={`${SELECT_CLASSNAME} flex items-center justify-between`}>
                                                        <span>{String(timeHour).padStart(2, "0")}</span>
                                                        <ChevronDown size={13} className="text-[var(--text-muted)]" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="start"
                                                    className="max-h-56 w-[calc(var(--radix-dropdown-menu-trigger-width))] overflow-y-auto"
                                                >
                                                    {HOURS_24.map((h) => (
                                                        <DropdownMenuItem key={h} onSelect={() => handleHourChange(h)} className="justify-between">
                                                            <span>{String(h).padStart(2, "0")}</span>
                                                            {h === timeHour && <Check size={13} className="text-violet-500" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <span className="text-[var(--text-muted)]">:</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button type="button" className={`${SELECT_CLASSNAME} flex items-center justify-between`}>
                                                        <span>{String(timeMinute).padStart(2, "0")}</span>
                                                        <ChevronDown size={13} className="text-[var(--text-muted)]" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="start"
                                                    className="max-h-56 w-[calc(var(--radix-dropdown-menu-trigger-width))] overflow-y-auto"
                                                >
                                                    {MINUTES.map((m) => (
                                                        <DropdownMenuItem key={m} onSelect={() => handleMinuteChange(m)} className="justify-between">
                                                            <span>{String(m).padStart(2, "0")}</span>
                                                            {m === timeMinute && <Check size={13} className="text-violet-500" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">UTC Offset</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className={`${SELECT_CLASSNAME} flex items-center justify-between`}>
                                                    <span>
                                                        UTC{utcOffset >= 0 ? "+" : ""}
                                                        {utcOffset}
                                                    </span>
                                                    <ChevronDown size={13} className="text-[var(--text-muted)]" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="start"
                                                className="max-h-56 w-[calc(var(--radix-dropdown-menu-trigger-width))] overflow-y-auto"
                                            >
                                                {UTC_OFFSETS.map((o) => (
                                                    <DropdownMenuItem key={o} onSelect={() => setUtcOffset(o)} className="justify-between">
                                                        <span>
                                                            UTC{o >= 0 ? "+" : ""}
                                                            {o}
                                                        </span>
                                                        {o === utcOffset && <Check size={13} className="text-violet-500" />}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
