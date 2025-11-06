import { Coins, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

/**
 * Main application header component
 * Contains navigation, search, and authentication
 */
export default function Header() {
    return (
        <header className="p-2 border-[1.25] border-purple-500 border-t-0 rounded-full">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex gap-5">
                    <HeaderIcon />
                    <NavLinks />
                </div>
                <div className="flex items-center gap-4">
                    <SearchBox />
                    <ActionArea />
                </div>
            </div>
        </header>
    );
}

const HeaderIcon = memo(function HeaderIcon() {
    return (
        <Link href="/" className="flex gap-2 items-center hover:opacity-80 transition-opacity">
            <Coins aria-hidden="true" />
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

const SearchBox = memo(function SearchBox() {
    return (
        <div className="flex gap-4 border dark:border-input rounded-3xl px-4 py-1 items-center w-72">
            <label htmlFor="search-input" className="sr-only">
                Search tokens and wallets
            </label>
            <Input
                id="search-input"
                type="search"
                placeholder="Search token, wallet"
                className="flex-1 border-none dark:bg-transparent p-0 focus-visible:ring-0"
                aria-label="Search tokens and wallets"
            />
            <SearchIcon size="1rem" aria-hidden="true" />
        </div>
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
