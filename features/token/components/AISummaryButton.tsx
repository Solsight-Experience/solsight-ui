import React from "react";
import { Sparkles } from "lucide-react";

interface AISummaryButtonProps {
    onClick: () => void;
}

export const AISummaryButton: React.FC<AISummaryButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 rounded text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-xs hover:bg-violet-500/10 dark:hover:bg-violet-500/20"
            title="AI Summary"
        >
            <Sparkles size={14} />
            <span>Summarize</span>
        </button>
    );
};
