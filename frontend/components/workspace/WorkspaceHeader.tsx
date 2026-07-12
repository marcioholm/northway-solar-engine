'use client';

import { ChevronLeftIcon, DocumentTextIcon, ShareIcon, ClockIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatBRL, formatPercent } from '../../lib/format';

type StepKey = 'client' | 'site' | 'consumption' | 'sizing' | 'quotes' | 'costs' | 'pricing' | 'payment' | 'documents' | 'proposal';

interface WorkspaceHeaderProps {
  project: any;
  activeStep: StepKey;
  stepLabel: string;
  onTogglePanel: () => void;
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Rascunho', color: 'var(--text-muted)', bg: 'var(--surface-muted)' },
  client: { label: 'Cliente', color: 'var(--info)', bg: 'rgba(59,130,246,0.1)' },
  site: { label: 'Local', color: 'var(--info)', bg: 'rgba(59,130,246,0.1)' },
  consumption: { label: 'Consumo', color: 'var(--info)', bg: 'rgba(59,130,246,0.1)' },
  sizing: { label: 'Dimensionamento', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  quotes: { label: 'Cotações', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  costs: { label: 'Custos', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  pricing: { label: 'Precificação', color: 'var(--success)', bg: 'rgba(12,175,94,0.1)' },
  payment: { label: 'Pagamentos', color: 'var(--success)', bg: 'rgba(12,175,94,0.1)' },
  review: { label: 'Revisão', color: 'var(--success)', bg: 'rgba(12,175,94,0.1)' },
  proposal: { label: 'Proposta', color: 'var(--green)', bg: 'var(--green-bg)' },
  closed_won: { label: 'Ganho', color: 'var(--green)', bg: 'var(--green-bg)' },
  closed_lost: { label: 'Perdido', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
};

export function WorkspaceHeader({ project, activeStep, stepLabel, onTogglePanel }: WorkspaceHeaderProps) {
  const router = useRouter();
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.draft;

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', height: 56,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <button
        onClick={() => router.push('/solar-project')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <ChevronLeftIcon style={{ width: 18, height: 18 }} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.clientName || 'Projeto sem nome'}
        </h1>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.label}
        </span>

        <span style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
          {project.consultantName && (
            <span>{project.consultantName}</span>
          )}
          {project.clientCity && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />
              <span>{project.clientCity}{project.clientState ? ` - ${project.clientState}` : ''}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12, borderRight: '1px solid var(--border)' }}>
          {project.sizingPowerKwp && (
            <Metric value={`${project.sizingPowerKwp.toFixed(2)}`} unit="kWp" />
          )}
          {project.pricingFinalPrice && (
            <Metric value={formatBRL(Number(project.pricingFinalPrice))} />
          )}
          {project.pricingMarginPct && (
            <Metric value={formatPercent(project.pricingMarginPct)} />
          )}
        </div>

        <button style={btnStyle} title="Salvar"><DocumentTextIcon style={{ width: 16, height: 16 }} /><span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600 }}>Salvar</span></button>
        <button style={btnStyle} title="Compartilhar"><ShareIcon style={{ width: 16, height: 16 }} /></button>
        <button style={btnStyle} title="Histórico"><ClockIcon style={{ width: 16, height: 16 }} /></button>
        <button onClick={onTogglePanel} style={{ ...btnStyle, color: 'var(--text-muted)' }}>
          <EllipsisHorizontalIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </header>
  );
}

function Metric({ value, unit }: { value: string; unit?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {unit && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
};
