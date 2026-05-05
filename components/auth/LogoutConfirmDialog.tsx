import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { LogOut, Unplug, X } from "lucide-react";

interface LogoutConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    onDisconnectWallets: () => void;
}

const LogoutConfirmDialog = ({ isOpen, onClose, onLogout, onDisconnectWallets }: LogoutConfirmDialogProps) => {
    if (!isOpen) return null;

    const handleDisconnectWallets = () => {
        onClose();
        setTimeout(() => onDisconnectWallets(), 200);
    };

    return createPortal(
        <div className="fixed inset-0 flex justify-center items-center z-[200] bg-gray-500/20 dark:bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[var(--surface-card)] border border-violet-500/50 p-8 rounded-3xl shadow-2xl w-[480px] max-w-[90vw] relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-btn-hover)] hover:scale-110 active:scale-95 transition-all duration-200 p-1 rounded-lg"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center animate-in scale-in-50 duration-300">
                        <LogOut size={32} className="text-violet-500 dark:text-purple-400 animate-pulse" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-violet-600 to-blue-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                    Confirm Logout
                </h2>

                {/* Description */}
                <p className="mb-8 text-center text-[var(--text-secondary)] text-sm animate-in fade-in slide-in-from-top-2 duration-300 delay-150">
                    You&apos;re about to leave. Would you like to disconnect your wallets or just log out?
                </p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
                    <Button
                        onClick={handleDisconnectWallets}
                        className="w-full py-3 !text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-500 active:from-purple-700 active:to-purple-700 rounded-xl border border-purple-500/40 transition-all duration-200 shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Unplug size={18} />
                        Disconnect All Wallets
                    </Button>

                    <Button
                        onClick={onLogout}
                        className="w-full py-3 !text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 active:from-red-700 active:to-pink-700 rounded-xl border border-red-500/40 transition-all duration-200 shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout Only
                    </Button>

                    <Button
                        onClick={onClose}
                        className="w-full py-3 text-[var(--text-secondary)] bg-[var(--surface-btn)] hover:bg-[var(--surface-btn-hover)] active:bg-[var(--surface-btn-active)] rounded-xl border border-[var(--border-default)] transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LogoutConfirmDialog;
