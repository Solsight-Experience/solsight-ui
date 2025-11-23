'use client';

import { useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { SearchDialog } from '@/components/search/SearchDialog';
import { SearchIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const router = useRouter();
    const { isAuthenticated, logout } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

    const handleOpen = useCallback(() => setSearchOpen(true), []);
    const handleDialogChange = useCallback((open: boolean) => setSearchOpen(open), []);
    const toggleAvatarMenu = () => setAvatarMenuOpen(!avatarMenuOpen);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="p-2 border-[1.25] border-purple-500 border-t-0 rounded-full">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex gap-5 items-center">
                    <HeaderIcon />
                    <NavLinks />
                </div>

                <div className="flex items-center gap-4">
                    <SearchBox onActivate={handleOpen} />

                    {!isAuthenticated ? (
                        <SignInButton />
                    ) : (
                        <div className="relative">
                            <button onClick={toggleAvatarMenu} className="flex items-center gap-2">
                                <Avatar size={32} src="/user.png" alt="User Avatar" />
                                <span className="text-white font-medium">Hi, User</span>
                            </button>

                            {avatarMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-purple-500/30 py-2 z-50">
                                    <Link href="/profile" className="block px-4 py-2 hover:bg-purple-500/20">Profile</Link>
                                    <Link href="/notifications" className="block px-4 py-2 hover:bg-purple-500/20">Notifications</Link>
                                    <Link href="/settings" className="block px-4 py-2 hover:bg-purple-500/20">Settings</Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <SearchDialog isOpen={searchOpen} onClose={handleDialogChange} />
        </header>
    );
}

const HeaderIcon = memo(() => (
    <Link href="/" className="flex gap-2 items-center hover:opacity-80 transition-opacity">
        <img src="/app_icon.png" alt="SolSight" className="w-10 h-8" />
        <span className="font-semibold text-white">SolSight</span>
    </Link>
));

const NAV_ITEMS = [
    { href: '/', label: 'Discover' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/perpetuals', label: 'Perpetuals' },
    { href: '/stake', label: 'Stake' },
] as const;

const NavLinks = memo(() => (
    <nav className="space-x-4 font-medium text-white" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-purple-300 transition-colors">
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
        className="flex gap-4 border dark:border-input rounded-3xl px-4 py-1 items-center w-72 text-left hover:border-purple-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
    >
        <label htmlFor="search-input" className="sr-only">Search tokens and pools</label>
        <Input
            id="search-input"
            readOnly
            type="search"
            placeholder="Search token or pool"
            className="flex-1 border-none dark:bg-transparent p-0 focus-visible:ring-0 pointer-events-none"
        />
        <SearchIcon size="1rem" />
    </button>
));

const SignInButton = memo(() => (
    <Button
        className="rounded-b-full rounded-t-none px-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
        asChild
    >
        <Link href="/authentication">Sign In</Link>
    </Button>
));
