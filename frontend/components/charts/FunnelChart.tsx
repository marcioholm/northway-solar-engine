'use client';

import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';

interface FunnelStage {
  label: string;
  count: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  className?: string;
}

export function FunnelChart({ stages, className }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  if (stages.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        Sem dados de funil
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)} style={{ gap: '8px', padding: '4px 0' }}>
      {stages.map((stage, i) => (
        <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Text variant="sm" color="secondary" style={{ minWidth: '80px' }}>{stage.label}</Text>
          <div style={{
            flex: 1, height: '32px',
            background: 'var(--surface-muted)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%',
              width: `${(stage.count / maxCount) * 100}%`,
              background: stage.color || (i === 0
                ? 'linear-gradient(90deg, #8fd63a, #6db522)'
                : i === stages.length - 1
                  ? 'linear-gradient(90deg, #6db522, #4a8f1a)'
                  : `linear-gradient(90deg, rgba(143,214,58,${1 - i * 0.2}), rgba(109,181,34,${1 - i * 0.2}))`),
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              transition: 'width 0.5s ease',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                {stage.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
