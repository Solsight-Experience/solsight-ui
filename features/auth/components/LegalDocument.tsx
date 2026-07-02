"use client";

import { FileText } from "lucide-react";
import { LegalMarkdown } from "./LegalMarkdown";

type LegalDocumentProps = {
    content: string;
    badge: string;
};

export function LegalDocument({ content, badge }: LegalDocumentProps) {
    return (
        <div
            style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(10,0,20,0.6) 100%)",
                border: "1px solid rgba(139,92,246,0.2)",
                boxShadow: "0 0 40px rgba(124,58,237,0.08)"
            }}
        >
            <div className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: "rgba(139,92,246,0.15)", background: "rgba(124,58,237,0.08)" }}>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 16px rgba(124,58,237,0.35)" }}
                >
                    <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-violet-400 text-xs font-semibold tracking-wider uppercase">{badge}</span>
            </div>

            <div className="px-6 sm:px-8 py-8">
                <LegalMarkdown content={content} />
            </div>
        </div>
    );
}
