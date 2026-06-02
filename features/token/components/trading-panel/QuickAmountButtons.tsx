"use client";

const AMOUNTS = ["0.1", "0.5", "1", "MAX"] as const;

export interface QuickAmountButtonsProps {
    payBalance: string;
    onPickAmount: (amount: string) => void;
}

export function QuickAmountButtons({ payBalance, onPickAmount }: QuickAmountButtonsProps) {
    return (
        <div className="flex gap-2 mb-4">
            {AMOUNTS.map((amount) => (
                <button
                    key={amount}
                    onClick={() => onPickAmount(amount === "MAX" ? payBalance : amount)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[var(--surface-btn)] hover:bg-[var(--surface-btn)] text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]/50 transition-all hover:border-[var(--border-subtle)]"
                >
                    {amount}
                </button>
            ))}
        </div>
    );
}
