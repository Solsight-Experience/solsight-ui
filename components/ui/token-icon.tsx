"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TokenIconProps {
    mint: string;
    logoUri?: string | null;
    symbol?: string | null;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizeMap = {
    xs: "size-4 text-[8px]",
    sm: "size-5 text-[9px]",
    md: "size-7 text-[10px]",
    lg: "size-10 text-xs"
};

const jupiterLogoUrl = (mint: string) => `https://img.jup.ag/tokens/${mint}`;

export const TokenIcon: React.FC<TokenIconProps> = ({ mint, logoUri, symbol, size = "sm", className }) => {
    const [imageSources, setImageSources] = React.useState<string[]>([]);
    const [currentSourceIndex, setCurrentSourceIndex] = React.useState(0);

    React.useEffect(() => {
        const sources = [logoUri, jupiterLogoUrl(mint)].filter((src): src is string => typeof src === "string" && src.length > 0);
        setImageSources(sources);
        setCurrentSourceIndex(0);
    }, [logoUri, mint]);

    const handleImageError = () => {
        if (currentSourceIndex < imageSources.length - 1) {
            setCurrentSourceIndex((prevIndex) => prevIndex + 1);
        } else {
            // Mark as exhausted
            setCurrentSourceIndex(imageSources.length);
        }
    };

    const showFallback = currentSourceIndex >= imageSources.length;
    const currentSrc = imageSources[currentSourceIndex];

    const fallbackText = (symbol && symbol.trim() ? symbol : mint).slice(0, 2).toUpperCase();

    return (
        <Avatar className={cn(sizeMap[size], "shrink-0", className)}>
            {!showFallback && currentSrc && <AvatarImage src={currentSrc} alt={symbol || mint} onError={handleImageError} />}
            <AvatarFallback
                className={cn(
                    "bg-white/[0.08] font-bold",
                    sizeMap[size].split(" ")[1] // extract text size
                )}
            >
                {fallbackText}
            </AvatarFallback>
        </Avatar>
    );
};
