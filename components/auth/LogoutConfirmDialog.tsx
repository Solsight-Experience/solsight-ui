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

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 border border-purple-500/50 text-white p-8 rounded-3xl shadow-2xl w-[480px] max-w-[90vw] relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200 p-1 rounded-lg"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center animate-in scale-in-50 duration-300 backdrop-blur-sm">
                        <LogOut size={32} className="text-purple-400 animate-pulse" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                    Confirm Logout
                </h2>

                {/* Description */}
                <p className="mb-8 text-center text-gray-300 text-sm animate-in fade-in slide-in-from-top-2 duration-300 delay-150">
                    You're about to leave. Would you like to disconnect your wallets or just log out?
                </p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
                    <Button
                        onClick={handleDisconnectWallets}
                        className="w-full py-3 text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-500 active:from-purple-700 active:to-purple-700 rounded-xl border border-purple-500/40 transition-all duration-200 shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Unplug size={18} />
                        Disconnect All Wallets
                    </Button>

                    <Button
                        onClick={onLogout}
                        className="w-full py-3 text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 active:from-red-700 active:to-pink-700 rounded-xl border border-red-500/40 transition-all duration-200 shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout Only
                    </Button>

                    <Button
                        onClick={onClose}
                        className="w-full py-3 text-gray-300 bg-slate-700/50 hover:bg-slate-600 active:bg-slate-700 rounded-xl border border-slate-600/50 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmDialog;
