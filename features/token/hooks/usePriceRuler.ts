import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi, IPriceLine, SeriesType } from "lightweight-charts";

interface UsePriceRulerOptions {
    enabled: boolean;
    initialPrice?: number | null;
}

export const usePriceRuler = (
    chartRef: React.MutableRefObject<IChartApi | null>,
    seriesRef: React.MutableRefObject<ISeriesApi<SeriesType> | null>,
    options: UsePriceRulerOptions
) => {
    const { enabled, initialPrice } = options;
    const [rulerPrice, setRulerPrice] = useState<number | null>(initialPrice ?? null);
    const priceLineRef = useRef<IPriceLine | null>(null);

    useEffect(() => {
        const series = seriesRef.current;

        if (!enabled || !series || rulerPrice === null) {
            // Remove existing line
            if (priceLineRef.current && series) {
                try {
                    series.removePriceLine(priceLineRef.current);
                } catch {
                    // Price line may already be removed
                }
                priceLineRef.current = null;
            }
            return;
        }

        // Remove old price line if exists
        if (priceLineRef.current && series) {
            try {
                series.removePriceLine(priceLineRef.current);
            } catch {
                // Price line may already be removed
            }
        }

        // Create draggable price line
        const priceLine = series.createPriceLine({
            price: rulerPrice,
            color: "#f59e0b", // Amber color
            lineWidth: 2,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: "Limit"
        });

        priceLineRef.current = priceLine;

        return () => {
            if (priceLineRef.current) {
                try {
                    series.removePriceLine(priceLineRef.current);
                } catch {
                    // Price line may already be removed
                }
            }
        };
    }, [enabled, rulerPrice, seriesRef]);

    const updateRulerPrice = (price: number | null) => {
        setRulerPrice(price);
    };

    return { rulerPrice, setRulerPrice: updateRulerPrice };
};
