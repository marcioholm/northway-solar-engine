'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: { value: string; direction: 'up' | 'down'; label: string };
  variant?: 'default' | 'goal';
  children?: ReactNode;
}

export default function MetricCard({ label, value, icon, trend, variant = 'default', children }: MetricCardProps) {
  if (variant === 'goal') {
    return (
      <article className="goal-card" style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        border: '1px solid var(--line)',
      }}>
        {children}
      </article>
    );
  }

  return (
    <article style={{
      background: 'white',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {label}
        </span>
        <span style={{ fontSize: '20px', opacity: 0.5 }}>{icon}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.1, color: 'var(--text)' }}>
        {value}
      </div>
      {trend && (
        <small style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: trend.direction === 'up' ? '#15803d' : '#dc2626',
          background: trend.direction === 'up' ? '#f0fdf4' : '#fef2f2',
          padding: '2px 8px',
          borderRadius: '6px',
        }}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          <em style={{ fontStyle: 'normal', fontWeight: 400, opacity: 0.7 }}>{trend.label}</em>
        </small>
      )}
    </article>
  );
}
