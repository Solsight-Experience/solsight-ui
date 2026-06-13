"use client";

import { useState, memo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { SearchDialog } from "@/components/search/SearchDialog";
import {
    SearchIcon,
    ChevronDown,
    Bell,
    BarChart2,
    Wallet,
    Settings,
    LogOut,
    User,
    TrendingUp,
    Zap,
    LayoutGrid,
    Search,
    Sun,
    Moon,
    ShieldCheck,
    Menu,
    X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LogoutConfirmDialog from "../auth/LogoutConfirmDialog";
import DisconnectWalletsConfirmDialog from "../auth/DisconnectWalletsConfirmDialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NotificationBadge, NotificationPanel } from "@/features/notifications/components";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import ClusterToggle from "@/components/layout/cluster-toggle";

type AuthUser = NonNullable<ReturnType<typeof useAuth>["user"]>;

const TICKERS = [
    { symbol: "BONK/SOL", price: "0.00000019", change: 2.11 },
    { symbol: "JUP/SOL", price: "0.00562", change: 5.43 },
    { symbol: "RAY/SOL", price: "0.0264", change: 8.92 },
    { symbol: "PYTH/SOL", price: "0.00285", change: 1.73 },
    { symbol: "WIF/SOL", price: "0.0119", change: -0.91 },
    { symbol: "JTO/SOL", price: "0.0189", change: 2.67 },
    { symbol: "ORCA/SOL", price: "0.0171", change: -1.2 }
];

const BP_COMPACT = 1000; // below this: icons-only nav
const BP_SIDEBAR = 700; // below this: hamburger + slide-in sidebar

function useWindowWidth() {
    const [width, setWidth] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 9999));
    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return width;
}

export default function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const { unreadCount, isPanelOpen, setPanelOpen } = useNotifications();
    const { theme, setTheme } = useTheme();
    const isOnline = useOnlineStatus();

    const [searchOpen, setSearchOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const [confirmDisconnectWalletsOpen, setConfirmDisconnectWalletsOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const windowWidth = useWindowWidth();
    const isSidebarMode = windowWidth < BP_SIDEBAR;
    const isCompactMode = !isSidebarMode && windowWidth < BP_COMPACT;

    const handleOpen = useCallback(() => setSearchOpen(true), []);
    const handleDialogChange = useCallback((open: boolean) => setSearchOpen(open), []);

    // removed unused handleDisConnectWallets (was opening disconnect dialog)

    const handleLogout = async () => {
        await logout();
        setAvatarMenuOpen(false);
        setConfirmLogoutOpen(false);
        setConfirmDisconnectWalletsOpen(false);
        setSidebarOpen(false);
    };

    // Close sidebar on width increase past threshold
    useEffect(() => {
        if (!isSidebarMode && sidebarOpen) setSidebarOpen(false);
    }, [isSidebarMode, sidebarOpen]);

    // Close sidebar on Escape key
    useEffect(() => {
        if (!sidebarOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [sidebarOpen]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#05050a]/80 border-b border-black/[0.06] dark:border-white/[0.04]">
                {/* ── Ticker strip ─────────────────────────────────────────── */}
                <div className="flex items-center h-[26px] border-b border-white/[0.04] overflow-hidden bg-black/30">
                    <div
                        className={`flex items-center gap-1 px-3 h-full shrink-0
                            text-[9px] font-bold tracking-[0.12em] uppercase
                            border-r ${
                                isOnline ? "text-violet-400 bg-violet-500/10 border-violet-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            }`}
                    >
                        <Zap size={10} />
                        <span>{isOnline ? "Live" : "..."}</span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <div className="flex w-max hover:[animation-play-state:paused]" style={{ animation: "ticker-scroll 30s linear infinite" }}>
                            {[...TICKERS, ...TICKERS].map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-5 text-[10px] border-r border-white/5">
                                    <span className="text-white/40 tracking-wide">{t.symbol}</span>
                                    <span className="text-white/80 font-semibold">{t.price}</span>
                                    <span className={t.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                                        {t.change >= 0 ? "+" : ""}
                                        {t.change}%
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main Nav Bar ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 h-14">
                    {/* Left: logo + nav */}
                    <div className="flex items-center gap-0">
                        <HeaderIcon />

                        {!isSidebarMode && (
                            <div className="ml-4">
                                <ClusterToggle />
                            </div>
                        )}

                        {/* Divider — hidden in sidebar mode */}
                        {!isSidebarMode && <div className="w-px h-5 bg-white/10 mx-6" />}

                        {/* Nav links — hidden in sidebar mode, shown inline otherwise */}
                        {!isSidebarMode && <NavLinks iconsOnly={isCompactMode} />}
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2">
                        {/* Search — always visible; compact = icon only */}
                        {!isSidebarMode && <SearchBox onActivate={handleOpen} compact={isCompactMode} />}

                        {isAuthenticated && (
                            <>
                                {/* Theme toggle */}
                                <button
                                    aria-label="Toggle theme"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="relative flex items-center justify-center w-[34px] h-[34px]
                                       bg-white/[0.04] border border-white/[0.09] rounded-lg
                                       text-white/45 cursor-pointer transition-all duration-150
                                       hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15"
                                >
                                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                                </button>

                                {/* Notification Bell — hide in sidebar mode (shown in sidebar) */}
                                {!isSidebarMode && (
                                    <Popover open={isPanelOpen} onOpenChange={setPanelOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                aria-label="Notifications"
                                                className="relative flex items-center justify-center w-[34px] h-[34px]
                                                   bg-white/[0.04] border border-white/[0.09] rounded-lg
                                                   text-white/45 cursor-pointer transition-all duration-150
                                                   hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15"
                                            >
                                                <Bell size={15} />
                                                <NotificationBadge count={unreadCount} />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" sideOffset={8} className="p-0 border-0 shadow-none bg-transparent">
                                            <NotificationPanel />
                                        </PopoverContent>
                                    </Popover>
                                )}

                                {/* User dropdown — hide in sidebar mode */}
                                {!isSidebarMode && (
                                    <UserDropdown
                                        user={user}
                                        open={avatarMenuOpen}
                                        onToggle={() => setAvatarMenuOpen((v) => !v)}
                                        onClose={() => setAvatarMenuOpen(false)}
                                        onLogout={() => setConfirmLogoutOpen(true)}
                                    />
                                )}
                            </>
                        )}

                        {/* Sign-in button (unauthenticated) — always visible */}
                        {!isAuthenticated && !isSidebarMode && <SignInButton />}

                        {/* ── Hamburger (sidebar mode only) ─────────────── */}
                        {isSidebarMode && (
                            <button
                                aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
                                aria-expanded={sidebarOpen}
                                aria-controls="mobile-sidebar"
                                onClick={() => setSidebarOpen((v) => !v)}
                                className="flex items-center justify-center w-[36px] h-[36px]
                                   bg-white/[0.04] border border-white/[0.09] rounded-lg
                                   text-white/60 cursor-pointer transition-all duration-150
                                   hover:bg-white/[0.08] hover:text-white/90"
                            >
                                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        )}
                    </div>
                </div>

                <style>{`@keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

                <SearchDialog isOpen={searchOpen} onCloseAction={handleDialogChange} />
                <DisconnectWalletsConfirmDialog
                    isOpen={confirmDisconnectWalletsOpen}
                    onClose={() => setConfirmDisconnectWalletsOpen(false)}
                    onSuccess={() => handleLogout()}
                />
                <LogoutConfirmDialog
                    isOpen={confirmLogoutOpen}
                    onClose={() => setConfirmLogoutOpen(false)}
                    onLogout={handleLogout}
                    onDisconnectWallets={() => setConfirmDisconnectWalletsOpen(true)}
                />
            </header>

            {/* ── Slide-In Sidebar (sidebar mode only) ─────────────────────── */}
            <Sidebar
                id="mobile-sidebar"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isAuthenticated={isAuthenticated}
                user={user}
                unreadCount={unreadCount}
                isPanelOpen={isPanelOpen}
                setPanelOpen={setPanelOpen}
                onSearchOpen={handleOpen}
                onLogout={() => setConfirmLogoutOpen(true)}
            />
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide-In Sidebar (for narrow viewports)
 * ─────────────────────────────────────────────────────────────────────────── */
interface SidebarProps {
    id: string;
    open: boolean;
    onClose: () => void;
    isAuthenticated: boolean;

    user: AuthUser | null;
    unreadCount: number;
    isPanelOpen: boolean;
    setPanelOpen: (v: boolean) => void;
    onSearchOpen: () => void;
    onLogout: () => void;
}

function Sidebar({ id, open, onClose, isAuthenticated, user, onSearchOpen, onLogout }: SidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) sidebarRef.current?.focus();
    }, [open]);

    return (
        <>
            {/* Backdrop — matches LogoutConfirmDialog pattern */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className="fixed inset-0 z-[48] bg-gray-500/20 dark:bg-black/70 backdrop-blur-sm"
                style={{
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.25s ease"
                }}
            />

            {/* Panel */}
            <div
                id={id}
                ref={sidebarRef}
                role="navigation"
                aria-label="Mobile navigation"
                tabIndex={-1}
                className="fixed top-0 left-0 bottom-0 w-[280px] z-[49] flex flex-col outline-none overflow-y-auto
                           bg-[var(--surface-panel)] border-r border-[var(--border-subtle)]
                           shadow-[4px_0_16px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.50)]"
                style={{
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                    <HeaderIcon />
                    <button
                        aria-label="Close navigation"
                        onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                                   bg-[var(--surface-btn)] border border-[var(--border-default)]
                                   text-[var(--text-muted)] cursor-pointer transition-all duration-150
                                   hover:bg-[var(--surface-btn-hover)] hover:text-[var(--text-primary)]"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pt-8 pb-2">
                    <button
                        onClick={() => {
                            onSearchOpen();
                            onClose();
                        }}
                        className="flex items-center gap-2 w-full px-3.5 py-2 rounded-lg text-left cursor-pointer
                                   bg-[var(--surface-btn)] border border-[var(--border-default)]
                                   text-[var(--text-muted)] text-xs transition-all duration-150
                                   hover:bg-[var(--surface-btn-hover)] hover:text-[var(--text-primary)]"
                    >
                        <SearchIcon size={13} className="shrink-0" />
                        <span className="flex-1">Search token or pool…</span>
                        <kbd className="text-[0.625rem] text-[var(--text-disabled)] border border-[var(--border-subtle)] rounded px-1.5 py-[1px]">⌘K</kbd>
                    </button>
                </div>

                {/* Nav links */}
                <nav aria-label="Sidebar navigation" className="px-2 flex-1 mt-2">
                    <p
                        className="text-[0.625rem] font-bold tracking-[0.10em] uppercase
                                  text-[var(--text-disabled)] px-3 pt-2 pb-1 m-0"
                    >
                        Navigation
                    </p>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 no-underline
                                       text-[0.8125rem] font-semibold
                                       text-[var(--text-secondary)] transition-all duration-150
                                       hover:bg-[var(--surface-btn-hover)] hover:text-[var(--text-primary)]"
                        >
                            <span className="flex text-violet-500 dark:text-violet-400">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer: user / auth */}
                <div className="border-t border-[var(--border-subtle)] p-4">
                    {isAuthenticated ? (
                        <div className="flex flex-col gap-1">
                            <p className="text-[0.70rem] text-[var(--text-muted)] mb-2 truncate">{user?.email || "user@solsight.io"}</p>
                            <SidebarAction href="/profile" icon={<User size={14} />} label="Profile" onClose={onClose} />
                            <SidebarAction href="/notifications" icon={<Bell size={14} />} label="Notifications" onClose={onClose} />
                            <SidebarAction href="/settings" icon={<Settings size={14} />} label="Settings" onClose={onClose} />
                            <button
                                onClick={() => {
                                    onLogout();
                                    onClose();
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left
                                           text-[0.8rem] font-semibold border-none bg-transparent cursor-pointer
                                           text-red-400/70 dark:text-red-400/70 transition-all duration-150
                                           hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/authentication"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg no-underline
                                       bg-gradient-to-r from-violet-600 to-indigo-500 text-white
                                       text-xs font-bold tracking-[0.06em] uppercase
                                       transition-all duration-200 hover:brightness-110"
                        >
                            <Wallet size={14} />
                            Connect Wallet
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}

function SidebarAction({ href, icon, label, onClose }: { href: string; icon: React.ReactNode; label: string; onClose: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg no-underline
                       text-[0.8rem] font-medium text-[var(--text-secondary)]
                       transition-all duration-150
                       hover:bg-[var(--surface-btn-hover)] hover:text-[var(--text-primary)]"
        >
            <span className="flex text-[var(--text-muted)]">{icon}</span>
            {label}
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * HeaderIcon
 * ─────────────────────────────────────────────────────────────────────────── */
const HeaderIcon = memo(function HeaderIcon() {
    return (
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br" />
                <Image src="/app_icon.png" alt="SolSight" width={32} height={32} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white font-sans">
                Sol<span className="text-violet-400">Sight</span>
            </span>
        </Link>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
 * Nav items
 * ─────────────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { href: "/", label: "Discover", icon: <TrendingUp size={14} /> },
    { href: "/portfolio", label: "Portfolio", icon: <BarChart2 size={14} /> },
    { href: "/multi-chart", label: "Multi Viewer", icon: <LayoutGrid size={14} /> },
    { href: "/wallet-tracker", label: "Wallet Tracker", icon: <Search size={14} /> },
    { href: "/stake", label: "Stake", icon: <ShieldCheck size={14} /> }
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
 * NavLinks (inline — for larger viewports)
 * ─────────────────────────────────────────────────────────────────────────── */
interface NavLinksProps {
    iconsOnly: boolean;
}
const NavLinks = memo(function NavLinks({ iconsOnly }: NavLinksProps) {
    return (
        <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    title={iconsOnly ? item.label : undefined}
                    aria-label={iconsOnly ? item.label : undefined}
                    className={`flex items-center gap-1.5 rounded-md
                       text-[11px] font-semibold tracking-[0.05em] uppercase text-white/45
                       transition-all duration-150
                       hover:text-white/90 hover:bg-white/[0.06]
                       ${iconsOnly ? "px-2 py-1.5" : "px-3 py-1.5"}`}
                >
                    <span className={iconsOnly ? "" : "opacity-70"} style={{ display: "flex" }}>
                        {item.icon}
                    </span>
                    {!iconsOnly && item.label}
                </Link>
            ))}
        </nav>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
 * SearchBox
 * ─────────────────────────────────────────────────────────────────────────── */
interface SearchBoxProps {
    onActivate: () => void;
    compact: boolean;
}
const SearchBox = memo(function SearchBox({ onActivate, compact }: SearchBoxProps) {
    if (compact) {
        return (
            <button
                type="button"
                onClick={onActivate}
                aria-label="Search tokens and pools"
                className="flex items-center justify-center w-[34px] h-[34px]
                   bg-white/[0.04] border border-white/[0.09] rounded-lg
                   text-white/45 cursor-pointer transition-all duration-200
                   hover:bg-white/[0.07] hover:border-purple-500/40
                   hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15)]"
            >
                <SearchIcon size={14} />
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={onActivate}
            aria-label="Search tokens and pools"
            className="flex items-center gap-2 w-56 h-[34px] px-3
               bg-white/[0.04] border border-white/[0.09] rounded-lg text-left cursor-pointer
               transition-all duration-200
               hover:bg-white/[0.07] hover:border-purple-500/40
               hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15)]"
        >
            <SearchIcon size={13} className="text-white/25 shrink-0" />
            <span className="flex-1 text-[11.5px] text-white/30">Search token or pool...</span>
            <kbd className="text-[9px] text-white/20 border border-white/10 rounded px-1.5 py-[1px]">⌘K</kbd>
        </button>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
 * SignInButton
 * ─────────────────────────────────────────────────────────────────────────── */
const SignInButton = memo(function SignInButton() {
    return (
        <Link
            href="/authentication"
            className="flex items-center gap-1.5 px-5 h-[34px] rounded-lg
               bg-gradient-to-r from-violet-600 to-indigo-500 text-white
               text-[12px] font-bold tracking-[0.06em] uppercase
               transition-all duration-200
               hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/30
               active:scale-[0.98]"
        >
            <Wallet size={13} />
            Connect
        </Link>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
 * UserDropdown
 * ─────────────────────────────────────────────────────────────────────────── */
interface UserDropdownProps {
    user: AuthUser | null;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
    onLogout: () => void;
}
function UserDropdown({ user, open, onToggle, onClose, onLogout }: UserDropdownProps) {
    return (
        <div
            className="relative"
            onBlur={(e) => {
                // If focus moves outside the dropdown container, close it
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    onClose();
                }
            }}
        >
            <button
                onClick={onToggle}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-2 pl-1.5 pr-2.5 h-[34px]
                 bg-white/[0.04] border border-white/[0.09] rounded-lg
                 cursor-pointer transition-all duration-150
                 hover:bg-white/[0.07] hover:border-purple-500/35"
            >
                <div className="w-6 h-6 rounded-full border-[1.5px] border-purple-500/60 overflow-hidden shrink-0">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="/user.png" alt="User Avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
                <span
                    className="text-[11.5px] font-semibold text-white/75 tracking-wide
                               max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                    {user?.email?.split("@")[0] || "Trader"}
                </span>
                <ChevronDown size={13} className={`text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+8px)] w-[220px] z-50
                            bg-[var(--surface-overlay)] border border-white/10 rounded-xl overflow-hidden
                            shadow-[var(--shadow-dropdown)]"
                    >
                        <div className="px-3.5 py-3 bg-purple-500/[0.06]">
                            <p className="text-[11px] text-white/50 truncate">{user?.email || "user@solsight.io"}</p>
                        </div>
                        <div className="h-px bg-white/[0.07] my-0.5" />
                        <DropdownItem href="/profile" icon={<User size={14} />} label="Profile" />
                        <DropdownItem href="/portfolio" icon={<BarChart2 size={14} />} label="Portfolio" />
                        <DropdownItem href="/notifications" icon={<Bell size={14} />} label="Notifications" />
                        <DropdownItem href="/settings" icon={<Settings size={14} />} label="Settings" />
                        <div className="h-px bg-white/[0.07] my-0.5" />
                        <button
                            role="menuitem"
                            onClick={onLogout}
                            className="flex items-center gap-2.5 w-full px-3.5 py-2.5
                               text-[12px] font-medium tracking-wide text-red-400/70
                               bg-transparent border-none text-left cursor-pointer
                               transition-all duration-150
                               hover:bg-red-400/[0.07] hover:text-red-400"
                        >
                            <LogOut size={14} className="text-red-400/50 shrink-0" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * DropdownItem
 * ─────────────────────────────────────────────────────────────────────────── */
interface DropdownItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
}
const DropdownItem = memo(function DropdownItem({ href, icon, label }: DropdownItemProps) {
    return (
        <Link
            href={href}
            role="menuitem"
            className="flex items-center gap-2.5 px-3.5 py-2.5 no-underline
               text-[12px] font-medium tracking-wide text-white/60
               transition-all duration-[120ms]
               hover:bg-white/[0.05] hover:text-white/90"
        >
            <span className="text-white/30 shrink-0">{icon}</span>
            <span>{label}</span>
        </Link>
    );
});
