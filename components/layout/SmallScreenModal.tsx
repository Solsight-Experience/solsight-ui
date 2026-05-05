"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Monitor } from "lucide-react";

const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;

export default function SmallScreenModal() {
    const [isSmall, setIsSmall] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    const checkSize = useCallback(() => {
        setIsSmall(window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT);
    }, []);

    useEffect(() => {
        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, [checkSize]);

    // Focus-trap: keep focus inside the dialog when visible
    useEffect(() => {
        if (!isSmall) return;
        const el = dialogRef.current;
        if (!el) return;
        el.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                e.preventDefault();
                el.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSmall]);

    if (!isSmall) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Screen size not supported"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6
                       bg-white/95 dark:bg-[#05050a]/96
                       backdrop-blur-xl"
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="flex flex-col items-center text-center gap-4
                           w-full max-w-[380px] outline-none
                           bg-[var(--surface-card)] border border-[var(--border-subtle)]
                           rounded-[1.25rem] px-8 py-10
                           shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.70)]"
                style={{
                    animation: "small-screen-modal-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both"
                }}
            >
                {/* Icon */}
                <div
                    className="flex items-center justify-center w-16 h-16 rounded-full shrink-0
                                bg-violet-500/10 border border-violet-500/25
                                text-violet-500 dark:text-violet-400"
                >
                    <Monitor size={32} strokeWidth={1.5} aria-hidden="true" />
                </div>

                {/* Brand */}
                <p
                    className="text-[0.75rem] font-bold tracking-[0.12em] uppercase
                               text-[var(--text-disabled)] m-0"
                >
                    Sol<span className="text-violet-500 dark:text-violet-400">Sight</span>
                </p>

                {/* Heading — override globals.css h1 with explicit size */}
                <h1
                    className="!text-[1.375rem] font-bold tracking-tight
                                text-[var(--text-primary)] m-0"
                >
                    Screen Too Small
                </h1>

                {/* Body */}
                <p className="text-[0.8125rem] text-[var(--text-muted)] leading-relaxed m-0">
                    This application does not support small screen sizes.
                    <br />
                    Please use a larger device or widen your browser window.
                </p>

                {/* Min-width hint */}
                <div
                    className="mt-1 text-[0.75rem] text-[var(--text-disabled)]
                                bg-[var(--surface-btn)] border border-[var(--border-subtle)]
                                rounded-lg px-4 py-2"
                >
                    Minimum supported width: <strong className="font-semibold text-violet-500 dark:text-violet-400">{MIN_WIDTH}px</strong>
                    <br />
                    Minumum supported height: <strong className="font-semibold text-violet-500 dark:text-violet-400">{MIN_HEIGHT}px</strong>
                </div>
            </div>

            <style>{`
                @keyframes small-screen-modal-in {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);    }
                }
            `}</style>
        </div>
    );
}
