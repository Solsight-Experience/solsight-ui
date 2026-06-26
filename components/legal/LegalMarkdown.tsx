"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LegalMarkdownProps = {
    content: string;
};

export function LegalMarkdown({ content }: LegalMarkdownProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => (
                    <h1
                        className="text-3xl sm:text-4xl font-black tracking-tight mb-3 text-transparent bg-clip-text"
                        style={{ backgroundImage: "linear-gradient(90deg, #c4b5fd, #a78bfa, #e879f9)" }}
                    >
                        {children}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-10 mb-4 pl-4 border-l-2 border-violet-500/70 first:mt-6">{children}</h2>
                ),
                h3: ({ children }) => <h3 className="text-base font-semibold text-violet-300 mt-6 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-white/55 text-sm sm:text-[15px] leading-relaxed mb-4 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-white/90">{children}</strong>,
                em: ({ children }) => <em className="text-white/45 not-italic text-sm">{children}</em>,
                hr: () => <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />,
                ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 space-y-2 list-decimal list-inside marker:text-violet-400/80">{children}</ol>,
                li: ({ children }) => (
                    <li className="flex gap-2.5 text-white/55 text-sm sm:text-[15px] leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/70" aria-hidden />
                        <span className="flex-1">{children}</span>
                    </li>
                ),
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 underline underline-offset-2 hover:text-violet-300 transition-colors break-all"
                    >
                        {children}
                    </a>
                ),
                blockquote: ({ children }) => (
                    <blockquote
                        className="my-5 rounded-xl px-4 py-3 text-sm text-white/50 italic"
                        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
                    >
                        {children}
                    </blockquote>
                ),
                code: ({ children }) => (
                    <code className="rounded-md px-1.5 py-0.5 text-xs font-mono text-violet-300" style={{ background: "rgba(124,58,237,0.15)" }}>
                        {children}
                    </code>
                )
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
