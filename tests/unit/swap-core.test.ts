import { describe, expect, it } from "vitest";
import { buildRoutePathTokens, formatFromBaseUnits, getRouteDetails, mapQuoteError, mapSwapError, toBaseUnits } from "@/features/swap";

describe("swap core utils", () => {
    it("converts values to base units", () => {
        expect(toBaseUnits("1.23", 6)).toBe("1230000");
        expect(toBaseUnits("0.000001", 6)).toBe("1");
        expect(toBaseUnits("abc", 6)).toBeNull();
    });

    it("formats from base units", () => {
        expect(formatFromBaseUnits("1230000", 6)).toBe("1.23");
        expect(formatFromBaseUnits("1", 6)).toBe("0.000001");
    });

    it("extracts unique route labels", () => {
        const details = getRouteDetails([{ swapInfo: { label: "Raydium" } }, { swapInfo: { label: "Orca" } }, { swapInfo: { label: "Raydium" } }]);

        expect(details).toEqual(["Raydium", "Orca"]);
    });

    it("builds route token path", () => {
        const inputMint = "So11111111111111111111111111111111111111112";
        const outputMint = "TokenMint1111111111111111111111111111111111";

        const path = buildRoutePathTokens(
            [
                { swapInfo: { inputMint, outputMint: "MidMint11111111111111111111111111111111111" } },
                { swapInfo: { inputMint: "MidMint11111111111111111111111111111111111", outputMint } }
            ],
            inputMint,
            outputMint,
            "SOL",
            "ABC"
        );

        expect(path.map((item) => item.display)).toEqual(["SOL", "MidM...1111", "ABC"]);
    });

    it("maps quote and swap errors", () => {
        expect(mapQuoteError({ errorCode: "TOKEN_NOT_TRADABLE" })).toContain("not tradable");
        expect(mapQuoteError({ error: "boom" })).toBe("boom");

        expect(mapSwapError("Access forbidden from RPC", "https://api.jup.ag/swap/v1/swap", "https://api.jup.ag/swap/v1/quote")).toContain("403");
    });
});
