export interface AISummaryOptions {
  includePriceAnalysis: boolean;
  includeRiskAssessment: boolean;
  includeTradingMetrics: boolean;
  includeMarketComparison: boolean;
  includeSocialSentiment: boolean;
  forceRefresh: boolean;
}

export const DEFAULT_AI_OPTIONS: AISummaryOptions = {
  includePriceAnalysis: true,
  includeRiskAssessment: true,
  includeTradingMetrics: false,
  includeMarketComparison: false,
  includeSocialSentiment: false,
  forceRefresh: false,
};

export const mockAISummary = `Blockasset (BLOCK) is currently trading at $0.0014 with a relatively small market cap of $432K. Liquidity remains moderate while the number of holders continues to grow steadily.

Trading activity appears limited with a 24h volume of only $75. This indicates the token is still in an early phase of adoption.

Overall outlook is neutral. Traders should monitor liquidity and volume before entering large positions.`;

export const generateAISummary = async (tokenName: string): Promise<string> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAISummary);
    }, 1500);
  });
};

export const generateAISummaryWithOptions = async (
  tokenName: string,
  options: AISummaryOptions
): Promise<string> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      let summary = generateMockSummary(tokenName, options);
      resolve(summary);
    }, 1500);
  });
};

function generateMockSummary(tokenName: string, options: AISummaryOptions): string {
  const sections: string[] = [];

  // Base section always included
  sections.push(
    `${tokenName} is currently trading at $0.0014 with a relatively small market cap of $432K. Liquidity remains moderate while the number of holders continues to grow steadily.`
  );

  // Conditional sections based on options
  if (options.includePriceAnalysis) {
    sections.push(
      `Price Analysis: ${tokenName} shows a stable trading pattern with minimal volatility over the last 24 hours. Support levels are holding at $0.0012, with resistance near $0.0016. The token has maintained within a tight range, suggesting consolidation before potential breakout.`
    );
  }

  if (options.includeRiskAssessment) {
    sections.push(
      `Risk Assessment: Moderate risk detected. The token shows limited trading volume ($75 in 24h) which could amplify price movements. Smart contract audit status is verified, reducing technical risk. Market concentration appears moderate with no extreme whale holdings detected.`
    );
  }

  if (options.includeTradingMetrics) {
    sections.push(
      `Trading Metrics: 24h volume is $75 indicating early-stage adoption phase. The token shows 1,250 active holders with steady growth rate. Average trade size is $0.06 with peak activity during Asia trading hours. The bid-ask spread remains wide at 2.5%, suggesting lower liquidity depth.`
    );
  }

  if (options.includeMarketComparison) {
    sections.push(
      `Market Comparison: Compared to similar market-cap tokens, ${tokenName} shows lower trading velocity but higher holder retention. Performance tracks below top 100 tokens but above new launch category. Relative strength index suggests neutral sentiment in short term.`
    );
  }

  if (options.includeSocialSentiment) {
    sections.push(
      `Social Sentiment: Community engagement remains moderate with growing Discord activity. Twitter mentions trending upward (15% weekly increase). Sentiment analysis shows 62% positive, 25% neutral, 13% negative. Community perception leans bullish with optimistic price predictions.`
    );
  }

  // Final outlook
  sections.push(
    `Overall Outlook: Neutral to Bullish. ${tokenName} appears suitable for informed traders monitoring liquidity levels. Entry points should be considered during established support levels. Risk/reward ratio is favorable for mid-term holders with stop losses below $0.0012.`
  );

  return sections.join('\n\n');
}
