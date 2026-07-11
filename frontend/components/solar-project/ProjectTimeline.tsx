'use client';

import { Flex } from '../primitives/Flex';
import { Text } from '../primitives/Text';

const STAGES = [
  { key: 'draft', label: 'Rascunho' },
  { key: 'client', label: 'Cliente' },
  { key: 'site', label: 'Local' },
  { key: 'consumption', label: 'Consumo' },
  { key: 'sizing', label: 'Dimensionamento' },
  { key: 'quotes', label: 'Cotação' },
  { key: 'pricing', label: 'Precificação' },
  { key: 'review', label: 'Revisão' },
  { key: 'proposal', label: 'Proposta' },
  { key: 'closed_won', label: 'Fechado' },
];

export function ProjectTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus);

  return (
    <div style={{ padding: '20px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '600px', gap: 0 }}>
        {STAGES.map((stage, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const isLastClosed = stage.key === 'closed_won' || stage.key === 'closed_lost';

          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: isLastClosed ? 0 : 1 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--green)' : active ? 'var(--green)' : 'var(--line)',
                color: done || active ? '#fff' : 'var(--text-muted)',
                display: 'grid', placeItems: 'center',
                fontSize: '12px', fontWeight: 800,
                position: 'relative',
                boxShadow: active ? '0 0 0 4px rgba(143, 214, 58, 0.2)' : 'none',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <div style={{
                position: 'absolute', marginTop: '48px',
                fontSize: '10px', fontWeight: active ? 700 : 500,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                whiteSpace: 'nowrap', textAlign: 'center',
              }}>
                {stage.label}
              </div>
              {!isLastClosed && (
                <div style={{
                  flex: 1, height: '2px',
                  background: done ? 'var(--green)' : 'var(--line)',
                  margin: '0 4px', borderRadius: '1px',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
