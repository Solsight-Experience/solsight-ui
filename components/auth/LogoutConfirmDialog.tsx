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

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/50 text-white p-8 rounded-3xl shadow-2xl w-[480px] max-w-[90vw] relative animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <LogOut size={32} className="text-purple-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Confirm Logout
                </h2>

                {/* Description */}
                <p className="mb-8 text-center text-gray-300 text-sm">You&apos;re about to leave. Would you like to disconnect your wallets or just log out?</p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={onDisconnectWallets}
                        className="w-full py-3 text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl border border-yellow-500/30 transition-all shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2"
                    >
                        <Unplug size={18} />
                        Disconnect All Wallets
                    </Button>

                    <Button
                        onClick={onLogout}
                        className="w-full py-3 text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl border border-red-500/30 transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout Only
                    </Button>

                    <Button
                        onClick={onClose}
                        className="w-full py-3 text-gray-300 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600/50 transition-all"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmDialog;
