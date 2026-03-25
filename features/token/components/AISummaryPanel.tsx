import React from 'react';
import { Sparkles } from 'lucide-react';
import { aiSummaryApi } from '@/features/token/services/ai-summary.services';
import type { AISummaryResponse } from '@/features/token/services/ai-summary.services';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface AISummaryLoaderProps {
  isLoading: boolean;
}

export const AISummaryLoader: React.FC<AISummaryLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Generating...</span>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce"></div>
          <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Skeleton Lines */}
      <div className="space-y-2">
        <div className="h-2.5 bg-gray-800 rounded animate-pulse"></div>
        <div className="h-2.5 bg-gray-800 rounded animate-pulse"></div>
        <div className="h-2.5 bg-gray-800 rounded w-5/6 animate-pulse"></div>
      </div>
    </div>
  );
};

interface AISummaryContentProps {
  content: string;
  generatedAt: string;
  tokenName: string;
}

export const AISummaryContent: React.FC<AISummaryContentProps> = ({ content, generatedAt, tokenName }) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  // Format date to "Updated Mar 20, 2026" format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `Updated ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    } catch {
      return 'Updated recently';
    }
  };

  // Parse markdown bold syntax (**text**)
  const parseMarkdownBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={idx} className="font-semibold text-gray-100">{boldText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 text-sm text-gray-300">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="leading-relaxed">
          {parseMarkdownBold(paragraph)}
        </p>
      ))}

      <div className="pt-3 border-t border-gray-700">
        <span className="text-xs text-gray-500">{formatDate(generatedAt)} • AI summary about {tokenName}</span>
      </div>
    </div>
  );
};

interface AISummaryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
}

export const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ 
  isOpen, 
  onToggle, 
  tokenAddress,
  tokenName,
  tokenSymbol,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<AISummaryResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && !summary) {
      setIsLoading(true);
      setError(null);

      // Call the real API endpoint
      aiSummaryApi
        .generateSummary(tokenAddress, tokenName, tokenSymbol)
        .then((result) => {
          setSummary(result);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate AI summary:', err);
          setError(err?.message || 'Failed to generate AI summary. Please try again later.');
          setIsLoading(false);
        });
    }
  }, [isOpen, summary, tokenAddress, tokenName, tokenSymbol]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onToggle();
    }}>
      <DialogContent 
        className="max-w-[600px] border border-gray-700 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 rounded-2xl [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0"
        showCloseButton={true}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50">
          <Sparkles size={18} className="text-gray-300" />
          <DialogTitle className="text-base font-semibold text-gray-100">Token Summary</DialogTitle>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <AISummaryLoader isLoading={isLoading} />
          ) : error ? (
            <div className="text-sm text-red-400 p-2">
              <p>{error}</p>
            </div>
          ) : summary ? (
            <AISummaryContent 
              content={summary.summary} 
              generatedAt={summary.generatedAt}
              tokenName={tokenName}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
