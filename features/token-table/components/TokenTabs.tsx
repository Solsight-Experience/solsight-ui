import { cn } from '@/lib/utils';
import { HTMLAttributes, useState } from 'react';

export function TokenTabs({ onTabClick }: { onTabClick: (tab: TokenTableTabOption) => void }) {
    const [activeTab, setActiveTab] = useState<TokenTableTabOption>('TRENDING');

    const handleTabClick = (tab: TokenTableTabOption) => {
        onTabClick(tab);
        setActiveTab(tab);
    };

    return (
        <div className="flex gap-5 p-4">
            <TokenTab
                title="Trending"
                isActive={activeTab === 'TRENDING'}
                onClick={() => handleTabClick('TRENDING')}
            />
            <TokenTab title="Top" isActive={activeTab === 'TOP'} onClick={() => handleTabClick('TOP')} />
            <TokenTab
                title="Categories"
                isActive={activeTab === 'CATEGORIES'}
                onClick={() => handleTabClick('CATEGORIES')}
            />
            <TokenTab
                title="Favourites"
                isActive={activeTab === 'FAVOURITES'}
                onClick={() => handleTabClick('FAVOURITES')}
            />
        </div>
    );
}

type TokenTabProps = { title: string; isActive?: boolean } & HTMLAttributes<HTMLHeadingElement>;
function TokenTab({ className, title, isActive = false, ...props }: TokenTabProps) {
    return (
        <h5
            className={cn(
                `cursor-pointer font-medium ${isActive && 'text-brand-75 drop-shadow-xs/25 drop-shadow-[0_7px_19px_rgba(151,32,139,0.6)]'}`,
                className
            )}
            {...props}
        >
            {title}
        </h5>
    );
}

export type TokenTableTabOption = 'TRENDING' | 'TOP' | 'CATEGORIES' | 'FAVOURITES';
