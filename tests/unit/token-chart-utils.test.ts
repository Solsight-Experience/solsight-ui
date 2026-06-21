import { describe, expect, it } from "vitest";
import { normalizeCandlePoint, normalizeChartPoints } from "@/features/token/utils/chart.utils";

describe("token chart utils", () => {
    it("normalizes candle timestamps and numeric string prices", () => {
        expect(
            normalizeCandlePoint({
                timestamp: "1710000000000",
                open: "1.1",
                high: "1.3",
                low: "1",
                close: "1.2"
            })
        ).toEqual({
            time: 1710000000,
            open: 1.1,
            high: 1.3,
            low: 1,
            close: 1.2
        });
    });

    it("rejects values outside lightweight-charts price bounds", () => {
        expect(
            normalizeCandlePoint({
                timestamp: 1710000000,
                open: 1,
                high: 3_640_936_738_170_546_700,
                low: 1,
                close: 1
            })
        ).toBeNull();
    });

    it("filters invalid points before sorting chart data", () => {
        const points = normalizeChartPoints([
            {
                timestamp: 1710000002,
                open: 2,
                high: 2.5,
                low: 1.5,
                close: 2.2,
                volume: 100
            },
            {
                timestamp: 1710000001,
                open: 1,
                high: 3_640_936_738_170_546_700,
                low: 1,
                close: 1,
                volume: 100
            },
            {
                timestamp: 1710000000,
                open: 1,
                high: 1.5,
                low: 0.8,
                close: 1.2,
                volume: 100
            }
        ]);

        expect(points.map((point) => point.time)).toEqual([1710000000, 1710000002]);
    });
});
