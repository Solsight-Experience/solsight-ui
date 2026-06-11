"use client";

import Image from "next/image";
import { useWalletAuth } from "../hooks/useWalletAuth";

export default function WalletConnectButtons() {
    const { handleWalletConnect } = useWalletAuth();

    const wallets = [
        {
            name: "Phantom",
            icon: "/wallet_logo/phantom.svg",
            label: "Connect Phantom"
        }
        //// Metamask is having issue with invalid origin
        // {
        //     name: 'MetaMask',
        //     icon: '/wallet_logo/metamask.svg',
        //     label: 'Connect MetaMask'
        // },
        //// Not ready yet
        // {
        //     name: 'WalletConnect',
        //     icon: '/wallet_logo/walletconnect.svg',
        //     label: 'Connect WalletConnect'
        // }
    ];

    return (
        <>
            {wallets.map((wallet) => (
                <button
                    key={wallet.name}
                    type="button"
                    onClick={() => handleWalletConnect(wallet.name)}
                    className="relative w-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-slate-700"
                >
                    <Image src={wallet.icon} alt={wallet.name} width={20} height={20} className="absolute left-[20px] w-5 h-5 object-contain" />
                    {wallet.label}
                </button>
            ))}
        </>
    );
}
