import { useEffect, useRef, useState } from 'react';
import type { IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';

interface UsePriceRulerOptions {
  enabled: boolean;
  initialPrice?: number | null;
}

export const usePriceRuler = (
  chartRef: React.MutableRefObject<IChartApi | null>,
  seriesRef: React.MutableRefObject<ISeriesApi<any> | null>,
  options: UsePriceRulerOptions
) => {
  const { enabled, initialPrice } = options;
  const [rulerPrice, setRulerPrice] = useState<number | null>(initialPrice ?? null);
  const priceLineRef = useRef<IPriceLine | null>(null);

  useEffect(() => {
    if (!enabled || !seriesRef.current || rulerPrice === null) {
      // Remove existing line
      if (priceLineRef.current && seriesRef.current) {
        try {
          seriesRef.current.removePriceLine(priceLineRef.current);
        } catch (e) {
          // Price line may already be removed
        }
        priceLineRef.current = null;
      }
      return;
    }

    // Remove old price line if exists
    if (priceLineRef.current && seriesRef.current) {
      try {
        seriesRef.current.removePriceLine(priceLineRef.current);
      } catch (e) {
        // Price line may already be removed
      }
    }

    // Create draggable price line
    const priceLine = seriesRef.current.createPriceLine({
      price: rulerPrice,
      color: '#f59e0b', // Amber color
      lineWidth: 2,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: 'Limit',
    });

    priceLineRef.current = priceLine;

    return () => {
      if (priceLineRef.current && seriesRef.current) {
        try {
          seriesRef.current.removePriceLine(priceLineRef.current);
        } catch (e) {
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
