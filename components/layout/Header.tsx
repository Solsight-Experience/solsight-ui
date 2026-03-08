'use client';

import { useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { SearchDialog } from '@/components/search/SearchDialog';
import {
  SearchIcon, ChevronDown, Bell, BarChart2,
  Wallet, Settings, LogOut, User, TrendingUp, Zap, LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LogoutConfirmDialog from '../auth/LogoutConfirmDialog';

const TICKERS = [
  { symbol: 'SOL/USDT',  price: '182.34',    change: '+3.21%', up: true  },
  { symbol: 'BTC/USDT',  price: '67,420',    change: '+1.08%', up: true  },
  { symbol: 'ETH/USDT',  price: '3,512.90',  change: '-0.74%', up: false },
  { symbol: 'JUP/USDT',  price: '1.024',     change: '+5.43%', up: true  },
  { symbol: 'BONK/USDT', price: '0.00003421',change: '-2.11%', up: false },
  { symbol: 'RAY/USDT',  price: '4.81',      change: '+8.92%', up: true  },
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  const [searchOpen,        setSearchOpen]        = useState(false);
  const [avatarMenuOpen,    setAvatarMenuOpen]    = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const handleOpen         = useCallback(() => setSearchOpen(true), []);
  const handleDialogChange = useCallback((open: boolean) => setSearchOpen(open), []);

  const handleLogout = async () => {
    await logout();
    setAvatarMenuOpen(false);
    setConfirmLogoutOpen(false);
  };

  return (
    <header className="">
      <div className="flex items-center h-[26px] border-b border-white/[0.04] overflow-hidden bg-black/30">
        <div className="flex items-center gap-1 px-3 h-full shrink-0
                        text-[9px] font-bold tracking-[0.12em] uppercase
                        text-violet-400 bg-violet-500/10 border-r border-violet-500/20">
          <Zap size={10} />
          <span>Live</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div
            className="flex w-max hover:[animation-play-state:paused]"
            style={{ animation: 'ticker-scroll 30s linear infinite' }}
          >
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-5 text-[10px] border-r border-white/5">
                <span className="text-white/40 tracking-wide">{t.symbol}</span>
                <span className="text-white/80 font-semibold">{t.price}</span>
                <span className={t.up ? 'text-emerald-400' : 'text-red-400'}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Nav Bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 h-14">

        <div className="flex items-center">
          <HeaderIcon />
          <div className="w-px h-5 bg-white/10 mx-6" />
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          <SearchBox onActivate={handleOpen} />

          {!isAuthenticated ? (
            <SignInButton />
          ) : (
            <div className="flex items-center gap-2">

              {/* Notification Bell */}
              <button
                aria-label="Notifications"
                className="relative flex items-center justify-center w-[34px] h-[34px]
                           bg-white/[0.04] border border-white/[0.09] rounded-lg
                           text-white/45 cursor-pointer transition-all duration-150
                           hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15"
              >
                <Bell size={15} />
                <span className="absolute top-[7px] right-[8px] w-[5px] h-[5px]
                                 bg-red-400 rounded-full border-[1.5px] border-[#080b12]" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAvatarMenuOpen(v => !v)}
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
                  <span className="text-[11.5px] font-semibold text-white/75 tracking-wide
                                   max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.email?.split('@')[0] || 'Trader'}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-white/30 shrink-0 transition-transform duration-200 ${avatarMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {avatarMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] z-50
                                    bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden
                                    shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(139,92,246,0.08)]">

                      {/* Dropdown header */}
                      <div className="px-3.5 py-3 bg-purple-500/[0.06]">
                        <p className="text-[11px] text-white/50 truncate">{user?.email || 'user@solsight.io'}</p>
                      </div>

                      <div className="h-px bg-white/[0.07] my-0.5" />
                      <DropdownItem href="/profile"       icon={<User size={14} />}      label="Profile"       />
                      <DropdownItem href="/portfolio"     icon={<BarChart2 size={14} />}  label="Portfolio"     />
                      <DropdownItem href="/notifications" icon={<Bell size={14} />}       label="Notifications" />
                      <DropdownItem href="/settings"      icon={<Settings size={14} />}   label="Settings"      />
                      <div className="h-px bg-white/[0.07] my-0.5" />

                      <button
                        onClick={() => setConfirmLogoutOpen(true)}
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
            </div>
          )}
        </div>
      </div>

      {/* Ticker keyframe — one tiny <style> tag just for the @keyframes rule */}
      <style>{`@keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

      <SearchDialog isOpen={searchOpen} onClose={handleDialogChange} />
      <LogoutConfirmDialog
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onLogout={handleLogout}
        onDisconnectWallets={() => setConfirmLogoutOpen(false)}
      />
    </header>
  );
}

const HeaderIcon = memo(() => (
  <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden
                    ">
      <div className="absolute inset-0 bg-gradient-to-br" />
      <img src="/app_icon.png" alt="SolSight"  />
    </div>
    <span className="text-[15px] font-bold tracking-tight text-white font-sans">
      Sol<span className="text-violet-400">Sight</span>
    </span>
  </Link>
));

const NAV_ITEMS = [
  { href: '/',          label: 'Discover',      icon: <TrendingUp size={12} /> },
  { href: '/portfolio', label: 'Portfolio',     icon: <BarChart2  size={12} /> },
  { href: '/multi-chart', label: 'Multi Viewer', icon: <LayoutGrid size={12} /> },
  { href: '/stake', label: 'Stake', icon: <Zap size={12} /> },
] as const;

const NavLinks = memo(() => (
  <nav className="flex items-center gap-1" aria-label="Main navigation">
    {NAV_ITEMS.map(item => (
      <Link
        key={item.href}
        href={item.href}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                   text-[11px] font-semibold tracking-[0.05em] uppercase text-white/45
                   transition-all duration-150
                   hover:text-white/90 hover:bg-white/[0.06]"
      >
        <span className="opacity-70">{item.icon}</span>
        {item.label}
      </Link>
    ))}
  </nav>
));

interface SearchBoxProps { onActivate: () => void }
const SearchBox = memo(({ onActivate }: SearchBoxProps) => (
  <button
    type="button"
    onClick={onActivate}
    aria-label="Search tokens and pools"
    className="flex items-center gap-2 w-64 h-[34px] px-3
               bg-white/[0.04] border border-white/[0.09] rounded-lg text-left cursor-pointer
               transition-all duration-200
               hover:bg-white/[0.07] hover:border-purple-500/40
               hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15)]"
  >
    <SearchIcon size={13} className="text-white/25 shrink-0" />
    <span className="flex-1 text-[11.5px] text-white/30">Search token or pool...</span>
    <kbd className="text-[9px] text-white/20 border border-white/10 rounded px-1.5 py-[1px]">⌘K</kbd>
  </button>
));

const SignInButton = memo(() => (
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
));

interface DropdownItemProps { href: string; icon: React.ReactNode; label: string }
const DropdownItem = memo(({ href, icon, label }: DropdownItemProps) => (
  <Link
    href={href}
    className="flex items-center gap-2.5 px-3.5 py-2.5 no-underline
               text-[12px] font-medium tracking-wide text-white/60
               transition-all duration-[120ms]
               hover:bg-white/[0.05] hover:text-white/90"
  >
    <span className="text-white/30 shrink-0">{icon}</span>
    <span>{label}</span>
  </Link>
));