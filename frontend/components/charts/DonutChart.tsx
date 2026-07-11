'use client';

import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';

interface DonutSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  centerLabel?: string;
  size?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#8fd63a', '#6db522', '#fbbf24', '#60a5fa', '#a78bfa'];

export function DonutChart({ segments, total, centerLabel, size = 100, className }: DonutChartProps) {
  const r = 38;
  const c = 2 * Math.PI * r;

  const items = segments.length > 0 ? segments : [];

  return (
    <div className={cn('flex flex-col items-center', className)} style={{ gap: '12px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          {items.map((seg, i) => {
            const totalPct = items.slice(0, i).reduce((s, x) => s + (x.percentage || 0), 0);
            const offset = c - ((seg.percentage / 100) * c);
            return (
              <circle
                key={seg.label}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                strokeWidth="10"
                strokeDasharray={c}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(${(totalPct / 100) * 360 - 90} 50 50)`}
              />
            );
          })}
          {items.length === 0 && (
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          )}
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <Text variant="h3" style={{ fontSize: '18px', fontWeight: 800 }}>{total}</Text>
            {centerLabel && <Text variant="xs" color="muted">{centerLabel}</Text>}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {items.map((seg, i) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
              flexShrink: 0,
            }} />
            <Text variant="sm" style={{ flex: 1 }}>{seg.label}</Text>
            <Text variant="xs" style={{ fontWeight: 700 }}>{seg.percentage}%</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
