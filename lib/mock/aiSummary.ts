export interface AISummaryOptions {
    forceRefresh?: boolean;
}

export const DEFAULT_AI_OPTIONS: AISummaryOptions = {
    forceRefresh: false
};

export const mockAISummary = `Blockasset (BLOCK) is currently trading at $0.0014 with a relatively small market cap of $432K. Liquidity remains moderate while the number of holders continues to grow steadily.

Trading activity appears limited with a 24h volume of only $75. This indicates the token is still in an early phase of adoption.

Overall outlook is neutral. Traders should monitor liquidity and volume before entering large positions.`;

export const generateAISummary = async (_tokenName: string): Promise<string> => {
    // Simulate API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockAISummary);
        }, 1500);
    });
};

export const generateAISummaryWithOptions = async (_tokenName: string, _options: AISummaryOptions): Promise<string> => {
    // Simulate API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockAISummary);
        }, 1500);
    });
};
