import { memo } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getTokenIconImg, TokenIconImg } from "@/lib/token-helper";

interface QuickBuyInputProps {
    value: string;
    onChange: (value: string) => void;
    currency?: string;
    currencyIcon?: TokenIconImg;
}

export const QuickBuyInput = memo<QuickBuyInputProps>(function QuickBuyInput({ value, onChange, currency = "SOL", currencyIcon = "sol" }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Only allow numbers and decimal point
        if (/^\d*\.?\d*$/.test(newValue)) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex items-center border-[1.25] border-brand-200 rounded-full overflow-hidden px-4 py-0.5 gap-7">
            <Label htmlFor="input--quickBuy" className="w-auto text-dark-default-hover">
                Quick Buy
            </Label>
            <Input
                id="input--quickBuy"
                value={value}
                onChange={handleChange}
                placeholder="0.1"
                type="text"
                inputMode="decimal"
                className="w-16 border-none focus-visible:ring-0 focus-visible:border-none font-bold text-center text-brand-200 p-0 placeholder:text-brand-200"
                aria-label={`Quick buy amount in ${currency}`}
            />
            <Image src={getTokenIconImg(currencyIcon)} alt={`${currency} icon`} width={24} height={24} className="w-5 h-5" />
        </div>
    );
});
