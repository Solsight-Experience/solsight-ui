import { memo, useMemo } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";
import { getTokenIconImg, TokenIconImg } from "@/lib/token-helper";

interface QuickBuyInputProps {
    value: string;
    onChange: (value: string) => void;
    currency?: string;
    currencyIcon?: TokenIconImg;
}

export const QuickBuyInput = memo<QuickBuyInputProps>(function QuickBuyInput({ value, onChange, currency = "SOL", currencyIcon = "sol" }) {
    const formatter = useMemo(() => new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 9 }), []);

    return (
        <div className="flex items-center border-[1.25] border-brand-200 rounded-full overflow-hidden px-4 py-0.5 gap-7">
            <Label htmlFor="input--quickBuy" className="w-auto text-dark-default-hover">
                Quick Buy
            </Label>
            <NumbericInput
                id="input--quickBuy"
                mode="string"
                decimals={9}
                formatter={formatter}
                value={value}
                onChange={onChange}
                placeholder="0.1"
                className="w-16 border-none focus-visible:ring-0 focus-visible:border-none font-bold text-center text-brand-200 p-0 placeholder:text-brand-200"
                aria-label={`Quick buy amount in ${currency}`}
            />
            <Image src={getTokenIconImg(currencyIcon)} alt={`${currency} icon`} width={24} height={24} className="w-5 h-5" />
        </div>
    );
});
