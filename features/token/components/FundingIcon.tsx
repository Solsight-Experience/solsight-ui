import React from "react";

interface FundingIconProps {
    label: string;
}

const iconConfig: Record<string, { color: string; text: string }> = {
    Binance: { color: "bg-yellow-500", text: "Binance" },
    Coinbase: { color: "bg-blue-500", text: "Coinbase" },
    Kraken: { color: "bg-purple-500", text: "Kraken" },
    OKX: { color: "bg-white", text: "OKX" },
    Bybit: { color: "bg-yellow-400", text: "Bybit" },
    KuCoin: { color: "bg-green-500", text: "KuCoin" },
    Huobi: { color: "bg-blue-400", text: "Huobi" },
    Gate: { color: "bg-gray-400", text: "Gate" }
};

export const FundingIcon: React.FC<FundingIconProps> = ({ label }) => {
    const config = iconConfig[label] || { color: "bg-gray-500", text: label };

    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-full ${config.color} flex items-center justify-center`}>
                {label === "Coinbase" && <span className="text-[8px] text-white font-bold">C</span>}
                {label === "Binance" && <span className="text-[8px] text-black font-bold">B</span>}
            </div>
            <span className="text-(--text-secondary) text-xs">{config.text}</span>
        </div>
    );
};
