"use client";

import React, { useState, useEffect } from 'react';
import { ChatResponseDto } from '@/types/dto';
import { TokenBriefCard } from './cards/TokenBriefCard';
import { PortfolioSummaryCard } from './cards/PortfolioSummaryCard';
import { NavigationCard } from './cards/NavigationCard';
import { TradeConfirmDialog } from './cards/TradeConfirmDialog';

export const ResponseRenderer: React.FC<{ response: ChatResponseDto }> = ({ response }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (response.type === 'trade_intent') {
      setDialogOpen(true);
    }
  }, [response.type]);

  switch (response.type) {
    case 'text':
      return <p>{response.content}</p>;
    case 'token_brief':
      return <TokenBriefCard data={response.data as any} />;
    case 'portfolio_summary':
      return <PortfolioSummaryCard data={response.data as any} />;
    case 'navigation':
      return <NavigationCard data={response.data as any} />;
    case 'trade_intent':
      return (
        <TradeConfirmDialog
          data={response.data as any}
          open={dialogOpen}
          onConfirm={() => setDialogOpen(false)}
          onCancel={() => setDialogOpen(false)}
        />
      );
    default:
      return <p>Unknown response type</p>;
  }
};

export default ResponseRenderer;
