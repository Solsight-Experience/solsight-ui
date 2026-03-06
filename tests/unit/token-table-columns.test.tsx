import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createColumns } from '@/features/token-table/config/columns';
import type { TokenTableData } from '@/features/token-table/config/types';
import type { CellContext } from '@tanstack/react-table';

const token: TokenTableData = {
  id: 'token-address',
  token: {
    iconUrl: '/icons/sol.png',
    ticker: 'ABC',
    name: 'ABC Token',
    priceHistory: [],
    category: 'MEME',
    age: '1h',
  },
  marketCap: {
    value: 1,
    currencyCode: 'USD',
    currencySymbol: '$',
    changePercent24h: 1,
  },
  liquidity: 1,
  volume24h: 1,
  transactions: {
    buyCount: 1,
    sellCount: 1,
    buyVolumn: 1,
    sellVolumn: 1,
  },
  audit: [],
};

describe('token table action column', () => {
  it('calls onQuickBuy and stops propagation', () => {
    const onQuickBuy = vi.fn();
    const parentClick = vi.fn();

    const columns = createColumns(undefined, new Set(), '0.1', onQuickBuy);
    const actionColumn = columns.find((column) => column.id === 'action');

    if (!actionColumn || typeof actionColumn.cell !== 'function') {
      throw new Error('Missing action column cell');
    }

    const context = { row: { original: token } } as unknown as CellContext<TokenTableData, unknown>;
    const cell = actionColumn.cell(context);

    render(<div onClick={parentClick}>{cell as React.ReactElement}</div>);

    fireEvent.click(screen.getByRole('button', { name: 'Buy 0.1 SOL' }));

    expect(onQuickBuy).toHaveBeenCalledWith(token);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
