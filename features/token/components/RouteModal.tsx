import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "../utils/token.utils";
import type { QuoteState } from "../hooks/useQuoteState";

interface RouteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    routePathTokens: QuoteState["routePathTokens"];
    routeDetails: QuoteState["routeDetails"];
}

export const RouteModal: React.FC<RouteModalProps> = ({ open, onOpenChange, routePathTokens, routeDetails }) => {
    const [copiedMint, setCopiedMint] = useState<string | null>(null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg border-2 border-gray-700 bg-gray-900 shadow-xl shadow-black/50">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-white">Route details</DialogTitle>
                    <DialogDescription className="text-gray-400">Token hops and DEX path for this quote.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm text-gray-200">
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Token hops</div>
                        <div className="flex flex-wrap items-center gap-1">
                            {routePathTokens.length === 0 ? (
                                <span className="text-gray-400">--</span>
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
                                            className="flex items-center gap-1 rounded bg-gray-700/80 px-2 py-1 text-left hover:bg-gray-700 border border-gray-600/50 transition-colors"
                                            title={routeToken.full ?? routeToken.display}
                                        >
                                            <span className="text-sm font-medium">{routeToken.display}</span>
                                            {routeToken.full && copiedMint === routeToken.full ? (
                                                <Check className="h-3 w-3 text-green-400" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-gray-500" />
                                            )}
                                        </button>
                                        {index < routePathTokens.length - 1 && <span className="text-gray-500 text-xs">→</span>}
                                    </React.Fragment>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">DEX path</div>
                        <div className="text-sm font-medium text-gray-300">{routeDetails.length > 0 ? routeDetails.join(" → ") : "--"}</div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
