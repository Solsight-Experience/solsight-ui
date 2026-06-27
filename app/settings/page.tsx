"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Check, Monitor, Moon, Palette, RadioTower, Settings, Shield, SlidersHorizontal, Sun } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";
import useClusterStore, { type Cluster } from "@/stores/cluster.store";
import useSettingsStore, { DEFAULT_QUICK_BUY_AMOUNT, DEFAULT_SLIPPAGE_BPS } from "@/stores/settings.store";

type ThemeMode = "light" | "dark" | "system";
type AccentTheme = "solsight" | "ocean" | "mono";
type SettingsTab = "network" | "appearance" | "preferences" | "security";

const NETWORK_OPTIONS: Array<{
    value: Cluster;
    label: string;
    description: string;
    status: string;
}> = [
    {
        value: "mainnet",
        label: "Mainnet",
        description: "Use production liquidity, portfolio data, and swap execution routes.",
        status: "Live trading"
    },
    {
        value: "devnet",
        label: "Devnet",
        description: "Use test wallets, devnet staking, and local executor experiments.",
        status: "Testing"
    }
];

const THEME_OPTIONS: Array<{
    value: ThemeMode;
    label: string;
    description: string;
    icon: React.ReactNode;
}> = [
    {
        value: "dark",
        label: "Dark",
        description: "Keep SolSight in the focused dark trading interface.",
        icon: <Moon size={15} />
    },
    {
        value: "light",
        label: "Light",
        description: "Use brighter surfaces for daytime monitoring.",
        icon: <Sun size={15} />
    },
    {
        value: "system",
        label: "System",
        description: "Follow your operating system color preference.",
        icon: <Monitor size={15} />
    }
];

const ACCENT_OPTIONS: Array<{
    value: AccentTheme;
    label: string;
    description: string;
    swatches: string[];
}> = [
    {
        value: "solsight",
        label: "SolSight",
        description: "Default product accent palette.",
        swatches: ["#8b5cf6", "#06b6d4", "#22c55e"]
    },
    {
        value: "ocean",
        label: "Ocean",
        description: "Placeholder theme for a cooler dashboard accent.",
        swatches: ["#0ea5e9", "#14b8a6", "#84cc16"]
    },
    {
        value: "mono",
        label: "Mono",
        description: "Placeholder theme for lower color intensity.",
        swatches: ["#71717a", "#a1a1aa", "#e4e4e7"]
    }
];

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-btn)] text-violet-500 dark:text-violet-300">
                {icon}
            </div>
            <div>
                <h2 className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{description}</p>
            </div>
        </div>
    );
}

function OptionButton({
    active,
    onClick,
    title,
    description,
    meta,
    icon,
    ariaLabel,
    testId
}: {
    active: boolean;
    onClick: () => void;
    title: string;
    description: string;
    meta?: React.ReactNode;
    icon?: React.ReactNode;
    ariaLabel: string;
    testId?: string;
}) {
    return (
        <button
            type="button"
            data-testid={testId}
            aria-label={ariaLabel}
            aria-pressed={active}
            onClick={onClick}
            className={`group flex min-h-[112px] w-full cursor-pointer flex-col justify-between rounded-lg border p-4 text-left transition-all duration-150 ${
                active
                    ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_0_1px_rgba(139,92,246,0.16)]"
                    : "border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-default)] hover:bg-[var(--surface-btn)]"
            }`}
        >
            <span className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--text-primary)]">
                    {icon ? <span className={active ? "text-violet-500 dark:text-violet-300" : "text-[var(--text-muted)]"}>{icon}</span> : null}
                    {title}
                </span>
                <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        active ? "border-violet-500 bg-violet-500 text-white" : "border-[var(--border-subtle)] text-transparent"
                    }`}
                >
                    <Check size={12} />
                </span>
            </span>
            <span className="mt-3 block text-[12px] leading-relaxed text-[var(--text-muted)]">{description}</span>
            {meta ? <span className="mt-4 block">{meta}</span> : null}
        </button>
    );
}

export default function SettingsPage() {
    const cluster = useClusterStore((state) => state.cluster);
    const setCluster = useClusterStore((state) => state.setCluster);
    const defaultQuickBuyAmount = useSettingsStore((state) => state.defaultQuickBuyAmount);
    const defaultSlippageBps = useSettingsStore((state) => state.defaultSlippageBps);
    const setDefaultQuickBuyAmount = useSettingsStore((state) => state.setDefaultQuickBuyAmount);
    const setDefaultSlippageBps = useSettingsStore((state) => state.setDefaultSlippageBps);
    const resetTradingDefaults = useSettingsStore((state) => state.resetTradingDefaults);
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [accentTheme, setAccentTheme] = useState<AccentTheme>("solsight");
    const [activeTab, setActiveTab] = useState<SettingsTab>("network");
    const amountFormatter = useMemo(() => new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 9 }), []);
    const bpsFormatter = useMemo(() => new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 0 }), []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? ((theme ?? "dark") as ThemeMode) : "dark";
    const resolvedMode = mounted ? (resolvedTheme ?? "dark") : "dark";

    return (
        <div className="min-h-[calc(100vh-82px)] bg-[var(--surface-page)] text-[var(--text-primary)]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 border-b border-[var(--border-faint)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-[13px] w-[3px] rounded-full bg-violet-500" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500 dark:text-violet-400">Control center</span>
                        </div>
                        <h1 className="text-[24px] font-bold tracking-tight">Settings</h1>
                        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--text-muted)]">
                            Manage network behavior, visual preferences, and workspace defaults for this browser.
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-[12px] font-semibold text-[var(--text-muted)]">
                        <RadioTower size={14} className="text-violet-500 dark:text-violet-300" />
                        Active: {cluster === "mainnet" ? "Mainnet" : "Devnet"}
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="gap-5">
                    <TabsList className="max-w-full overflow-x-auto border-[var(--border-faint)]">
                        <TabsTrigger value="network" onClick={() => setActiveTab("network")} className="cursor-pointer">
                            <RadioTower size={14} />
                            Network
                        </TabsTrigger>
                        <TabsTrigger value="appearance" onClick={() => setActiveTab("appearance")} className="cursor-pointer">
                            <Palette size={14} />
                            Appearance
                        </TabsTrigger>
                        <TabsTrigger value="preferences" onClick={() => setActiveTab("preferences")} className="cursor-pointer">
                            <SlidersHorizontal size={14} />
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger value="security" onClick={() => setActiveTab("security")} className="cursor-pointer">
                            <Shield size={14} />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="network" className="space-y-4">
                        <section
                            data-testid="cluster-toggle"
                            className="rounded-lg border border-[var(--border-faint)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl"
                        >
                            <SectionHeader
                                icon={<RadioTower size={17} />}
                                title="Execution network"
                                description="Choose the Solana cluster used by wallets, charts, portfolio APIs, and local swap tooling."
                            />

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                {NETWORK_OPTIONS.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        active={cluster === option.value}
                                        onClick={() => setCluster(option.value)}
                                        title={option.label}
                                        description={option.description}
                                        ariaLabel={`Use ${option.label}`}
                                        testId={`cluster-toggle-${option.value}`}
                                        meta={
                                            <span
                                                className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-semibold ${
                                                    option.value === "mainnet"
                                                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                                        : "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                                                }`}
                                            >
                                                {option.status}
                                            </span>
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-4">
                        <section className="rounded-lg border border-[var(--border-faint)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
                            <SectionHeader
                                icon={<Palette size={17} />}
                                title="Color mode"
                                description={`Current resolved mode: ${resolvedMode}. These settings are stored locally in this browser.`}
                            />

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {THEME_OPTIONS.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        active={activeTheme === option.value}
                                        onClick={() => setTheme(option.value)}
                                        title={option.label}
                                        description={option.description}
                                        icon={option.icon}
                                        ariaLabel={`Use ${option.label.toLowerCase()} theme`}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="rounded-lg border border-[var(--border-faint)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
                            <SectionHeader
                                icon={<Settings size={17} />}
                                title="Theme switch"
                                description="Accent themes are wired as local UI choices for now. The default SolSight palette remains active across the app."
                            />

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {ACCENT_OPTIONS.map((option) => (
                                    <OptionButton
                                        key={option.value}
                                        active={accentTheme === option.value}
                                        onClick={() => setAccentTheme(option.value)}
                                        title={option.label}
                                        description={option.description}
                                        ariaLabel={`Use ${option.label} accent theme`}
                                        meta={
                                            <span className="flex items-center gap-1.5">
                                                {option.swatches.map((color) => (
                                                    <span
                                                        key={color}
                                                        className="h-4 w-4 rounded-full border border-black/10 dark:border-white/10"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                                {option.value !== "solsight" ? (
                                                    <span className="ml-2 rounded-md bg-[var(--surface-btn)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                        Placeholder
                                                    </span>
                                                ) : null}
                                            </span>
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-4">
                        <section className="rounded-lg border border-[var(--border-faint)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
                            <SectionHeader
                                icon={<Bell size={17} />}
                                title="Workspace preferences"
                                description="A home for defaults that should apply across trading, portfolio, and alerts."
                            />

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                                    <h3 className="text-[13px] font-bold text-[var(--text-primary)]">Trading defaults</h3>
                                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                                        Saved in this browser and used by quick buy plus swap quote defaults.
                                    </p>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="settings-quick-buy-amount"
                                                className="cursor-pointer text-[12px] font-semibold text-[var(--text-muted)]"
                                            >
                                                Quick buy amount (SOL)
                                            </Label>
                                            <NumbericInput
                                                id="settings-quick-buy-amount"
                                                mode="string"
                                                decimals={9}
                                                formatter={amountFormatter}
                                                min={0}
                                                step={0.01}
                                                value={defaultQuickBuyAmount}
                                                onChange={setDefaultQuickBuyAmount}
                                            />
                                            <p className="text-[11px] text-[var(--text-faint)]">Default amount for token table Quick Buy buttons.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="settings-default-slippage"
                                                className="cursor-pointer text-[12px] font-semibold text-[var(--text-muted)]"
                                            >
                                                Default slippage (bps)
                                            </Label>
                                            <NumbericInput
                                                id="settings-default-slippage"
                                                formatter={bpsFormatter}
                                                min={1}
                                                max={10000}
                                                step={10}
                                                showStepper
                                                value={defaultSlippageBps}
                                                onChange={(value) => setDefaultSlippageBps(value ?? DEFAULT_SLIPPAGE_BPS)}
                                            />
                                            <p className="text-[11px] text-[var(--text-faint)]">{(defaultSlippageBps / 100).toFixed(2)}% max price movement.</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetTradingDefaults}
                                        className="mt-4 cursor-pointer rounded-md border border-[var(--border-subtle)] bg-[var(--surface-btn)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                                    >
                                        Reset to {DEFAULT_QUICK_BUY_AMOUNT} SOL / {DEFAULT_SLIPPAGE_BPS} bps
                                    </button>
                                </div>

                                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                                    <h3 className="text-[13px] font-bold text-[var(--text-primary)]">Notifications</h3>
                                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                                        Manage trading alerts and delivery channels from the notifications area.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                                    <h3 className="text-[13px] font-bold text-[var(--text-primary)]">Chart defaults</h3>
                                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                                        Coming soon: remember interval, overlays, and chart layout.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <section className="rounded-lg border border-[var(--border-faint)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
                            <SectionHeader
                                icon={<Shield size={17} />}
                                title="Security"
                                description="Review wallet and session settings connected to this browser."
                            />

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                {[
                                    ["Connected wallets", "Manage wallet connections from the profile and portfolio flows."],
                                    ["Session", "Sign out from the account menu when you are done on this machine."],
                                    ["Paymaster", "Gasless support depends on server-side Kora configuration."]
                                ].map(([title, description]) => (
                                    <div key={title} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                                        <h3 className="text-[13px] font-bold text-[var(--text-primary)]">{title}</h3>
                                        <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
