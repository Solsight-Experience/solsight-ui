"use client";

import React, { useState } from "react";
import { Bell, BellOff, Plus, Trash2, AlertTriangle, ArrowRightLeft, Coins, Zap, Loader2, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { useWalletAlerts, useCreateWalletAlert, useUpdateWalletAlert, useDeleteWalletAlert } from "../hooks/useWalletAlerts";
import { useTelegramSubscription } from "../hooks/useTelegramSubscription";
import { useEmailSubscription } from "../hooks/useEmailSubscription";
import { WalletAlert, WalletAlertType, CreateWalletAlertDto } from "../types/watchlist.types";
import { TelegramBotDialog } from "./TelegramBotDialog";
import { EmailDialog } from "./EmailDialog";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";

// ── Alert type config ─────────────────────────────────────────────────────────

const ALERT_TYPE_META: Record<WalletAlertType, { label: string; description: string; icon: React.ReactNode }> = {
    [WalletAlertType.ANY_SWAP]: {
        label: "Any Swap",
        description: "Notify on every swap transaction",
        icon: <ArrowRightLeft className="size-3.5" />
    },
    [WalletAlertType.TOKEN_BALANCE_CHANGE]: {
        label: "Token Balance Change",
        description: "Notify when a token balance changes",
        icon: <Coins className="size-3.5" />
    },
    [WalletAlertType.LARGE_TRANSFER]: {
        label: "Large Transfer",
        description: "Notify on large SOL transfers",
        icon: <Zap className="size-3.5" />
    }
};

const WALLET_ALERT_NUMBER_FORMATTER = new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 9 });

// ── Add Alert Form ────────────────────────────────────────────────────────────

const AddAlertForm: React.FC<{ walletAddress: string; network: "mainnet" | "devnet"; onClose: () => void }> = ({ walletAddress, network, onClose }) => {
    const [alertType, setAlertType] = useState<WalletAlertType>(WalletAlertType.ANY_SWAP);
    const [tokenMint, setTokenMint] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [threshold, setThreshold] = useState("");
    const [direction, setDirection] = useState<"increase" | "decrease" | "any">("any");
    const [minAmountSol, setMinAmountSol] = useState("");

    const { mutateAsync: createAlert, isPending } = useCreateWalletAlert(walletAddress);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dto: CreateWalletAlertDto = { alertType, network };

        if (alertType === WalletAlertType.TOKEN_BALANCE_CHANGE) {
            if (!tokenMint.trim()) {
                toast.error("Token mint address is required");
                return;
            }
            dto.condition = {
                tokenMint: tokenMint.trim(),
                tokenSymbol: tokenSymbol.trim() || undefined,
                threshold: threshold ? parseFloat(threshold) : undefined,
                direction
            };
        } else if (alertType === WalletAlertType.LARGE_TRANSFER) {
            dto.condition = {
                minAmountSol: minAmountSol ? parseFloat(minAmountSol) : 1
            };
        }

        try {
            await createAlert(dto);
            toast.success("Alert created");
            onClose();
        } catch {
            toast.error("Failed to create alert");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 flex flex-col gap-4">
            {/* Alert type selector */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Alert Type</label>
                <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(ALERT_TYPE_META) as WalletAlertType[]).map((type) => {
                        const meta = ALERT_TYPE_META[type];
                        const selected = alertType === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setAlertType(type)}
                                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors
                  ${
                      selected
                          ? "border-violet-500/60 bg-violet-500/10 text-white"
                          : "border-white/[0.06] text-white/60 hover:border-white/20 hover:text-white/80"
                  }`}
                            >
                                <span className={`mt-0.5 shrink-0 ${selected ? "text-violet-400" : ""}`}>{meta.icon}</span>
                                <div>
                                    <div className="text-[12px] font-semibold">{meta.label}</div>
                                    <div className="text-[11px] text-white/40">{meta.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Token Balance Change conditions */}
            {alertType === WalletAlertType.TOKEN_BALANCE_CHANGE && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                            Token Mint Address <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={tokenMint}
                            onChange={(e) => setTokenMint(e.target.value)}
                            placeholder="e.g. EPjFWdd5AufqSSqeM2qN1..."
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2
                         text-[12px] text-white placeholder:text-white/25 outline-none
                         focus:border-violet-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Token Symbol (optional)</label>
                        <input
                            type="text"
                            value={tokenSymbol}
                            onChange={(e) => setTokenSymbol(e.target.value)}
                            placeholder="e.g. USDC"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2
                         text-[12px] text-white placeholder:text-white/25 outline-none
                         focus:border-violet-500/50 transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Min Change Amount</label>
                            <NumbericInput
                                mode="string"
                                decimals={9}
                                formatter={WALLET_ALERT_NUMBER_FORMATTER}
                                value={threshold}
                                onChange={setThreshold}
                                placeholder="0"
                                min={0}
                                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2
                           text-[12px] text-white placeholder:text-white/25 outline-none
                           focus:border-violet-500/50 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Direction</label>
                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value as typeof direction)}
                                className="w-full rounded-lg border border-white/[0.08] bg-[#1a1a2e] px-3 py-2
                           text-[12px] text-white outline-none focus:border-violet-500/50 transition-colors"
                            >
                                <option value="any">Any</option>
                                <option value="increase">Increase</option>
                                <option value="decrease">Decrease</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Large Transfer conditions */}
            {alertType === WalletAlertType.LARGE_TRANSFER && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Minimum SOL Amount</label>
                    <NumbericInput
                        mode="string"
                        decimals={9}
                        formatter={WALLET_ALERT_NUMBER_FORMATTER}
                        value={minAmountSol}
                        onChange={setMinAmountSol}
                        placeholder="1"
                        min={0}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2
                       text-[12px] text-white placeholder:text-white/25 outline-none
                       focus:border-violet-500/50 transition-colors"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
                <button
                    type="submit"
                    disabled={isPending}
                    style={{ color: "white" }}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-[12px]
                     font-semibold hover:bg-violet-500 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
                >
                    {isPending && <Loader2 className="size-3.5 animate-spin" />}
                    Create Alert
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/[0.08] px-4 py-2 text-[12px]
                     font-semibold text-white/50 hover:text-white hover:border-white/20
                     transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

// ── Alert Row ─────────────────────────────────────────────────────────────────

const AlertRow: React.FC<{ alert: WalletAlert; walletAddress: string }> = ({ alert, walletAddress }) => {
    const { mutateAsync: updateAlert, isPending: isUpdating } = useUpdateWalletAlert(walletAddress);
    const { mutateAsync: deleteAlert, isPending: isDeleting } = useDeleteWalletAlert(walletAddress);
    const meta = ALERT_TYPE_META[alert.alertType];

    const toggleActive = async () => {
        try {
            await updateAlert({ alertId: alert.id, dto: { isActive: !alert.isActive } });
        } catch {
            toast.error("Failed to update alert");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAlert(alert.id);
            toast.success("Alert deleted");
        } catch {
            toast.error("Failed to delete alert");
        }
    };

    const conditionSummary = () => {
        const c = alert.condition;
        if (!c) return null;
        if (alert.alertType === WalletAlertType.TOKEN_BALANCE_CHANGE) {
            const parts: string[] = [];
            if (c.tokenSymbol) parts.push(c.tokenSymbol);
            else if (c.tokenMint) parts.push(`${c.tokenMint.slice(0, 6)}...`);
            if (c.direction && c.direction !== "any") parts.push(c.direction);
            if (c.threshold) parts.push(`≥ ${c.threshold}`);
            return parts.join(", ");
        }
        if (alert.alertType === WalletAlertType.LARGE_TRANSFER) {
            return `≥ ${c.minAmountSol ?? 1} SOL`;
        }
        return null;
    };

    const summary = conditionSummary();

    return (
        <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors
        ${alert.isActive ? "border-white/[0.08] bg-white/[0.02]" : "border-white/[0.04] bg-transparent opacity-60"}`}
        >
            <span className={alert.isActive ? "text-violet-400" : "text-white/30"}>{meta.icon}</span>
            <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-white">{meta.label}</div>
                {summary && <div className="text-[11px] text-white/40 truncate">{summary}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={toggleActive}
                    disabled={isUpdating}
                    title={alert.isActive ? "Pause alert" : "Enable alert"}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-white/40
                     hover:text-white hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
                >
                    {isUpdating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : alert.isActive ? (
                        <Bell className="size-3.5" />
                    ) : (
                        <BellOff className="size-3.5" />
                    )}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete alert"
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-white/40
                     hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                >
                    {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
            </div>
        </div>
    );
};

// ── Main Tab Component ─────────────────────────────────────────────────────────

export const WalletAlertsTab: React.FC<{ walletAddress: string; network?: "mainnet" | "devnet" }> = ({ walletAddress, network = "mainnet" }) => {
    const [showForm, setShowForm] = useState(false);
    const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const { data: alerts, isLoading, error } = useWalletAlerts(walletAddress);
    const { data: telegramSubscription } = useTelegramSubscription();
    const { data: emailSubscription } = useEmailSubscription();
    const isTelegramConnected = telegramSubscription?.isVerified ?? false;
    const isTelegramLoading = telegramSubscription === undefined;
    const isEmailConnected = emailSubscription?.isVerified ?? false;
    const isEmailLoading = emailSubscription === undefined;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 mt-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-[var(--surface-btn)] rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-red-400 text-sm py-8 justify-center">
                <AlertTriangle className="size-4" /> Failed to load alerts
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 mt-4">
            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-white/[0.12]
                     px-4 py-3 text-[12px] font-semibold text-white/50
                     hover:border-violet-500/50 hover:text-violet-400 transition-colors"
                >
                    <Plus className="size-4" />
                    Add Alert
                </button>
            )}

            {showForm && <AddAlertForm walletAddress={walletAddress} network={network} onClose={() => setShowForm(false)} />}

            <TelegramBotDialog open={telegramDialogOpen} onOpenChange={setTelegramDialogOpen} />
            <EmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />

            {alerts && alerts.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {alerts.map((alert) => (
                        <AlertRow key={alert.id} alert={alert} walletAddress={walletAddress} />
                    ))}
                </div>
            ) : (
                !showForm && (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <Bell className="size-8 text-white/20" />
                        <div className="text-[13px] font-semibold text-white/40">No alerts set up</div>
                        <div className="text-[11px] text-white/25">Get notified when this wallet makes swaps, transfers, or balance changes</div>
                    </div>
                )
            )}

            {/* Telegram Bot section */}
            {!isTelegramLoading && (
                <div
                    className={`mt-1 rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors
          ${isTelegramConnected ? "border-green-500/20 bg-green-500/[0.04]" : "border-white/[0.07] bg-white/[0.02]"}`}
                >
                    <div
                        className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0
            ${isTelegramConnected ? "bg-green-500/15 ring-1 ring-green-500/25" : "bg-white/[0.06]"}`}
                    >
                        <MessageCircle className={`size-3.5 ${isTelegramConnected ? "text-green-400" : "text-white/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white/80">Telegram Bot</div>
                        <div className={`text-[11px] ${isTelegramConnected ? "text-green-400/80" : "text-white/30"}`}>
                            {isTelegramConnected ? "Connected — alerts will be sent to your Telegram" : "Not connected"}
                        </div>
                    </div>
                    <button
                        onClick={() => setTelegramDialogOpen(true)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150
              ${
                  isTelegramConnected
                      ? "text-white/40 hover:text-white/70 hover:bg-white/[0.06] border border-white/[0.08]"
                      : "text-blue-600 dark:text-blue-300 bg-blue-500/15 border border-blue-500/25 hover:bg-blue-500/25"
              }`}
                    >
                        {isTelegramConnected ? "Manage" : "Connect"}
                    </button>
                </div>
            )}

            {/* Email section */}
            {!isEmailLoading && (
                <div
                    className={`mt-1 rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors
          ${isEmailConnected ? "border-green-500/20 bg-green-500/[0.04]" : "border-white/[0.07] bg-white/[0.02]"}`}
                >
                    <div
                        className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0
            ${isEmailConnected ? "bg-green-500/15 ring-1 ring-green-500/25" : "bg-white/[0.06]"}`}
                    >
                        <Mail className={`size-3.5 ${isEmailConnected ? "text-green-400" : "text-white/30"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white/80">Email Alerts</div>
                        <div className={`text-[11px] ${isEmailConnected ? "text-green-400/80" : "text-white/30"}`}>
                            {isEmailConnected ? `Connected — alerts sent to ${emailSubscription?.email}` : "Not connected"}
                        </div>
                    </div>
                    <button
                        onClick={() => setEmailDialogOpen(true)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150
              ${
                  isEmailConnected
                      ? "text-white/40 hover:text-white/70 hover:bg-white/[0.06] border border-white/[0.08]"
                      : "text-violet-600 dark:text-violet-300 bg-violet-500/15 border border-violet-500/25 hover:bg-violet-500/25"
              }`}
                    >
                        {isEmailConnected ? "Manage" : "Connect"}
                    </button>
                </div>
            )}
        </div>
    );
};
