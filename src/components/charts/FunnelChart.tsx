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
          left: '4%',
          right: '4%',
          top: 56,
          bottom: 8,
          min: 0,
          max,
          minSize: '12%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'bottom',
            formatter: '{b}\n{c}',
            color: '#64748B',
            fontSize: 11,
            lineHeight: 15,
          },
          labelLine: { length: 18, lineStyle: { width: 1, color: '#CBD5E1' } },
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          emphasis: { label: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' } },
          data,
        },
      ],
    };
    chart.current.setOption(option as echarts.EChartsCoreOption);
  }, [data, colors]);

  return <div ref={el} style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }} />;
}
