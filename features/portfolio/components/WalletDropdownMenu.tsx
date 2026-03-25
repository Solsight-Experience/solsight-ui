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
                    <Button variant={"link"}>
                        <EllipsisVertical className="size-6 text-purple-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit bg-darkblack-normal border-gray-600" align="start">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="text-base focus:bg-gray-700 text-yellow-400 flex items-center gap-2"
                            onClick={handleSetDefault}
                            disabled={isDefault || setDefaultMutation.isPending}
                        >
                            <Star className="size-4 text-yellow-400" />
                            {setDefaultMutation.isPending ? "Setting..." : "Set as Default"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-base focus:bg-gray-700 text-red-300 focus:text-red-100 flex items-center gap-2"
                            onClick={handleDeleteClick}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="size-4 text-red-300" />
                            Delete wallet
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border-gray-600">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Delete Wallet</DialogTitle>
                        <DialogDescription className="text-base text-gray-400">
                            Are you sure you want to delete this wallet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="text-sm text-gray-400 font-mono bg-gray-800 p-3 rounded-md break-all">{walletAddress}</div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending} className="border-gray-600">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700">
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
