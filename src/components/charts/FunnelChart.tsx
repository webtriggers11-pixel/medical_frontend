import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { FunnelChart as FunnelSeries } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([FunnelSeries, LegendComponent, TooltipComponent, CanvasRenderer]);

export interface FunnelDatum {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelDatum[];
  colors?: string[];
  /** Number → px, or any CSS height string (e.g. '100%' to fill a flex parent). */
  height?: number | string;
}

/** Horizontal funnel (Apache ECharts), tree-shaken to just the funnel pieces. */
export function FunnelChart({ data, colors, height = 360 }: FunnelChartProps) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<ReturnType<typeof echarts.init> | null>(null);

  // Init once + keep responsive.
  useEffect(() => {
    if (!el.current) return;
    chart.current = echarts.init(el.current);
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  // Render / update on data change.
  useEffect(() => {
    if (!chart.current) return;
    const max = Math.max(...data.map((d) => d.value), 1);
    const option = {
      color: colors,
      tooltip: { trigger: 'item', formatter: '{b}<br/><b>{c}</b> ({d}%)' },
      legend: {
        top: 0,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 13,
        itemHeight: 13,
        itemGap: 16,
        textStyle: { color: '#475569', fontSize: 12 },
      },
      series: [
        {
          type: 'funnel',
          orient: 'horizontal',
          funnelAlign: 'center',
          left: '3%',
          right: '3%',
          top: 56,
          bottom: 16,
          min: 0,
          max,
          minSize: '14%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          // Labels live INSIDE each segment so they never clip the card.
          // Stage name wraps; the value sits below it, larger and bolder.
          label: {
            show: true,
            position: 'inside',
            formatter: '{name|{b}}\n{val|{c}}',
            rich: {
              name: {
                color: '#fff',
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 15,
                width: 88,
                overflow: 'break',
                align: 'center',
                textShadowColor: 'rgba(15, 23, 42, 0.45)',
                textShadowBlur: 4,
              },
              val: {
                color: '#fff',
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 24,
                align: 'center',
                textShadowColor: 'rgba(15, 23, 42, 0.45)',
                textShadowBlur: 4,
              },
            },
          },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          emphasis: { label: { rich: { name: { fontWeight: 700 }, val: { fontSize: 18 } } } },
          data,
        },
      ],
    };
    chart.current.setOption(option as echarts.EChartsCoreOption);
  }, [data, colors]);

  return <div ref={el} style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }} />;
}
