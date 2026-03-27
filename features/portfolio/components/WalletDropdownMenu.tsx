import { Button } from "@/components/ui/button";
import { ActionDropdownMenu } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EllipsisVertical, Star, Trash2 } from "lucide-react";
import { useSetDefaultWallet, useDeleteWallet } from "../hooks/portfolio.hooks";
import { useState } from "react";

interface WalletDropdownMenuProps {
    walletAddress: string;
    isDefault?: boolean;
}

export default function WalletDropdownMenu({ walletAddress, isDefault }: WalletDropdownMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const setDefaultMutation = useSetDefaultWallet();
    const deleteMutation = useDeleteWallet();

    const handleSetDefault = async () => {
        try {
            await setDefaultMutation.mutateAsync(walletAddress);
        } catch (error) {
            console.error("Failed to set default wallet:", error);
        }
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
            <ActionDropdownMenu
                trigger={
                    <Button variant="link">
                        <EllipsisVertical className="size-6 text-purple-500" />
                    </Button>
                }
                contentClassName="w-fit bg-darkblack-normal border-gray-600"
                actions={[
                    {
                        label: setDefaultMutation.isPending ? "Setting..." : "Set as Default",
                        icon: <Star className="size-4 text-yellow-400" />,
                        onClick: handleSetDefault,
                        disabled: isDefault || setDefaultMutation.isPending,
                        className: "text-base focus:bg-gray-700 text-yellow-400"
                    },
                    {
                        label: "Delete wallet",
                        icon: <Trash2 className="size-4 text-red-300" />,
                        onClick: () => setDeleteDialogOpen(true),
                        disabled: deleteMutation.isPending,
                        className: "text-base focus:bg-gray-700 text-red-300 focus:text-red-100"
                    }
                ]}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Wallet"
                description="Are you sure you want to delete this wallet? This action cannot be undone."
                confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
                variant="destructive"
                isPending={deleteMutation.isPending}
                onConfirm={handleConfirmDelete}
            >
                <div className="text-sm text-gray-400 font-mono bg-gray-800 p-3 rounded-md break-all">{walletAddress}</div>
            </ConfirmDialog>
        </>
    );
}
