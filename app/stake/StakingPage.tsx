"use client";

import React from "react";
import { StakingPanel, StakeHistory } from "@/features/staking/components";
import { useStakingWallet } from "@/features/staking/hooks/useStakingWallet";
import { IF_CONFIG } from "@/features/staking/constants/program";
import { ShieldCheck, Zap, Clock, TrendingUp } from "lucide-react";

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
    const { publicKey } = useStakingWallet();

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#06060f] py-12 px-4">
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
                        className="absolute h-[3px] w-[3px] rounded-full bg-white/70 animate-pulse"
                        style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.d}s` }}
                    />
                ))}

                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
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
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1.5 mb-5 backdrop-blur-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-semibold tracking-wide text-purple-300 uppercase">Insurance Fund · {IF_CONFIG.label}</span>
                    </div>

                    <h1
                        className="mb-3 text-5xl font-extrabold tracking-tight"
                        style={{
                            background: "linear-gradient(135deg, #fff 30%, #a78bfa 60%, #60a5fa 90%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                        }}
                    >
                        Stake &amp; Earn
                    </h1>

                    <p className="text-gray-400 text-[15px] leading-relaxed max-w-xs mx-auto">
                        Deposit SOL into the <span className="text-purple-400 font-semibold">Insurance Fund</span> and earn trading fees from the protocol.
                    </p>
                </div>

                {/* Stats pills */}
                <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                    {[
                        {
                            icon: TrendingUp,
                            label: "Yield Source",
                            value: "IF Fees",
                            color: "text-purple-400",
                            border: "border-purple-500/25",
                            bg: "bg-purple-500/5"
                        },
                        { icon: Clock, label: "Cooldown", value: "Variable", color: "text-yellow-400", border: "border-yellow-500/25", bg: "bg-yellow-500/5" },
                        { icon: Zap, label: "Network", value: IF_CONFIG.label, color: "text-blue-400", border: "border-blue-500/25", bg: "bg-blue-500/5" }
                    ].map(({ icon: Icon, label, value, color, border, bg }) => (
                        <div key={label} className={`rounded-2xl border ${border} ${bg} py-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5`}>
                            <Icon className={`h-4 w-4 mx-auto mb-1.5 ${color}`} />
                            <p className={`text-base font-bold ${color}`}>{value}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-medium uppercase tracking-wide">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Main staking panel */}
                <StakingPanel />

                {/* Stake History */}
                <div className="mt-6">
                    <StakeHistory walletPubkey={publicKey} />
                </div>

                {/* How it works */}
                <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-4 backdrop-blur-sm">
                    <h3 className="text-white font-bold text-base tracking-tight">How it works</h3>
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
                                    <span className="text-white font-semibold text-[13px]">{title}</span>
                                    <p className="text-gray-500 text-[12px] mt-0.5 leading-relaxed">{body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
