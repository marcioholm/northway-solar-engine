'use client';

import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';
import { Chip } from '../ui/Chip';

interface KanbanCardProps {
  name: string;
  subtitle?: string;
  value?: number;
  margin?: number;
  profit?: number;
  power?: string;
  onClick?: () => void;
  className?: string;
}

export function KanbanCard({ name, subtitle, value, margin, profit, power, onClick, className }: KanbanCardProps) {
  return (
    <div
      className={cn(className)}
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        border: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.15s ease',
        boxShadow: 'var(--shadow-xs)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Text variant="body-bold" style={{ flex: 1, fontSize: '13px' }}>{name}</Text>
      </div>
      {subtitle && (
        <Text variant="sm" color="secondary" style={{ margin: 0 }}>{subtitle}</Text>
      )}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {value !== undefined && (
          <Chip variant="profit" dot="#fbbf24">
            R$ {value.toLocaleString('pt-BR')}
          </Chip>
        )}
        {power && (
          <Chip variant="default">{power}</Chip>
        )}
        {margin !== undefined && (
          <Chip variant={margin > 20 ? 'margin' : 'profit'} dot={margin > 20 ? '#22c55e' : '#f59e0b'}>
            Margem {margin}%
          </Chip>
        )}
      </div>
    </div>
  );
}
