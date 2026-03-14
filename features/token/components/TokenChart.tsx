import React, { useEffect, useRef, useState, useCallback } from 'react';
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
} from 'lightweight-charts';
import {
  toLineData,
  toAreaData,
  toBarData,
  toHistogramData,
  toBaselineData,
} from '../../../lib/chart-config';
import { useTokenUIStore } from '../stores/token.stores';
import { useChartData } from '../hooks/token.hooks';
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
} from 'lucide-react';

interface TokenChartProps {
  tokenAddress: string;
  isMulti: boolean;
}

type ChartType = 'candles' | 'line' | 'area' | 'bars' | 'baseline' | 'histogram';
type DrawingMode = 'pointer' | 'line' | 'rectangle' | 'circle' | null;

interface Drawing {
  mode: DrawingMode;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// ── Sidebar icon button ───────────────────────────────────────────────────────
const SideBtn: React.FC<{
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'purple';
  disabled?: boolean;
}> = ({ active, title, onClick, children, variant = 'purple', disabled }) => {
  const activeColor = variant === 'purple'
    ? 'rgba(168,85,247,0.25)'
    : 'rgba(59,130,246,0.25)';
  const activeBorder = variant === 'purple'
    ? 'rgba(168,85,247,0.6)'
    : 'rgba(59,130,246,0.6)';
  const activeText = variant === 'purple' ? '#c084fc' : '#60a5fa';

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        border: active ? `1px solid ${activeBorder}` : '1px solid transparent',
        background: active ? activeColor : 'transparent',
        color: active ? activeText : 'rgba(156,163,175,0.7)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active && !disabled)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={e => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
};

// ── Separator ─────────────────────────────────────────────────────────────────
const Sep = () => (
  <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '2px auto' }} />
);

export const TokenChart: React.FC<TokenChartProps> = ({ tokenAddress, isMulti }) => {
  const { chartInterval } = useTokenUIStore();
  const { initPoints, newPoint } = useChartData(tokenAddress, chartInterval);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null);
  const isInitRef    = useRef(false);
  const dataRef      = useRef<CandlestickData[]>([]);

  const [type, setType]               = useState<ChartType>('candles');
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
  const [isDrawing, setIsDrawing]     = useState(false);
  const [startPos, setStartPos]       = useState<{ x: number; y: number } | null>(null);
  const [drawings, setDrawings]       = useState<Drawing[]>([]);

  const hasData = initPoints && initPoints.length > 0;
  const chartH = isMulti ? 200 : 460;

  // ── Drawing helpers ─────────────────────────────────────────────────────────
  const drawShape = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      start: { x: number; y: number },
      end: { x: number; y: number },
      mode: DrawingMode
    ) => {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(59,130,246,0.08)';

      if (mode === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (mode === 'rectangle') {
        const w = end.x - start.x;
        const h = end.y - start.y;
        ctx.fillRect(start.x, start.y, w, h);
        ctx.strokeRect(start.x, start.y, w, h);
      } else if (mode === 'circle') {
        const r = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    },
    []
  );

  const redrawCanvas = useCallback(
    (extra?: {
      start: { x: number; y: number };
      end: { x: number; y: number };
      mode: DrawingMode;
    }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
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
    if (!drawingMode || drawingMode === 'pointer') return;
    e.preventDefault();
    setIsDrawing(true);
    setStartPos(getPos(e));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !drawingMode || drawingMode === 'pointer') return;
    e.preventDefault();
    redrawCanvas({ start: startPos, end: getPos(e), mode: drawingMode });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !drawingMode || drawingMode === 'pointer') return;
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
    const ctx = canvas.getContext('2d');
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

    const chart = createChart(containerRef.current, {
      height: chartH,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2933' },
        horzLines: { color: '#1f2933' },
      },
      timeScale: { timeVisible: true },
    });

    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      isInitRef.current = false;
      dataRef.current = [];
    };
  }, [isMulti]);

  // ── Switch chart type ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return;
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
      isInitRef.current = false;
    }
    const chart = chartRef.current;

    const addSeriesCompat = (
      legacyMethod: string,
      seriesDef: any,
      options: Record<string, unknown>
    ) => {
      if (typeof chart.addSeries === 'function') {
        return chart.addSeries(seriesDef, options);
      }
      if (typeof chart[legacyMethod] === 'function') {
        return chart[legacyMethod](options);
      }
      throw new Error(`Unsupported lightweight-charts API: ${legacyMethod}`);
    };

    switch (type) {
      case 'candles':
        seriesRef.current = addSeriesCompat('addCandlestickSeries', CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
        break;
      case 'line':
        seriesRef.current = addSeriesCompat('addLineSeries', LineSeries, {
          color: '#3b82f6',
        });
        break;
      case 'area':
        seriesRef.current = addSeriesCompat('addAreaSeries', AreaSeries, {
          lineColor: '#3b82f6',
          topColor: 'rgba(59,130,246,0.4)',
          bottomColor: 'rgba(59,130,246,0.05)',
        });
        break;
      case 'bars':
        seriesRef.current = addSeriesCompat('addBarSeries', BarSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
        });
        break;
      case 'baseline':
        seriesRef.current = addSeriesCompat('addBaselineSeries', BaselineSeries, {
          baseValue: { type: 'price', price: 50 },
          topLineColor: '#22c55e',
          bottomLineColor: '#ef4444',
        });
        break;
      case 'histogram':
        seriesRef.current = addSeriesCompat('addHistogramSeries', HistogramSeries, {
          priceFormat: { type: 'volume' },
        });
        break;
    }
    if (dataRef.current.length) {
      const d = dataRef.current;
      seriesRef.current.setData(
        type === 'candles'
          ? d
          : type === 'line'
            ? toLineData(d)
            : type === 'area'
              ? toAreaData(d)
              : type === 'bars'
                ? toBarData(d)
                : type === 'baseline'
                  ? toBaselineData(d)
                  : toHistogramData(d)
      );
      isInitRef.current = true;
    }
  }, [type]);

  // ── Load initial data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !initPoints?.length || dataRef.current.length) return;
    dataRef.current = initPoints
      .filter((p) => p?.time)
      .map((p) => ({
        ...p,
        time: typeof p.time === 'string' ? Math.floor(new Date(p.time).getTime() / 1000) : p.time,
      }));
    const d = dataRef.current;
    seriesRef.current.setData(
      type === 'candles'
        ? d
        : type === 'line'
          ? toLineData(d)
          : type === 'area'
            ? toAreaData(d)
            : type === 'bars'
              ? toBarData(d)
              : type === 'baseline'
                ? toBaselineData(d)
                : toHistogramData(d)
    );
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
    const pt = newPoint;
    seriesRef.current.update(
      type === 'candles'
        ? pt
        : type === 'line'
          ? toLineData([pt])[0]
          : type === 'area'
            ? toAreaData([pt])[0]
            : type === 'bars'
              ? toBarData([pt])[0]
              : type === 'baseline'
                ? toBaselineData([pt])[0]
                : toHistogramData([pt])[0]
    );
  }, [newPoint, type]);

  // ── Cursor ─────────────────────────────────────────────────────────────────
  const canvasCursor =
    drawingMode && drawingMode !== 'pointer'
      ? 'crosshair'
      : drawingMode === 'pointer'
        ? 'default'
        : 'default';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
      {/* ── Left sidebar ── */}
      {!isMulti && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '8px 6px',
            width: 44,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.02)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px 0 0 8px',
          }}
        >
          {/* Chart type group */}
          <SideBtn
            active={type === 'candles'}
            title="Candles"
            onClick={() => setType('candles')}
            variant="purple"
          >
            <CandlestickChart size={15} />
          </SideBtn>
          <SideBtn
            active={type === 'line'}
            title="Line"
            onClick={() => setType('line')}
            variant="purple"
          >
            <TrendingUp size={15} />
          </SideBtn>
          <SideBtn
            active={type === 'area'}
            title="Area"
            onClick={() => setType('area')}
            variant="purple"
          >
            <AreaChartIcon size={15} />
          </SideBtn>
          <SideBtn
            active={type === 'bars'}
            title="Bars"
            onClick={() => setType('bars')}
            variant="purple"
          >
            <BarChart3 size={15} />
          </SideBtn>
          <SideBtn
            active={type === 'baseline'}
            title="Baseline"
            onClick={() => setType('baseline')}
            variant="purple"
          >
            <Activity size={15} />
          </SideBtn>
          <SideBtn
            active={type === 'histogram'}
            title="Histogram"
            onClick={() => setType('histogram')}
            variant="purple"
          >
            <BarChart4 size={15} />
          </SideBtn>

          <Sep />

          {/* Drawing tools */}
          <SideBtn
            active={drawingMode === 'pointer'}
            title="Pointer"
            onClick={() => toggleDraw('pointer')}
            variant="purple"
          >
            <MousePointer2 size={15} />
          </SideBtn>
          <SideBtn
            active={drawingMode === 'line'}
            title="Line"
            onClick={() => toggleDraw('line')}
            variant="purple"
          >
            <Minus size={15} />
          </SideBtn>
          <SideBtn
            active={drawingMode === 'rectangle'}
            title="Rectangle"
            onClick={() => toggleDraw('rectangle')}
            variant="purple"
          >
            <RectangleHorizontal size={15} />
          </SideBtn>
          <SideBtn
            active={drawingMode === 'circle'}
            title="Circle"
            onClick={() => toggleDraw('circle')}
            variant="purple"
          >
            <Circle size={15} />
          </SideBtn>

          <Sep />

          <SideBtn
            active={false}
            title="Clear drawings"
            onClick={clearDrawings}
            disabled={drawings.length === 0}
          >
            <Trash2 size={15} />
          </SideBtn>
        </div>
      )}

      {/* ── Chart + canvas ── */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          height: chartH,
          borderRadius: isMulti ? 8 : '0 8px 8px 0',
          overflow: 'hidden',
        }}
      >
        {/* No-data overlay */}
        {!hasData && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg,rgba(17,24,39,0.95),rgba(15,20,30,0.98))',
              borderRadius: 'inherit',
            }}
          >
            <p
              style={{
                color: 'rgba(156,163,175,0.6)',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'ui-monospace,monospace',
              }}
            >
              No chart data available
            </p>
          </div>
        )}

        {/* Lightweight-charts mount point */}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Drawing canvas — sits on top, only captures events when a draw tool is active */}
        {!isMulti && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: canvasCursor,
              // Only intercept pointer events when a drawing tool is selected
              pointerEvents: drawingMode && drawingMode !== 'pointer' ? 'all' : 'none',
              zIndex: 5,
            }}
          />
        )}
      </div>
    </div>
  );
};