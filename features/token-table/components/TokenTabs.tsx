import { cn } from '@/lib/utils';
import { memo, HTMLAttributes } from 'react';

export type TokenTableTabOption = 'TRENDING' | 'TOP' | 'CATEGORIES' | 'FAVOURITES';

const TAB_OPTIONS: Array<{ value: TokenTableTabOption; label: string }> = [
    { value: 'TRENDING', label: 'Trending' },
    { value: 'TOP', label: 'Top' },
    { value: 'CATEGORIES', label: 'Categories' },
    { value: 'FAVOURITES', label: 'Favourites' },
];

interface TokenTabsProps {
    onTabClick: (tab: TokenTableTabOption) => void;
    activeTab?: TokenTableTabOption;
}

export const TokenTabs = memo<TokenTabsProps>(function TokenTabs({
    onTabClick,
    activeTab = 'TRENDING',
}) {
    return (
        <div className="flex gap-5 p-4" role="tablist" aria-label="Token categories">
            {TAB_OPTIONS.map((tab) => (
                <TokenTab
                    key={tab.value}
                    title={tab.label}
                    isActive={activeTab === tab.value}
                    onClick={() => onTabClick(tab.value)}
                    aria-selected={activeTab === tab.value}
                />
            ))}
        </div>
    );
});

type TokenTabProps = { 
    title: string; 
    isActive?: boolean;
} & HTMLAttributes<HTMLHeadingElement>;

const TokenTab = memo<TokenTabProps>(function TokenTab({ 
    className, 
    title, 
    isActive = false, 
    ...props 
}) {
    return (
        <h5
            role="tab"
            tabIndex={0}
            className={cn(
                'cursor-pointer font-medium transition-all hover:text-brand-100',
                isActive && 'text-brand-75 drop-shadow-xs/25 drop-shadow-[0_7px_19px_rgba(151,32,139,0.6)]',
                className
            )}
            aria-label={`${title} tab`}
            {...props}
        >
            {title}
        </h5>
    );
});
