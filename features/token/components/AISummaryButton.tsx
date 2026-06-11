import React from "react";
import { Sparkles } from "lucide-react";

interface AISummaryButtonProps {
    onClick: () => void;
}

export const AISummaryButton: React.FC<AISummaryButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 rounded text-purple-400 hover:text-purple-300 transition-colors text-xs hover:bg-purple-500/10"
            title="AI Summary"
        >
            <Sparkles size={14} />
            <span>Summarize</span>
        </button>
    );
};
