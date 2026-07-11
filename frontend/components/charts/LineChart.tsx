'use client';

import { cn } from '../../lib/cn';

interface LineChartProps {
  series: { label: string; data: number[]; color: string; dashed?: boolean }[];
  height?: number;
  className?: string;
}

export function LineChart({ series, height = 180, className }: LineChartProps) {
  const w = 600;
  const h = height;
  const allValues = series.flatMap(s => s.data);
  const maxVal = Math.max(...allValues, 1);

  if (allValues.length === 0) {
    return (
      <div style={{ height, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        Sem dados
      </div>
    );
  }

  const toPoint = (vals: number[], i: number) => {
    const x = (i / Math.max(vals.length - 1, 1)) * w;
    const y = h - ((vals[i] || 0) / maxVal) * (h - 20) - 10;
    return `${x},${y}`;
  };

  return (
    <div className={cn(className)}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        {series.map(s => (
          <polyline
            key={s.label}
            points={s.data.map((_, i) => toPoint(s.data, i)).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={s.dashed ? '6 3' : undefined}
          />
        ))}
      </svg>
    </div>
  );
}
