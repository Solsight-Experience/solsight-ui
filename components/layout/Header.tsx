'use client';

import { Coins, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { memo, useState, useCallback } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SearchDialog } from '@/components/search/SearchDialog';

/**
 * Main application header component
 * Contains navigation, search, and authentication
 */
export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const handleOpen = useCallback(() => setSearchOpen(true), []);
    const handleDialogChange = useCallback((open: boolean) => setSearchOpen(open), []);
    return (
        <header className="p-2 border-[1.25] border-purple-500 border-t-0 rounded-full">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex gap-5 items-center">
                    <HeaderIcon />
                    <NavLinks />
                </div>
                <div className="flex items-center gap-4">
                    <SearchBox onActivate={handleOpen} />
                    <ActionArea />
                </div>
            </div>
            {/* Search Dialog mounted at root so it can overlay */}
            <SearchDialog isOpen={searchOpen} onClose={handleDialogChange} />
        </header>
    );
}

const HeaderIcon = memo(function HeaderIcon() {
    return (
        <Link href="/" className="flex gap-2 items-center hover:opacity-80 transition-opacity">
            <img src="/app_icon.png" alt="SolSight" className="w-10 h-8" aria-hidden="true" />
            <span className="font-semibold">SolSight</span>
        </Link>
    );
});

const NAV_ITEMS = [
    { href: '/', label: 'Discover' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/perpetuals', label: 'Perpetuals' },
    { href: '/stake', label: 'Stake' },
] as const;

const NavLinks = memo(function NavLinks() {
    return (
        <nav className="space-x-4 font-medium" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-brand-200 transition-colors"
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
});

interface SearchBoxProps { onActivate: () => void }
const SearchBox = memo(function SearchBox({ onActivate }: SearchBoxProps) {
    return (
        <button
            type="button"
            onClick={onActivate}
            className="flex gap-4 border dark:border-input rounded-3xl px-4 py-1 items-center w-72 text-left hover:border-purple-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-haspopup="dialog"
            aria-label="Open search dialog"
        >
            <label htmlFor="search-input" className="sr-only">
                Search tokens and pools
            </label>
            <Input
                id="search-input"
                readOnly
                type="search"
                placeholder="Search token or pool"
                className="flex-1 border-none dark:bg-transparent p-0 focus-visible:ring-0 pointer-events-none"
                aria-hidden="true"
            />
            <SearchIcon size="1rem" aria-hidden="true" />
        </button>
    );
});

function ActionArea() {
    // TODO: Replace with actual auth state from AuthProvider
    const isAuthenticated = false;

    if (!isAuthenticated) {
        return <SignInButton />;
    }

    const actions = [
        { key: 'favourite', label: 'Favourites' },
        { key: 'notification', label: 'Notifications' },
        { key: 'settings', label: 'Settings' },
    ] as const;

    return (
        <div className="flex gap-2">
            {actions.map((action) => (
                <ActionItem key={action.key} label={action.label} />
            ))}
        </div>
    );
}

interface ActionItemProps {
    label: string;
}

const ActionItem = memo<ActionItemProps>(function ActionItem({ label }) {
    return (
        <Button variant="outline" className="rounded-full" aria-label={label}>
            {label}
        </Button>
    );
});

const SignInButton = memo(function SignInButton() {
    return (
        <Button
            className="rounded-b-full rounded-t-none px-8 bg-linear-to-r from-purple-500 to-blue-500 text-white font-semibold"
            asChild
        >
            <Link href="/sign-in">Sign In</Link>
        </Button>
    );
});
