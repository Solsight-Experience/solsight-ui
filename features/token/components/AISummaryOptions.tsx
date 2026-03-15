import React from 'react';
import type { AISummaryOptions as AISummaryOptionsType } from '@/lib/mock/aiSummary';
import { DEFAULT_AI_OPTIONS } from '@/lib/mock/aiSummary';

interface AISummaryOptionsProps {
  options: AISummaryOptionsType;
  onOptionsChange: (options: AISummaryOptionsType) => void;
}

const optionsList = [
  { key: 'forceRefresh' as const, label: 'Force Refresh' },
];

export const AISummaryOptions: React.FC<AISummaryOptionsProps> = ({
  options,
  onOptionsChange,
}) => {
  const toggleOption = (key: keyof AISummaryOptionsType) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  const resetToDefaults = () => {
    onOptionsChange(DEFAULT_AI_OPTIONS);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-900/50 rounded-lg border border-gray-700">
      {optionsList.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => toggleOption(key)}
          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
            options[key]
              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
      <div className="flex-1"></div>
      <button
        onClick={resetToDefaults}
        className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-400 hover:bg-gray-800 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};
