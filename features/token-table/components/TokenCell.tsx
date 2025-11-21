import { memo } from 'react';
import { TokenTableData } from '../config/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TokenCellProps {
    token: TokenTableData['token'];
}

/**
 * TokenCell Component
 * Displays token icon, ticker, name, and age
 */
const TokenCell = memo<TokenCellProps>(function TokenCell({ token }) {
    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={token.iconUrl} alt={`${token.name} logo`} />
                <AvatarFallback>{token.ticker.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-bold">{token.ticker}</span>
                    <span className="text-sm text-gray-400">{token.name}</span>
                </div>
                <time className="text-xs text-gray-500" dateTime={token.age}>
                    {token.age}
                </time>
            </div>
        </div>
    );
});

export default TokenCell;
