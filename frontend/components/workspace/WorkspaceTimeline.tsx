'use client';

import { CheckIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface WorkspaceTimelineProps {
  project: any;
}

const MILESTONES = [
  { key: 'criado', label: 'Criado' },
  { key: 'dados', label: 'Dados' },
  { key: 'dimensionado', label: 'Dimensionado' },
  { key: 'cotado', label: 'Cotado' },
  { key: 'precificado', label: 'Precificado' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'fechado', label: 'Fechado' },
];

export function WorkspaceTimeline({ project }: WorkspaceTimelineProps) {
  const currentIndex = getMilestoneIndex(project?.status);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0, padding: '0 24px', height: 44,
      background: 'var(--ws-surface)', borderTop: '1px solid var(--ws-border)', flexShrink: 0,
      overflow: 'hidden',
    }}>
      {MILESTONES.map((m, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isUpcoming = i > currentIndex;

        return (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: isCompleted ? 'var(--ws-accent)' : 'var(--ws-border)',
                boxShadow: isCurrent ? '0 0 0 3px rgba(245, 158, 11, 0.2)' : 'none',
                transition: 'all 0.3s',
              }} />
              <span style={{
                fontSize: 11, fontWeight: isCurrent ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                color: isCompleted ? 'var(--ws-text)' : 'var(--ws-text-muted)',
                transition: 'color 0.3s',
              }}>
                {m.label}
              </span>
            </div>

            {i < MILESTONES.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: '0 4px', background: i < currentIndex ? 'var(--ws-accent)' : 'var(--ws-border)', opacity: i < currentIndex ? 0.5 : 1 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getMilestoneIndex(status?: string): number {
  const map: Record<string, number> = {
    draft: 0,
    client: 1,
    site: 1,
    consumption: 1,
    sizing: 2,
    quotes: 3,
    costs: 3,
    pricing: 4,
    payment: 4,
    review: 4,
    proposal: 5,
    closed_won: 6,
    closed_lost: 6,
  };
  return status ? map[status] ?? 0 : 0;
}
