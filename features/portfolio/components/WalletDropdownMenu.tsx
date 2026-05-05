import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EllipsisVertical, Star, Trash2 } from "lucide-react";
import { useSetDefaultWallet, useDeleteWallet } from "../hooks/portfolio.hooks";
import { useState } from "react";

interface WalletDropdownMenuProps {
    walletAddress: string;
    isDefault?: boolean;
}

export default function WalletDropdownMenu({ walletAddress, isDefault }: WalletDropdownMenuProps) {
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const setDefaultMutation = useSetDefaultWallet();
    const deleteMutation = useDeleteWallet();

    const handleSetDefault = async () => {
        try {
            await setDefaultMutation.mutateAsync(walletAddress);
            setOpen(false);
        } catch (error) {
            console.error("Failed to set default wallet:", error);
        }
    };

    const handleDeleteClick = () => {
        setOpen(false);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(walletAddress);
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Failed to delete wallet:", error);
        }
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0">
                        <EllipsisVertical className="size-4 text-[var(--text-muted)]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-44 bg-[var(--surface-overlay)] border border-[var(--border-subtle)] shadow-[var(--shadow-dropdown)]"
                    align="end"
                >
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="text-[13px] text-amber-600 dark:text-amber-400 focus:bg-[var(--surface-btn)] focus:text-amber-600 dark:focus:text-amber-400 flex items-center gap-2 cursor-pointer"
                            onClick={handleSetDefault}
                            disabled={isDefault || setDefaultMutation.isPending}
                        >
                            <Star className="size-3.5 text-amber-500" />
                            {setDefaultMutation.isPending ? "Setting..." : "Set as Default"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-[13px] text-red-600 dark:text-red-400 focus:bg-red-500/[0.08] focus:text-red-600 dark:focus:text-red-400 flex items-center gap-2 cursor-pointer"
                            onClick={handleDeleteClick}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="size-3.5 text-red-500 dark:text-red-400" />
                            Delete wallet
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border-[var(--border-subtle)] bg-[var(--surface-card)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)] text-lg">Delete Wallet</DialogTitle>
                        <DialogDescription className="text-[var(--text-muted)] text-sm">
                            Are you sure you want to delete this wallet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <div className="text-[12px] text-[var(--text-secondary)] font-mono bg-[var(--surface-panel)] border border-[var(--border-faint)] p-3 rounded-lg break-all">
                            {walletAddress}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600/80 dark:hover:bg-red-600"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
