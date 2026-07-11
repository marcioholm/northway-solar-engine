'use client';

import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';

interface MetricCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: { value: string; direction: 'up' | 'down'; label: string };
  children?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, icon, trend, children, className }: MetricCardProps) {
  return (
    <div
      className={cn(className)}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="xxs" color="secondary">{label}</Text>
        {icon && <span style={{ fontSize: '20px', opacity: 0.3, lineHeight: 1 }}>{icon}</span>}
      </div>
      <Text variant="h1" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>{value}</Text>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '12px', fontWeight: 600,
            color: trend.direction === 'up' ? '#15803d' : '#dc2626',
            background: trend.direction === 'up' ? '#f0fdf4' : '#fef2f2',
            padding: '2px 8px', borderRadius: '6px',
          }}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
          <Text variant="xs" color="muted">{trend.label}</Text>
        </div>
      )}
      {children}
    </div>
  );
}
