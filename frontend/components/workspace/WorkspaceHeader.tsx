'use client';

import { ChevronLeftIcon, DocumentTextIcon, ShareIcon, ClockIcon, EllipsisHorizontalIcon, SunIcon } from '@heroicons/react/24/outline';
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
  draft: { label: 'Rascunho', color: '#A0A0A8', bg: 'rgba(160,160,168,0.1)' },
  client: { label: 'Cliente', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  site: { label: 'Local', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  consumption: { label: 'Consumo', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  sizing: { label: 'Dimensionamento', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  quotes: { label: 'Cotações', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  costs: { label: 'Custos', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  pricing: { label: 'Precificação', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  payment: { label: 'Pagamentos', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  review: { label: 'Revisão', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  proposal: { label: 'Proposta', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  closed_won: { label: 'Ganho', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  closed_lost: { label: 'Perdido', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
};

export function WorkspaceHeader({ project, activeStep, stepLabel, onTogglePanel }: WorkspaceHeaderProps) {
  const router = useRouter();
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.draft;

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', height: 56,
      background: 'var(--ws-surface)', borderBottom: '1px solid var(--ws-border)',
      flexShrink: 0, WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
    }}>
      <button
        onClick={() => router.push('/solar-project')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--ws-text-secondary)', cursor: 'pointer', fontSize: 16, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--ws-surface-hover)'; e.currentTarget.style.color = 'var(--ws-text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ws-text-secondary)'; }}
      >
        <ChevronLeftIcon style={{ width: 18, height: 18 }} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <SunIcon style={{ width: 16, height: 16, color: 'var(--ws-accent)' }} />
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ws-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.clientName || 'Projeto sem nome'}
        </h1>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.label}
        </span>

        <span style={{ width: 1, height: 20, background: 'var(--ws-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--ws-text-secondary)' }}>
          {project.consultantName && (
            <span>{project.consultantName}</span>
          )}
          {project.clientCity && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ws-text-muted)' }} />
              <span>{project.clientCity}{project.clientState ? ` - ${project.clientState}` : ''}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12, borderRight: '1px solid var(--ws-border)' }}>
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
        <button onClick={onTogglePanel} style={{ ...btnStyle, color: 'var(--ws-text-muted)' }}>
          <EllipsisHorizontalIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </header>
  );
}

function Metric({ value, unit }: { value: string; unit?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {unit && <span style={{ fontSize: 10, color: 'var(--ws-text-muted)', fontWeight: 500 }}>{unit}</span>}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--ws-border)',
  background: 'transparent', color: 'var(--ws-text-secondary)', fontSize: 12, cursor: 'pointer',
  fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
};
