import React from "react";
import { StakingPanel } from "@/features/staking/components";
import { IF_CONFIG } from "@/features/staking/constants/program";
import { ShieldCheck } from "lucide-react";
import { StakeHistoryClient } from "./StakeHistoryClient";

// Fixed star positions to avoid SSR/CSR mismatch
const STARS = [
    { x: 8, y: 12, d: 0 },
    { x: 23, y: 5, d: 0.4 },
    { x: 41, y: 18, d: 0.8 },
    { x: 57, y: 8, d: 1.2 },
    { x: 72, y: 22, d: 0.2 },
    { x: 88, y: 10, d: 1.6 },
    { x: 15, y: 35, d: 0.6 },
    { x: 33, y: 45, d: 1.0 },
    { x: 49, y: 30, d: 1.4 },
    { x: 65, y: 42, d: 0.3 },
    { x: 80, y: 55, d: 0.9 },
    { x: 92, y: 38, d: 1.8 },
    { x: 5, y: 62, d: 0.5 },
    { x: 20, y: 75, d: 1.1 },
    { x: 38, y: 68, d: 0.7 },
    { x: 55, y: 80, d: 1.5 },
    { x: 70, y: 65, d: 0.1 },
    { x: 85, y: 78, d: 1.3 },
    { x: 12, y: 88, d: 0.9 },
    { x: 44, y: 92, d: 0.4 },
    { x: 60, y: 95, d: 1.7 },
    { x: 76, y: 88, d: 0.6 },
    { x: 93, y: 72, d: 1.0 },
    { x: 30, y: 55, d: 1.4 }
];

export function StakingPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 py-12 px-4 text-slate-950 dark:bg-[#06060f] dark:text-white">
            <div
                className="pointer-events-none absolute inset-0 dark:hidden"
                aria-hidden
                style={{
                    background:
                        "radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%)"
                }}
            />
            {/* Animated gradient orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="animate-float-orb   absolute -top-32 -left-32  h-[500px] w-[500px] rounded-full bg-purple-700/25  blur-[130px]" />
                <div className="animate-float-orb-2 absolute top-1/2  -right-40  h-[420px] w-[420px] rounded-full bg-blue-600/20   blur-[110px]" />
                <div className="absolute -bottom-20 left-1/3  h-[360px] w-[360px] rounded-full bg-violet-600/18 blur-[100px]" />
                <div
                    className="animate-float-orb   absolute top-1/4  left-1/2   h-[250px] w-[250px] rounded-full bg-indigo-500/12 blur-[80px]"
                    style={{ animationDelay: "-3s" }}
                />

                {/* Sparkle stars */}
                {STARS.map((s, i) => (
                    <div
                        key={i}
                        className="absolute h-[3px] w-[3px] rounded-full bg-slate-500/40 animate-pulse dark:bg-white/70"
                        style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}
                    />
                ))}

                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "60px 60px"
                    }}
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
                {/* Page header */}
                <div className="text-center mb-10">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/70 bg-white/70 px-4 py-1.5 shadow-sm backdrop-blur-sm dark:border-purple-500/40 dark:bg-purple-500/10">
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-purple-300">
                            Insurance Fund · {IF_CONFIG.label}
                        </span>
                    </div>

                    <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">Stake &amp; Earn</h1>

                    <p className="mx-auto max-w-xs text-[15px] leading-relaxed text-slate-600 dark:text-gray-400">
                        Deposit SOL into the <span className="text-purple-400 font-semibold">Insurance Fund</span> and earn trading fees from the protocol.
                    </p>
                </div>

                {/* Main staking panel */}
                <StakingPanel />

                {/* Stake History */}
                <div className="mt-6">
                    <StakeHistoryClient />
                </div>

                {/* How it works */}
                <div className="mt-8 space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.03] dark:shadow-none">
                    <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">How it works</h3>
                    <ol className="space-y-3">
                        {[
                            {
                                step: "01",
                                color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
                                title: "Connect wallet & Stake SOL",
                                body: "Deposit SOL into the Insurance Fund. You receive IF Shares representing your ownership in the fund."
                            },
                            {
                                step: "02",
                                color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
                                title: "Earn trading fees",
                                body: "Fees from all trading activity (trading fees + borrow rate) are distributed proportionally to your IF Shares."
                            },
                            {
                                step: "03",
                                color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
                                title: "Request unstake",
                                body: "When you want to withdraw, submit a request first. The fund enforces a cooldown period to ensure protocol liquidity."
                            },
                            {
                                step: "04",
                                color: "text-green-400 border-green-500/40 bg-green-500/10",
                                title: "Withdraw SOL after cooldown",
                                body: "Once the cooldown ends, confirm the final withdrawal. Your SOL plus accrued fees will arrive in your wallet."
                            }
                        ].map(({ step, color, title, body }) => (
                            <li key={step} className="flex gap-3">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center ${color}`}>
                                    {step}
                                </span>
                                <div className="pt-1">
                                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{title}</span>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500 dark:text-gray-500">{body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
