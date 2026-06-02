"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "../../utils/token.utils";

export interface RouteDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    routePathTokens: Array<{ display: string; full?: string }>;
    routeDetails: string[];
}

export function RouteDetailsDialog({ open, onOpenChange, routePathTokens, routeDetails }: RouteDetailsDialogProps) {
    const [copiedMint, setCopiedMint] = useState<string | null>(null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg border-2 border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xl shadow-black/50">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">Route details</DialogTitle>
                    <DialogDescription className="text-[var(--text-muted)]">Token hops and DEX path for this quote.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <div className="bg-[var(--surface-btn)] rounded-lg p-3 border border-[var(--border-subtle)]">
                        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] font-semibold mb-2">Token hops</div>
                        <div className="flex flex-wrap items-center gap-1">
                            {routePathTokens.length === 0 ? (
                                <span className="text-[var(--text-muted)]">--</span>
                            ) : (
                                routePathTokens.map((routeToken, index) => (
                                    <React.Fragment key={`${routeToken.display}-${index}`}>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!routeToken.full) return;
                                                const success = await copyToClipboard(routeToken.full);
                                                if (success) {
                                                    setCopiedMint(routeToken.full);
                                                    window.setTimeout(() => setCopiedMint((prev) => (prev === routeToken.full ? null : prev)), 1500);
                                                }
                                            }}
                                            className="flex items-center gap-1 rounded bg-[var(--surface-btn)] px-2 py-1 text-left hover:bg-[var(--surface-btn)] border border-[var(--border-subtle)] transition-colors"
                                            title={routeToken.full ?? routeToken.display}
                                        >
                                            <span className="text-sm font-medium">{routeToken.display}</span>
                                            {routeToken.full && copiedMint === routeToken.full ? (
                                                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-[var(--text-muted)]" />
                                            )}
                                        </button>
                                        {index < routePathTokens.length - 1 && <span className="text-[var(--text-muted)] text-xs">→</span>}
                                    </React.Fragment>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="bg-[var(--surface-btn)] rounded-lg p-3 border border-[var(--border-subtle)]">
                        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] font-semibold mb-2">DEX path</div>
                        <div className="text-sm font-medium text-[var(--text-secondary)]">{routeDetails.length > 0 ? routeDetails.join(" → ") : "--"}</div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-btn)]">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
