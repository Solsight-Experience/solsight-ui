"use client";

import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import Image from "next/image";
const SignInForm = nextDynamic(() => import("@/features/auth/components/sign-in-form"), { ssr: false });
const SignUpForm = nextDynamic(() => import("@/features/auth/components/sign-up-form"), { ssr: false });
import AuthBackground from "@/features/auth/components/auth-background";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Shield,
    Zap,
    Activity,
    Users,
    DollarSign,
    BarChart2,
    Lock,
    Globe,
    Cpu,
    Bell,
    ArrowRight,
    Check,
    ChevronRight,
    X,
    Star,
    Layers,
    RefreshCw,
    Github,
    Linkedin,
    GraduationCap,
    FileText,
    ShieldCheck
} from "lucide-react";
import { LegalDocument } from "@/features/auth/components/LegalDocument";
import { scrollToSection } from "@/lib/scroll-to-section";
import { privacyContent } from "@/lib/legal/privacy-policy";
import { tosContent } from "@/lib/legal/tos";

/* ─────────────────── data ─────────────────── */

const STATS = [
    { label: "Total Volume", value: 4.2, suffix: "B", prefix: "$", icon: DollarSign, color: "#a855f7", decimals: 1 },
    { label: "Active Traders", value: 128, suffix: "K+", prefix: "", icon: Users, color: "#3b82f6", decimals: 0 },
    { label: "Supported Chains", value: 24, suffix: "+", prefix: "", icon: Layers, color: "#ec4899", decimals: 0 },
    { label: "Uptime", value: 99.98, suffix: "%", prefix: "", icon: Activity, color: "#10b981", decimals: 2 }
];

const FEATURES = [
    {
        icon: Shield,
        title: "Bank-Grade Security",
        desc: "Multi-sig wallets & 256-bit AES encryption protect every asset at rest and in transit.",
        color: "rgba(139,92,246,0.1)",
        border: "rgba(139,92,246,0.25)",
        glow: "rgba(139,92,246,0.15)",
        iconColor: "#a78bfa"
    },
    {
        icon: Zap,
        title: "Lightning Execution",
        desc: "Sub-millisecond order matching engine handles 2M+ transactions per second across all chains.",
        color: "rgba(59,130,246,0.1)",
        border: "rgba(59,130,246,0.25)",
        glow: "rgba(59,130,246,0.15)",
        iconColor: "#60a5fa"
    },
    {
        icon: Activity,
        title: "Real-Time Analytics",
        desc: "Live charts, on-chain signals & market depth data refreshed every 100ms.",
        color: "rgba(236,72,153,0.1)",
        border: "rgba(236,72,153,0.25)",
        glow: "rgba(236,72,153,0.15)",
        iconColor: "#f472b6"
    },
    {
        icon: Globe,
        title: "Multi-Chain Support",
        desc: "Trade seamlessly across Solana, Ethereum, BNB Chain, and 20+ blockchains from one interface.",
        color: "rgba(16,185,129,0.1)",
        border: "rgba(16,185,129,0.25)",
        glow: "rgba(16,185,129,0.15)",
        iconColor: "#34d399"
    },
    {
        icon: Cpu,
        title: "AI-Powered Signals",
        desc: "Machine-learning models surface alpha opportunities before the crowd discovers them.",
        color: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.25)",
        glow: "rgba(245,158,11,0.15)",
        iconColor: "#fbbf24"
    },
    {
        icon: Bell,
        title: "Smart Alerts",
        desc: "Price triggers, whale movement notifications, and portfolio alerts in real-time via push & email.",
        color: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.25)",
        glow: "rgba(239,68,68,0.15)",
        iconColor: "#f87171"
    }
];

const STEPS = [
    {
        num: "01",
        title: "Create Your Account",
        desc: "Sign up in under 60 seconds — no KYC required to start exploring markets.",
        icon: Users
    },
    {
        num: "02",
        title: "Connect Your Wallet",
        desc: "Link Phantom, Solflare, MetaMask or any WalletConnect-compatible wallet instantly.",
        icon: Lock
    },
    {
        num: "03",
        title: "Start Trading",
        desc: "Execute swaps, limit orders, and DCA strategies with professional-grade tools.",
        icon: BarChart2
    }
];

const TESTIMONIALS = [
    {
        name: "Alex T.",
        role: "DeFi Trader",
        avatar: "AT",
        rating: 5,
        text: "SolSight's execution speed is unmatched. I've shaved 40% off my slippage just by switching from other aggregators."
    },
    {
        name: "Mira L.",
        role: "Portfolio Manager",
        avatar: "ML",
        rating: 5,
        text: "The multi-chain dashboard is exactly what I needed. Managing positions across 6 chains from one place is a game-changer."
    },
    {
        name: "David K.",
        role: "Quant Analyst",
        avatar: "DK",
        rating: 5,
        text: "The AI signals have genuinely impressed me. The models caught three major moves before they hit mainstream radar."
    }
];

const TEAM = [
    {
        student_id: "1",
        name: "Vo Van Nam",
        role: "Team Lead & Full-Stack Engineer",
        //bio: "Architected the core trading engine and real-time data pipeline. Passionate about DeFi protocol design.",
        initials: "NA",
        gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
        glow: "rgba(124,58,237,0.35)",
        github: "#",
        linkedin: "#",
        tags: ["Next.js", "Rust", "Solana"]
    },
    {
        student_id: "2",
        name: "Thai Dinh Ngan",
        role: "Blockchain & Smart Contracts",
        //bio: "Developed on-chain swap logic and multi-sig wallet integrations across Solana and EVM chains.",
        initials: "NG",
        gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
        glow: "rgba(59,130,246,0.35)",
        github: "#",
        linkedin: "#",
        tags: ["Anchor", "Solidity", "Web3.js"]
    },
    {
        student_id: "3",
        name: "Hoang Thanh Thao Nguyen",
        role: "Frontend & UI/UX",
        //bio: "Built the ML signal pipeline that processes 50M+ on-chain events daily to surface early alpha.",
        initials: "TN",
        gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
        glow: "rgba(236,72,153,0.35)",
        github: "#",
        linkedin: "#",
        tags: ["Python", "PyTorch", "Kafka"]
    },
    {
        student_id: "4",
        name: "Le Nguyen Hong Ngoc",
        role: "Backend & Infrastructure",
        //bio: "Engineered the high-throughput Axum API and Kubernetes deployment that guarantees 99.98% uptime.",
        initials: "NG",
        gradient: "linear-gradient(135deg, #10b981, #34d399)",
        glow: "rgba(16,185,129,0.35)",
        github: "#",
        linkedin: "#",
        tags: ["Rust", "Axum", "Kubernetes"]
    },
    {
        student_id: "5",
        name: "Nguyen Dang Minh Lan",
        role: "Backend & Infrastructure",
        //bio: "Designed the entire design system and crafted every pixel of the dashboard experience with precision.",
        initials: "LA",
        gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
        glow: "rgba(245,158,11,0.35)",
        github: "#",
        linkedin: "#",
        tags: ["Figma", "React", "Tailwind"]
    },
    {
        student_id: "6",
        name: "Nguyen Ngoc Dang",
        role: "Backend & Infrastructure",
        //bio: "Led penetration testing and implemented the audit framework that keeps every user asset safe.",
        initials: "DA",
        gradient: "linear-gradient(135deg, #ef4444, #f87171)",
        glow: "rgba(239,68,68,0.35)",
        github: "#",
        linkedin: "#",
        tags: ["Security", "Rust", "Playwright"]
    }
];

/* ─────────────────── hooks ─────────────────── */

function useCounter(target: number, decimals: number, inView: boolean) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / 60;
        const id = setInterval(() => {
            start += step;
            if (start >= target) {
                setValue(target);
                clearInterval(id);
            } else {
                setValue(start);
            }
        }, 16);
        return () => clearInterval(id);
    }, [inView, target]);
    return value.toFixed(decimals);
}

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                }
            },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

/* ─────────────────── sub-components ─────────────────── */

function StatCard({ stat, index }: { stat: (typeof STATS)[0]; index: number }) {
    const { ref, inView } = useInView();
    const display = useCounter(stat.value, stat.decimals, inView);
    return (
        <div
            ref={ref}
            className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`
            }}
        >
            <stat.icon style={{ color: stat.color }} className="w-5 h-5 mb-1" />
            <div className="text-3xl font-black text-white tracking-tight">
                {stat.prefix}
                {display}
                {stat.suffix}
            </div>
            <div className="text-white/40 text-xs font-medium tracking-wider uppercase">{stat.label}</div>
        </div>
    );
}

function FeatureCard({ f, idx }: { f: (typeof FEATURES)[0]; idx: number }) {
    const { ref, inView } = useInView(0.1);
    return (
        <div
            ref={ref}
            className="rounded-2xl p-6 transition-all duration-300 group cursor-default"
            style={{
                background: f.color,
                border: `1px solid ${f.border}`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${idx * 0.08}s, transform 0.6s ease ${idx * 0.08}s`
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${f.glow}`;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${f.border}` }}
            >
                <f.icon className="w-5 h-5" style={{ color: f.iconColor }} />
            </div>
            <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
            <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
        </div>
    );
}

function StepCard({ step, idx }: { step: (typeof STEPS)[0]; idx: number }) {
    const { ref, inView } = useInView(0.2);
    return (
        <div
            ref={ref}
            className="flex items-start gap-6"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateX(0)" : "translateX(-30px)",
                transition: `opacity 0.6s ease ${idx * 0.15}s, transform 0.6s ease ${idx * 0.15}s`
            }}
        >
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(168,85,247,0.2))",
                        border: "1px solid rgba(139,92,246,0.3)",
                        boxShadow: "0 0 30px rgba(124,58,237,0.15)"
                    }}
                >
                    <step.icon className="w-6 h-6 text-violet-300" />
                </div>
                {idx < STEPS.length - 1 && (
                    <div className="w-px flex-1 min-h-8" style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.3), transparent)" }} />
                )}
            </div>
            <div className="pt-3">
                <div className="text-violet-400/60 text-xs font-bold tracking-widest uppercase mb-1">{step.num}</div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
            </div>
        </div>
    );
}

function TestimonialCard({ t, idx }: { t: (typeof TESTIMONIALS)[0]; idx: number }) {
    const { ref, inView } = useInView(0.1);
    return (
        <div
            ref={ref}
            className="rounded-2xl p-6"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(139,92,246,0.15)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${idx * 0.12}s, transform 0.6s ease ${idx * 0.12}s`
            }}
        >
            <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
            </div>
            <p className="text-white/65 text-sm leading-relaxed mb-5">&quot;{t.text}&quot;</p>
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                    {t.avatar}
                </div>
                <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                </div>
            </div>
        </div>
    );
}

function MemberCard({ m, idx }: { m: (typeof TEAM)[0]; idx: number }) {
    const { ref, inView } = useInView(0.1);
    return (
        <div
            ref={ref}
            className="relative rounded-2xl p-6 flex flex-col gap-4 group transition-all duration-300"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0) scale(1)" : "translateY(24px) scale(0.98)",
                transition: `opacity 0.55s ease ${idx * 0.08}s, transform 0.55s ease ${idx * 0.08}s`
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.3)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${m.glow}`;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            {/* top row */}
            <div className="flex items-start justify-between gap-3">
                {/* avatar */}
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{ background: m.gradient, boxShadow: `0 0 24px ${m.glow}` }}
                >
                    {m.initials}
                </div>

                {/* social links */}
                <div className="flex items-center gap-2 mt-1">
                    <a
                        href={m.github}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,92,246,0.2)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                        }}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Github className="w-3.5 h-3.5 text-white/50" />
                    </a>
                    <a
                        href={m.linkedin}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(59,130,246,0.2)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                        }}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Linkedin className="w-3.5 h-3.5 text-white/50" />
                    </a>
                </div>
            </div>

            {/* info */}
            <div>
                <h3 className="text-white font-bold text-base leading-tight mb-0.5">{m.name}</h3>
                <p className="text-xs font-semibold mb-1" style={{ color: "rgba(167,139,250,0.9)" }}>
                    {m.role}
                </p>
                {/* <p className="text-white/45 text-xs leading-relaxed">{m.bio}</p> */}
            </div>

            {/* tech tags */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
                {m.tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white/60"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────── main page ─────────────────── */

function AuthenticationPage() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [mobileAuthOpen, setMobileAuthOpen] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const redirectTo = searchParams.get("redirect") || "/";
            router.replace(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, searchParams]);

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash === "privacy" || hash === "terms") {
            requestAnimationFrame(() => scrollToSection(hash));
        }
    }, []);

    if (isLoading || isAuthenticated) {
        return null;
    }

    return (
        <div
            className="dark min-h-screen flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(135deg, #070412 0%, #0d0920 40%, #060814 70%, #0a0612 100%)" }}
        >
            {/* Animated canvas background */}
            <AuthBackground />

            {/* ── ambient orbs ── */}
            <div
                className="fixed top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 1 }}
            />
            <div
                className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 1 }}
            />
            <div
                className="fixed top-[40%] left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(217,70,239,0.06) 0%, transparent 70%)", filter: "blur(50px)", zIndex: 1 }}
            />

            {/* ════════════════════════════════════════
                STICKY AUTH PANEL — desktop right side
            ════════════════════════════════════════ */}
            <aside
                className="hidden lg:flex flex-col fixed top-0 right-0 h-screen w-[360px] xl:w-[400px] z-50 overflow-y-auto"
                style={{
                    background: "rgba(10,0,20,0.75)",
                    backdropFilter: "blur(32px)",
                    borderLeft: "1px solid rgba(139,92,246,0.15)",
                    boxShadow: "-20px 0 80px rgba(124,58,237,0.12)"
                }}
            >
                {/* panel inner scroll container */}
                <div className="flex flex-col min-h-full px-7 py-8 gap-6">
                    {/* logo */}
                    <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity self-start">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src="/app_icon.png" alt="SolSight" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[15px] font-bold tracking-tight text-white">
                            Sol<span className="text-violet-400">Sight</span>
                        </span>
                    </Link>

                    {/* tab switcher */}
                    <div className="flex rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {["Sign In", "Create Account"].map((label, i) => {
                            const active = i === 0 ? isSignIn : !isSignIn;
                            return (
                                <button
                                    key={label}
                                    onClick={() => setIsSignIn(i === 0)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${active ? "text-white" : "text-white/40 hover:text-white/70"}`}
                                    style={
                                        active
                                            ? {
                                                  background: "linear-gradient(135deg, rgba(124,58,237,0.45) 0%, rgba(168,85,247,0.3) 100%)",
                                                  boxShadow: "0 0 20px rgba(124,58,237,0.2)",
                                                  border: "1px solid rgba(139,92,246,0.3)"
                                              }
                                            : {}
                                    }
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* form */}
                    <div className="flex-1">
                        {isSignIn ? <SignInForm onToggle={() => setIsSignIn(false)} /> : <SignUpForm onToggle={() => setIsSignIn(true)} />}
                    </div>

                    {/* benefits */}
                    <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="text-white/30 text-[11px] uppercase tracking-widest font-medium mb-3">Everything included</p>
                        {["Zero trading fees for 30 days", "Access to 24+ blockchain networks", "AI market signals & alerts"].map((item) => (
                            <div key={item} className="flex items-center gap-2.5 mb-2">
                                <div
                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(124,58,237,0.35)" }}
                                >
                                    <Check className="w-2.5 h-2.5 text-violet-300" />
                                </div>
                                <span className="text-white/50 text-xs">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* ════════════════════════════════════════
                MOBILE NAV
            ════════════════════════════════════════ */}
            <nav
                className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5"
                style={{ background: "rgba(10,0,20,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-md overflow-hidden">
                        <Image src="/app_icon.png" alt="SolSight" width={28} height={28} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-white">
                        Sol<span className="text-violet-400">Sight</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileAuthOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                >
                    Get Started <ChevronRight className="w-4 h-4" />
                </button>
            </nav>

            {/* mobile auth modal */}
            {mobileAuthOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                >
                    <div
                        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
                        style={{ background: "rgba(15,5,30,0.95)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(30px)" }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-white font-bold text-base">Welcome to SolSight</span>
                            <button onClick={() => setMobileAuthOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div
                            className="flex rounded-2xl p-1 gap-1 mb-5"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            {["Sign In", "Create Account"].map((label, i) => {
                                const active = i === 0 ? isSignIn : !isSignIn;
                                return (
                                    <button
                                        key={label}
                                        onClick={() => setIsSignIn(i === 0)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${active ? "text-white" : "text-white/40"}`}
                                        style={
                                            active
                                                ? {
                                                      background: "linear-gradient(135deg, rgba(124,58,237,0.45),rgba(168,85,247,0.3))",
                                                      border: "1px solid rgba(139,92,246,0.3)"
                                                  }
                                                : {}
                                        }
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        {isSignIn ? <SignInForm onToggle={() => setIsSignIn(false)} /> : <SignUpForm onToggle={() => setIsSignIn(true)} />}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════
                SCROLLABLE CONTENT — left of auth panel
            ════════════════════════════════════════ */}
            <div className="lg:pr-[360px] xl:pr-[400px] relative z-10">
                {/* ── desktop top nav (left side) ── */}
                <header
                    className="hidden lg:flex items-center justify-between px-10 py-5 sticky top-0 z-40"
                    style={{ background: "rgba(10,0,20,0.6)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                    <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src="/app_icon.png" alt="SolSight" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[15px] font-bold tracking-tight text-white">
                            Sol<span className="text-violet-400">Sight</span>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-7">
                        {["Features", "How It Works", "Testimonials"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                                className="text-white/50 hover:text-white/90 transition-colors text-sm font-medium"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>
                </header>

                {/* ══════════════════
                    HERO SECTION
                ══════════════════ */}
                <section ref={heroRef} className="min-h-screen flex flex-col items-start justify-center px-8 lg:px-16 pt-20 pb-16 lg:pt-0">
                    {/* live badge */}
                    <div
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 animate-auth-entrance"
                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", animationFillMode: "both" }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Markets Open</span>
                        <span className="text-emerald-400/60 text-xs">— Live trading active</span>
                    </div>

                    {/* headline */}
                    <h1
                        className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.07] mb-6 text-transparent bg-clip-text animate-shimmer animate-auth-entrance"
                        style={{
                            backgroundImage: "linear-gradient(90deg, #c4b5fd 0%, #a78bfa 20%, #818cf8 40%, #c084fc 60%, #e879f9 80%, #a78bfa 100%)",
                            backgroundSize: "200% auto",
                            animationDelay: "0.1s",
                            animationFillMode: "both",
                            maxWidth: "700px"
                        }}
                    >
                        Access the
                        <br />
                        Future of
                        <br />
                        Finance
                    </h1>

                    {/* subtext */}
                    <p
                        className="text-white/50 text-base sm:text-lg leading-relaxed mb-10 max-w-xl animate-auth-entrance"
                        style={{ animationDelay: "0.2s", animationFillMode: "both" }}
                    >
                        Trade crypto assets with professional-grade tools. Real-time signals, DeFi access, and multi-chain portfolio management — all in one
                        platform built for serious traders.
                    </p>

                    {/* feature pills */}
                    <div className="flex flex-wrap gap-3 mb-12 animate-auth-entrance" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                        {[
                            { icon: Shield, label: "Bank-Grade Security", color: "#a78bfa" },
                            { icon: Zap, label: "Lightning Execution", color: "#60a5fa" },
                            { icon: Activity, label: "Real-Time Analytics", color: "#f472b6" }
                        ].map(({ icon: Icon, label, color }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                            >
                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* CTA row */}
                    <div className="flex flex-wrap items-center gap-4 animate-auth-entrance" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
                        <button
                            onClick={() => setMobileAuthOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-sm"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}
                        >
                            Start Trading Free <ArrowRight className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                            <RefreshCw className="w-4 h-4 text-emerald-400" />
                            No credit card required
                        </div>
                    </div>

                    {/* scroll indicator */}
                    <div className="mt-16 flex flex-col items-start gap-2 opacity-40">
                        <span className="text-white/60 text-xs uppercase tracking-widest">Scroll to explore</span>
                        <div className="w-px h-12 bg-gradient-to-b from-violet-400 to-transparent" />
                    </div>
                </section>

                {/* ══════════════════
                    STATS BAR
                ══════════════════ */}
                <section className="px-8 lg:px-16 py-16">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {STATS.map((stat, i) => (
                            <StatCard key={stat.label} stat={stat} index={i} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════
                    FEATURES GRID
                ══════════════════ */}
                <section id="features" className="px-8 lg:px-16 py-16">
                    <div className="mb-12">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
                        >
                            <span className="text-violet-400 text-xs font-semibold tracking-wider uppercase">Platform Features</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                            Everything You Need
                            <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #a78bfa, #e879f9)" }}>
                                to Trade Like a Pro
                            </span>
                        </h2>
                        <p className="text-white/45 text-base max-w-lg leading-relaxed">
                            A complete toolkit for modern crypto traders — from spot trading to DeFi automation.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {FEATURES.map((f, idx) => (
                            <FeatureCard key={f.title} f={f} idx={idx} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════
                    HOW IT WORKS
                ══════════════════ */}
                <section id="how-it-works" className="px-8 lg:px-16 py-16">
                    <div className="mb-12">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
                        >
                            <span className="text-purple-400 text-xs font-semibold tracking-wider uppercase">How It Works</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            Up & Running in{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #c084fc, #f472b6)" }}>
                                3 Minutes
                            </span>
                        </h2>
                    </div>
                    <div className="flex flex-col gap-6 max-w-2xl">
                        {STEPS.map((step, idx) => (
                            <StepCard key={step.num} step={step} idx={idx} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════
                    TESTIMONIALS
                ══════════════════ */}
                <section id="testimonials" className="px-8 lg:px-16 py-16">
                    <div className="mb-12">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "rgba(217,70,239,0.12)", border: "1px solid rgba(217,70,239,0.25)" }}
                        >
                            <span className="text-fuchsia-400 text-xs font-semibold tracking-wider uppercase">Testimonials</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            Trusted by{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #e879f9, #a78bfa)" }}>
                                128K+ Traders
                            </span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {TESTIMONIALS.map((t, idx) => (
                            <TestimonialCard key={t.name} t={t} idx={idx} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════
                    ABOUT US SECTION
                ══════════════════ */}
                <section id="about-us" className="px-8 lg:px-16 py-16">
                    <div className="mb-12">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
                        >
                            <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-violet-400 text-xs font-semibold tracking-wider uppercase">About Us</span>
                        </div>
                        <p className="text-white/45 text-base max-w-xl leading-relaxed">
                            We are a team of 6 passionate engineers and designers from{" "}
                            <span className="text-violet-300 font-semibold">Ho Chi Minh City University of Science (HCMUS)</span>, building the next generation
                            of crypto trading infrastructure.
                        </p>
                    </div>

                    {/* university badge */}
                    <div
                        className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mb-10"
                        style={{
                            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08))",
                            border: "1px solid rgba(139,92,246,0.25)"
                        }}
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                        >
                            <GraduationCap className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <div className="text-white text-sm font-bold">Ho Chi Minh City University of Science</div>
                            <div className="text-white/40 text-xs">Faculty of Information Technology · Class of 2022</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {TEAM.map((m, idx) => (
                            <MemberCard key={m.student_id} m={m} idx={idx} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════
                    LEGAL — PRIVACY POLICY
                ══════════════════ */}
                <section id="privacy" className="px-8 lg:px-16 py-16 scroll-mt-20">
                    <div className="mb-8">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-violet-400 text-xs font-semibold tracking-wider uppercase">Legal</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            Privacy{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #a78bfa, #e879f9)" }}>
                                Policy
                            </span>
                        </h2>
                        <p className="text-white/45 text-base max-w-xl leading-relaxed mt-3">
                            How we collect, use, and protect your data on the SolSight platform.
                        </p>
                    </div>
                    <div className="max-w-3xl max-h-[600px] overflow-y-auto max-w-full">
                        <LegalDocument content={privacyContent} badge="Privacy Policy" />
                    </div>
                </section>

                {/* ══════════════════
                    LEGAL — TERMS OF SERVICE
                ══════════════════ */}
                <section id="terms" className="px-8 lg:px-16 py-16 scroll-mt-20">
                    <div className="mb-8">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
                        >
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-purple-400 text-xs font-semibold tracking-wider uppercase">Legal</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            Terms of{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #c084fc, #a78bfa)" }}>
                                Service
                            </span>
                        </h2>
                        <p className="text-white/45 text-base max-w-xl leading-relaxed mt-3">
                            Rules and conditions for using the SolSight decentralized trading platform.
                        </p>
                    </div>
                    <div className="max-w-3xl max-h-[600px] overflow-y-auto max-w-full">
                        <LegalDocument content={tosContent} badge="Terms of Service" />
                    </div>
                </section>

                {/* footer */}
                <footer className="px-8 lg:px-16 py-10 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-6 h-6 rounded-md overflow-hidden">
                                <Image src="/app_icon.png" alt="SolSight" width={24} height={24} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-white">
                                Sol<span className="text-violet-400">Sight</span>
                            </span>
                        </Link>
                        <p className="text-white/25 text-xs text-center">© 2025 SolSight. All rights reserved.</p>
                        <div className="flex items-center gap-5">
                            {[
                                { label: "Privacy", id: "privacy" },
                                { label: "Terms", id: "terms" },
                                { label: "Support", id: null }
                            ].map(({ label, id }) =>
                                id ? (
                                    <a
                                        key={label}
                                        href={`#${id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection(id);
                                            window.history.replaceState(null, "", `#${id}`);
                                        }}
                                        className="text-white/30 hover:text-violet-400 text-xs transition-colors"
                                    >
                                        {label}
                                    </a>
                                ) : (
                                    <a key={label} href="mailto:support@solsight.io" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                                        {label}
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default function Authentication() {
    return (
        <Suspense>
            <AuthenticationPage />
        </Suspense>
    );
}
