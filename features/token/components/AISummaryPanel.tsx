import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AISummaryOptions } from '@/lib/mock/aiSummary';
import { aiSummaryApi } from '@/features/token/services/ai-summary.services';
import type { AISummaryResponse } from '@/features/token/services/ai-summary.services';

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
  onRegenerate?: () => void;
}

export const AISummaryContent: React.FC<AISummaryContentProps> = ({ content, onRegenerate }) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="space-y-3 text-sm text-gray-300">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="leading-relaxed">
          {paragraph}
        </p>
      ))}

      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <span className="text-xs text-gray-500">Generated just now</span>
        <button
          onClick={onRegenerate}
          className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-400 hover:bg-gray-800 transition-colors"
          title="Regenerate"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
};

interface AISummaryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  tokenAddress: string;
  tokenName?: string;
  options?: AISummaryOptions;
}

export const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ 
  isOpen, 
  onToggle, 
  tokenAddress,
  tokenName = 'Token',
  options,
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
        .generateSummary(tokenAddress, options)
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
  }, [isOpen, summary, tokenAddress, options]);

  // Clear summary when options change to regenerate with new options
  React.useEffect(() => {
    setSummary(null);
    setError(null);
  }, [options]);

  if (!isOpen) return null;

  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{
        maxHeight: isOpen ? '1200px' : '0px',
        opacity: isOpen ? 1 : 0,
      }}
    >
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-200">AI Summary</h3>
          </div>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <AISummaryLoader isLoading={isLoading} />
        ) : error ? (
          <div className="text-sm text-red-400 p-2">
            <p>{error}</p>
          </div>
        ) : summary ? (
          <AISummaryContent 
            content={summary.summary} 
            onRegenerate={() => setSummary(null)}
          />
        ) : null}
      </div>
    </div>
  );
};
