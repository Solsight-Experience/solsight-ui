import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    createChart,
    ColorType,
    CandlestickSeries,
    CandlestickData,
    LineSeries,
    AreaSeries,
    BarSeries,
    BaselineSeries,
    HistogramSeries,
    type IChartApi,
    type ISeriesApi,
    type MouseEventParams,
    type SeriesType,
    type LineData,
    type BarData,
    type HistogramData,
    type SingleValueData,
    type Time
} from "lightweight-charts";
import { toLineData, toAreaData, toBarData, toHistogramData, toBaselineData } from "../../../lib/chart-config";
import { useTokenUIStore } from "../stores/token.stores";
import { useChartData } from "../hooks/token.hooks";
import { usePriceRuler } from "../hooks/usePriceRuler";
import {
    CandlestickChart,
    TrendingUp,
    BarChart3,
    AreaChart as AreaChartIcon,
    Activity,
    BarChart4,
    MousePointer2,
    Minus,
    RectangleHorizontal,
    Circle,
    Trash2,
    Ruler
} from "lucide-react";

interface TokenChartProps {
    tokenAddress: string;
    isMulti: boolean;
    enablePriceRuler?: boolean;
    onRulerPriceChange?: (price: number) => void;
}

type ChartType = "candles" | "line" | "area" | "bars" | "baseline" | "histogram";
type DrawingMode = "pointer" | "line" | "rectangle" | "circle" | null;

interface Drawing {
    mode: DrawingMode;
    start: { x: number; y: number };
    end: { x: number; y: number };
}

type SeriesPoint = CandlestickData | LineData | SingleValueData | BarData | HistogramData;

const setSeriesData = (series: ISeriesApi<SeriesType>, type: ChartType, data: CandlestickData[]) => {
    switch (type) {
        case "candles":
            (series as ISeriesApi<"Candlestick">).setData(data);
            break;
        case "line":
            (series as ISeriesApi<"Line">).setData(toLineData(data));
            break;
        case "area":
            (series as ISeriesApi<"Area">).setData(toAreaData(data));
            break;
        case "bars":
            (series as ISeriesApi<"Bar">).setData(toBarData(data));
            break;
        case "baseline":
            (series as ISeriesApi<"Baseline">).setData(toBaselineData(data));
            break;
        case "histogram":
            (series as ISeriesApi<"Histogram">).setData(toHistogramData(data));
            break;
    }
};

const updateSeries = (series: ISeriesApi<SeriesType>, type: ChartType, point: CandlestickData) => {
    switch (type) {
        case "candles":
            (series as ISeriesApi<"Candlestick">).update(point);
            break;
        case "line":
            (series as ISeriesApi<"Line">).update(toLineData([point])[0]);
            break;
        case "area":
            (series as ISeriesApi<"Area">).update(toAreaData([point])[0]);
            break;
        case "bars":
            (series as ISeriesApi<"Bar">).update(toBarData([point])[0]);
            break;
        case "baseline":
            (series as ISeriesApi<"Baseline">).update(toBaselineData([point])[0]);
            break;
        case "histogram":
            (series as ISeriesApi<"Histogram">).update(toHistogramData([point])[0]);
            break;
    }
};

const readSeriesPrice = (seriesData: SeriesPoint | number): number | null => {
    if (typeof seriesData === "number") return seriesData;
    if ("close" in seriesData && typeof seriesData.close === "number") return seriesData.close;
    if ("value" in seriesData && typeof seriesData.value === "number") return seriesData.value;
    return null;
};

// ── Sidebar icon button ───────────────────────────────────────────────────────
const SideBtn: React.FC<{
    active: boolean;
    title: string;
    onClick: () => void;
    children: React.ReactNode;
    variant?: "purple";
    disabled?: boolean;
}> = ({ active, title, onClick, children, variant = "purple", disabled }) => {
    const activeColor = variant === "purple" ? "rgba(168,85,247,0.25)" : "rgba(59,130,246,0.25)";
    const activeBorder = variant === "purple" ? "rgba(168,85,247,0.6)" : "rgba(59,130,246,0.6)";
    const activeText = variant === "purple" ? "#c084fc" : "#60a5fa";

    return (
        <button
            title={title}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: active ? `1px solid ${activeBorder}` : "1px solid transparent",
                background: active ? activeColor : "transparent",
                color: active ? activeText : "rgba(156,163,175,0.7)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.35 : 1,
                transition: "all 0.15s ease",
                flexShrink: 0
            }}
            onMouseEnter={(e) => {
                if (!active && !disabled) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
        >
            {children}
        </button>
    );
};

// ── Separator ─────────────────────────────────────────────────────────────────
const Sep = () => <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "2px auto" }} />;

export const TokenChart: React.FC<TokenChartProps> = ({ tokenAddress, isMulti, enablePriceRuler = false, onRulerPriceChange }) => {
    const { chartInterval, orderType, limitPrice } = useTokenUIStore();
    const effectiveInterval = isMulti ? "4h" : chartInterval;
    const { initPoints, newPoint } = useChartData(tokenAddress, effectiveInterval);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
    const isInitRef = useRef(false);
    const dataRef = useRef<CandlestickData[]>([]);

    const [type, setType] = useState<ChartType>("candles");
    const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [drawings, setDrawings] = useState<Drawing[]>([]);

    // Ref to track last synced price to prevent circular updates
    const lastSyncedPriceRef = useRef<number | null>(null);

    // Price ruler hook
    const { rulerPrice, setRulerPrice } = usePriceRuler(chartRef, seriesRef, {
        enabled: enablePriceRuler && orderType === "limit"
    });

    // Notify parent when ruler price changes (from chart click)
    useEffect(() => {
        if (rulerPrice !== null && onRulerPriceChange) {
            // Only notify if price actually changed to prevent circular updates
            if (lastSyncedPriceRef.current !== rulerPrice) {
                lastSyncedPriceRef.current = rulerPrice;
                onRulerPriceChange(rulerPrice);
            }
        }
    }, [rulerPrice, onRulerPriceChange]);

    // Sync limitPrice from store to rulerPrice (when user types in input)
    useEffect(() => {
        if (enablePriceRuler && orderType === "limit" && limitPrice) {
            const price = parseFloat(limitPrice);
            if (!isNaN(price) && price > 0) {
                // Only update if price is different from last synced to prevent circular updates
                if (lastSyncedPriceRef.current !== price) {
                    lastSyncedPriceRef.current = price;
                    setRulerPrice(price);
                }
            }
        }
    }, [limitPrice, enablePriceRuler, orderType, setRulerPrice]);

    const hasData = initPoints && initPoints.length > 0;

    // ── Drawing helpers ─────────────────────────────────────────────────────────
    const drawShape = useCallback((ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }, mode: DrawingMode) => {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.5;
        ctx.fillStyle = "rgba(59,130,246,0.08)";

        if (mode === "line") {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        } else if (mode === "rectangle") {
            const w = end.x - start.x;
            const h = end.y - start.y;
            ctx.fillRect(start.x, start.y, w, h);
            ctx.strokeRect(start.x, start.y, w, h);
        } else if (mode === "circle") {
            const r = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
            ctx.beginPath();
            ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }, []);

    const redrawCanvas = useCallback(
        (extra?: { start: { x: number; y: number }; end: { x: number; y: number }; mode: DrawingMode }) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawings.forEach((d) => drawShape(ctx, d.start, d.end, d.mode));
            if (extra) drawShape(ctx, extra.start, extra.end, extra.mode);
        },
        [drawings, drawShape]
    );

    // ── Canvas mouse handlers ───────────────────────────────────────────────────
    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawingMode || drawingMode === "pointer") return;
        e.preventDefault();
        setIsDrawing(true);
        setStartPos(getPos(e));
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPos || !drawingMode || drawingMode === "pointer") return;
        e.preventDefault();
        redrawCanvas({ start: startPos, end: getPos(e), mode: drawingMode });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPos || !drawingMode || drawingMode === "pointer") return;
        e.preventDefault();
        const end = getPos(e);
        setDrawings((prev) => [...prev, { mode: drawingMode, start: startPos, end }]);
        setIsDrawing(false);
        setStartPos(null);
    };

    const clearDrawings = () => {
        setDrawings([]);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };

    // ── Toggle drawing mode ─────────────────────────────────────────────────────
    const toggleDraw = (mode: DrawingMode) => setDrawingMode((prev) => (prev === mode ? null : mode));

    // ── Sync canvas size ────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        redrawCanvas();
    }, [drawings, redrawCanvas]);

    // ── Init chart ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const chart = createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#9ca3af"
            },
            grid: {
                vertLines: { color: "#1f2933" },
                horzLines: { color: "#1f2933" }
            },
            timeScale: { timeVisible: true }
        });

        chartRef.current = chart;

        const observer = new ResizeObserver(() => {
            chart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight
            });
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            isInitRef.current = false;
            dataRef.current = [];
        };
    }, []);

    // ── Switch chart type ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!chartRef.current) return;
        if (seriesRef.current) {
            chartRef.current.removeSeries(seriesRef.current);
            seriesRef.current = null;
            isInitRef.current = false;
        }
        const chart = chartRef.current;

        switch (type) {
            case "candles":
                seriesRef.current = chart.addSeries(CandlestickSeries, {
                    upColor: "#22c55e",
                    downColor: "#ef4444",
                    borderVisible: false,
                    wickUpColor: "#22c55e",
                    wickDownColor: "#ef4444"
                });
                break;
            case "line":
                seriesRef.current = chart.addSeries(LineSeries, {
                    color: "#3b82f6"
                });
                break;
            case "area":
                seriesRef.current = chart.addSeries(AreaSeries, {
                    lineColor: "#3b82f6",
                    topColor: "rgba(59,130,246,0.4)",
                    bottomColor: "rgba(59,130,246,0.05)"
                });
                break;
            case "bars":
                seriesRef.current = chart.addSeries(BarSeries, {
                    upColor: "#22c55e",
                    downColor: "#ef4444"
                });
                break;
            case "baseline":
                seriesRef.current = chart.addSeries(BaselineSeries, {
                    baseValue: { type: "price", price: 50 },
                    topLineColor: "#22c55e",
                    bottomLineColor: "#ef4444"
                });
                break;
            case "histogram":
                seriesRef.current = chart.addSeries(HistogramSeries, {
                    priceFormat: { type: "volume" }
                });
                break;
        }
        if (dataRef.current.length) {
            setSeriesData(seriesRef.current, type, dataRef.current);
            isInitRef.current = true;
        }
    }, [type]);

    // ── Load initial data ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!seriesRef.current || !initPoints?.length || dataRef.current.length) return;
        dataRef.current = initPoints.filter((point) => point?.time);
        const d = dataRef.current;
        setSeriesData(seriesRef.current, type, d);
        isInitRef.current = true;
        chartRef.current?.timeScale().fitContent();
    }, [initPoints, type]);

    // ── Realtime update ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!seriesRef.current || !newPoint || !isInitRef.current) return;
        const last = dataRef.current[dataRef.current.length - 1];
        if (last && last.time === newPoint.time) {
            dataRef.current[dataRef.current.length - 1] = newPoint;
        } else {
            dataRef.current.push(newPoint);
        }
        updateSeries(seriesRef.current, type, newPoint);
    }, [newPoint, type]);

    // ── Chart click handler for price ruler ────────────────────────────────────
    useEffect(() => {
        if (!chartRef.current || !enablePriceRuler || orderType !== "limit") return;

        const handleClick = (param: MouseEventParams<Time>) => {
            // Only handle clicks when not in drawing mode
            if (drawingMode && drawingMode !== "pointer") return;

            if (param.point && param.seriesData && seriesRef.current) {
                const seriesData = param.seriesData.get(seriesRef.current);
                if (seriesData) {
                    const price = readSeriesPrice(seriesData as SeriesPoint | number);

                    if (typeof price === "number") setRulerPrice(price);
                }
            }
        };

        chartRef.current.subscribeClick(handleClick);

        return () => {
            chartRef.current?.unsubscribeClick(handleClick);
        };
    }, [enablePriceRuler, orderType, drawingMode, setRulerPrice]);

    // ── Cursor ─────────────────────────────────────────────────────────────────
    const canvasCursor = drawingMode && drawingMode !== "pointer" ? "crosshair" : drawingMode === "pointer" ? "default" : "default";

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex gap-2 w-full h-full">
            {/* ── Left sidebar ── */}
            {!isMulti && (
                <div className="flex flex-col items-center gap-1 p-2 bg-[var(--surface-card)] border-r border-[var(--border-faint)] rounded-l-lg w-fit">
                    {/* Chart type group */}
                    <SideBtn active={type === "candles"} title="Candles" onClick={() => setType("candles")} variant="purple">
                        <CandlestickChart size={15} />
                    </SideBtn>
                    <SideBtn active={type === "line"} title="Line" onClick={() => setType("line")} variant="purple">
                        <TrendingUp size={15} />
                    </SideBtn>
                    <SideBtn active={type === "area"} title="Area" onClick={() => setType("area")} variant="purple">
                        <AreaChartIcon size={15} />
                    </SideBtn>
                    <SideBtn active={type === "bars"} title="Bars" onClick={() => setType("bars")} variant="purple">
                        <BarChart3 size={15} />
                    </SideBtn>
                    <SideBtn active={type === "baseline"} title="Baseline" onClick={() => setType("baseline")} variant="purple">
                        <Activity size={15} />
                    </SideBtn>
                    <SideBtn active={type === "histogram"} title="Histogram" onClick={() => setType("histogram")} variant="purple">
                        <BarChart4 size={15} />
                    </SideBtn>

                    <Sep />

                    {/* Drawing tools */}
                    <SideBtn active={drawingMode === "pointer"} title="Pointer" onClick={() => toggleDraw("pointer")} variant="purple">
                        <MousePointer2 size={15} />
                    </SideBtn>
                    <SideBtn active={drawingMode === "line"} title="Line" onClick={() => toggleDraw("line")} variant="purple">
                        <Minus size={15} />
                    </SideBtn>
                    <SideBtn active={drawingMode === "rectangle"} title="Rectangle" onClick={() => toggleDraw("rectangle")} variant="purple">
                        <RectangleHorizontal size={15} />
                    </SideBtn>
                    <SideBtn active={drawingMode === "circle"} title="Circle" onClick={() => toggleDraw("circle")} variant="purple">
                        <Circle size={15} />
                    </SideBtn>

                    <Sep />

                    {/* Price Ruler for Limit Orders */}
                    <SideBtn
                        active={enablePriceRuler && orderType === "limit"}
                        title="Set Limit Price (Click on chart)"
                        onClick={() => {
                            if (!enablePriceRuler) return;
                            // Get current last price from data
                            const data = dataRef.current;
                            if (data.length > 0) {
                                const lastCandle = data[data.length - 1];
                                const lastPrice = lastCandle.close;
                                if (lastPrice) {
                                    setRulerPrice(lastPrice);
                                }
                            }
                        }}
                        variant="purple"
                        disabled={!enablePriceRuler || orderType !== "limit"}
                    >
                        <Ruler size={15} />
                    </SideBtn>

                    <Sep />

                    <SideBtn active={false} title="Clear drawings" onClick={clearDrawings} disabled={drawings.length === 0}>
                        <Trash2 size={15} />
                    </SideBtn>
                </div>
            )}

            {/* ── Chart + canvas ── */}
            <div className="relative rounded-r-lg flex-1 overflow-hidden">
                {/* No-data overlay */}
                {!hasData && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-gray-900/95 to-gray-900/98 rounded-r-lg">
                        <p className="text-[var(--text-muted)] text-sm font-medium">No chart data available</p>
                    </div>
                )}

                {/* Lightweight-charts mount point */}
                <div ref={containerRef} className="w-full h-full" />

                {/* Drawing canvas — sits on top, only captures events when a draw tool is active */}
                {!isMulti && (
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="absolute inset-0 w-full h-full cursor-pointer"
                        style={{
                            // Only intercept pointer events when a drawing tool is selected
                            pointerEvents: drawingMode && drawingMode !== "pointer" ? "all" : "none",
                            zIndex: 5
                        }}
                    />
                )}
            </div>
        </div>
    );
};
