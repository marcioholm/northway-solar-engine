'use client';

import { cn } from '../../lib/cn';
import { Text } from '../primitives/Text';

interface TimelineEvent {
  time: string;
  icon: string;
  title: string;
  subtitle?: string;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <Text variant="sm" color="muted">Nenhum evento registrado</Text>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)} style={{ gap: '14px' }}>
      {events.map((evt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Text
            variant="xs"
            color="muted"
            style={{ minWidth: '44px', paddingTop: '3px', fontVariantNumeric: 'tabular-nums' }}
          >
            {evt.time}
          </Text>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            background: evt.color || 'var(--green-light)',
            color: evt.color ? '#fff' : 'var(--green-dark)',
            fontSize: '13px', flexShrink: 0,
          }}>
            {evt.icon}
          </span>
          <div style={{ flex: 1 }}>
            <Text variant="body-bold" style={{ fontSize: '13px' }}>{evt.title}</Text>
            {evt.subtitle && <Text variant="sm" color="muted" style={{ marginTop: '1px' }}>{evt.subtitle}</Text>}
          </div>
        </div>
      ))}
    </div>
  );
}
