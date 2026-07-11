'use client';

import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';

interface PipelineColumnProps {
  label: string;
  count: number;
  pipelineValue?: string;
  color: string;
  children?: React.ReactNode;
  empty?: boolean;
  className?: string;
}

export function PipelineColumn({ label, count, pipelineValue, color, children, empty, className }: PipelineColumnProps) {
  return (
    <div
      className={cn('flex-shrink-0', className)}
      style={{
        width: '260px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '70vh',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />
        <Text variant="body-bold" style={{ flex: 1, fontSize: '13px' }}>{label}</Text>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
            background: 'var(--surface-muted)', padding: '1px 7px',
            borderRadius: 'var(--radius-full)',
          }}>
            {count}
          </span>
          {pipelineValue && (
            <span style={{
              fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)',
              background: 'var(--green-light)', padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
            }}>
              {pipelineValue}
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        padding: '12px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {empty ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px',
          }}>
            <Text variant="sm" color="muted">Nenhum lead</Text>
          </div>
        ) : children}
      </div>
    </div>
  );
}
