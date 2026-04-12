"use client";

import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";
import AuthBackground from "@/components/auth/auth-background";
import { useState } from "react";
import Link from "next/link";
import { Shield, Zap, TrendingUp, ChevronLeft, Activity, Users, DollarSign } from "lucide-react";

const STATS = [
    { label: "24h Volume", value: "$4.2B", icon: DollarSign, color: "text-purple-400" },
    { label: "Active Traders", value: "128K+", icon: Users, color: "text-blue-400" },
    { label: "Avg. Return", value: "+34.7%", icon: TrendingUp, color: "text-emerald-400" }
];

const FEATURES = [
    {
        icon: Shield,
        title: "Bank-Grade Security",
        desc: "Multi-sig wallets & 256-bit encryption",
        color: "from-purple-500/20 to-purple-600/10",
        border: "border-purple-500/20",
        iconColor: "text-purple-400"
    },
    {
        icon: Zap,
        title: "Lightning Execution",
        desc: "Sub-millisecond order matching engine",
        color: "from-blue-500/20 to-blue-600/10",
        border: "border-blue-500/20",
        iconColor: "text-blue-400"
    },
    {
        icon: Activity,
        title: "Real-Time Analytics",
        desc: "Live charts, signals & market depth",
        color: "from-pink-500/20 to-pink-600/10",
        border: "border-pink-500/20",
        iconColor: "text-pink-400"
    }
];

export default function Authentication() {
    const [isSignIn, setIsSignIn] = useState(true);

    return (
        <div
            className="min-h-screen flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(135deg, #070412 0%, #0d0920 40%, #060814 70%, #0a0612 100%)" }}
        >
            {/* Animated canvas background */}
            <AuthBackground />

            {/* Floating orbs */}
            <div
                className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none animate-float-orb"
                style={{
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
                    filter: "blur(40px)",
                    zIndex: 1
                }}
            />
            <div
                className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none animate-float-orb-2"
                style={{
                    background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
                    filter: "blur(60px)",
                    zIndex: 1
                }}
            />
            <div
                className="fixed top-[30%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none animate-float-orb"
                style={{
                    background: "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)",
                    filter: "blur(40px)",
                    animationDelay: "3s",
                    zIndex: 1
                }}
            />

            {/* Top nav bar */}
            <nav
                className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/[0.05]"
                style={{ backdropFilter: "blur(10px)", background: "rgba(7, 4, 18, 0.6)" }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <div
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden
                                    "
                    >
                        <div className="absolute inset-0 bg-gradient-to-br" />
                        <img src="/app_icon.png" alt="SolSight" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-white font-sans">
                        Sol<span className="text-violet-400">Sight</span>
                    </span>
                </Link>

                <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white/90 transition-colors text-xs font-medium">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Home
                </Link>
            </nav>
            {/* Main content */}
            <div className="relative z-20 flex-1 flex items-start lg:items-center justify-center px-4 py-8 lg:py-0">
                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 items-start pt-8">
                    {/* LEFT PANEL — Branding */}
                    <div className="hidden lg:flex flex-col flex-1 animate-auth-left" style={{ opacity: 0, animationFillMode: "forwards" }}>
                        {/* Live badge */}
                        <div className="inline-flex items-center gap-2 mb-8 self-start">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Markets Open</span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="text-5xl xl:text-6xl font-black leading-[1.1] mb-6 text-transparent bg-clip-text animate-shimmer"
                            style={{
                                backgroundImage: "linear-gradient(90deg, #c4b5fd 0%, #a78bfa 20%, #818cf8 40%, #c084fc 60%, #e879f9 80%, #a78bfa 100%)",
                                backgroundSize: "200% auto"
                            }}
                        >
                            Access the
                            <br />
                            Future of
                            <br />
                            Finance
                        </h1>

                        <p className="text-white/50 text-base leading-relaxed mb-10 max-w-sm">
                            Trade crypto assets with professional-grade tools. Real-time signals, DeFi access, and multi-chain portfolio management — all in one
                            platform.
                        </p>

                        {/* Feature cards */}
                        <div className="flex flex-col gap-3">
                            {FEATURES.map((f) => (
                                <div key={f.title} className={`flex items-center gap-4 rounded-xl border ${f.border} p-3.5 bg-gradient-to-r ${f.color}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.06] flex-shrink-0`}>
                                        <f.icon className={`w-4 h-4 ${f.iconColor}`} />
                                    </div>
                                    <div>
                                        <div className="text-white/90 text-sm font-semibold">{f.title}</div>
                                        <div className="text-white/40 text-xs">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Decoration ring */}
                        <div className="relative mt-12 ml-4 w-48 h-48 opacity-30">
                            <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin-slow" style={{ borderStyle: "dashed" }} />
                            <div
                                className="absolute inset-6 rounded-full border border-blue-500/20 animate-spin-slow"
                                style={{ animationDirection: "reverse", animationDuration: "14s" }}
                            />
                            <div className="absolute inset-12 rounded-full border border-pink-500/20 animate-spin-slow" style={{ animationDuration: "8s" }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-purple-400/50" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL — Auth form */}
                    <div
                        className="w-full lg:w-auto lg:min-w-[420px] xl:min-w-[460px] animate-auth-entrance"
                        style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.1s" }}
                    >
                        {/* Tab switcher */}
                        <div
                            className="flex mb-6 rounded-2xl p-1 gap-1"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <button
                                onClick={() => setIsSignIn(true)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    isSignIn ? "text-white" : "text-white/40 hover:text-white/70"
                                }`}
                                style={
                                    isSignIn
                                        ? {
                                              background: "linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(59,130,246,0.3) 100%)",
                                              boxShadow: "0 0 20px rgba(139,92,246,0.2)",
                                              border: "1px solid rgba(139,92,246,0.3)"
                                          }
                                        : {}
                                }
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsSignIn(false)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    !isSignIn ? "text-white" : "text-white/40 hover:text-white/70"
                                }`}
                                style={
                                    !isSignIn
                                        ? {
                                              background: "linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(59,130,246,0.3) 100%)",
                                              boxShadow: "0 0 20px rgba(139,92,246,0.2)",
                                              border: "1px solid rgba(139,92,246,0.3)"
                                          }
                                        : {}
                                }
                            >
                                Create Account
                            </button>
                        </div>

                        {/* Form card */}
                        {isSignIn ? <SignInForm onToggle={() => setIsSignIn(false)} /> : <SignUpForm onToggle={() => setIsSignIn(true)} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
