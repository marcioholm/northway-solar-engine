'use client';

import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

type StepKey = 'client' | 'site' | 'consumption' | 'sizing' | 'quotes' | 'costs' | 'pricing' | 'payment' | 'documents' | 'proposal';

const STEPS: { key: StepKey; label: string; subtitle: string }[] = [
  { key: 'client', label: 'Cliente', subtitle: 'Dados do cliente' },
  { key: 'site', label: 'Local', subtitle: 'Endereço e telhado' },
  { key: 'consumption', label: 'Consumo', subtitle: 'Histórico e tarifa' },
  { key: 'sizing', label: 'Dimensionamento', subtitle: 'Potência e produção' },
  { key: 'quotes', label: 'Cotações', subtitle: 'Fornecedores e preços' },
  { key: 'costs', label: 'Custos', subtitle: 'Equipamentos e serviços' },
  { key: 'pricing', label: 'Precificação', subtitle: 'Margem e preço final' },
  { key: 'payment', label: 'Pagamentos', subtitle: 'Condições e taxas' },
  { key: 'documents', label: 'Documentos', subtitle: 'ART e contratos' },
  { key: 'proposal', label: 'Proposta', subtitle: 'Visualização e envio' },
];

interface WorkspaceSidebarProps {
  activeStep: StepKey;
  stepStatuses: Record<StepKey, 'completed' | 'current' | 'pending' | 'locked'>;
  onStepChange: (step: StepKey) => void;
}

export function WorkspaceSidebar({ activeStep, stepStatuses, onStepChange }: WorkspaceSidebarProps) {
  return (
    <nav style={{
      width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)',
      padding: '16px 8px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ padding: '0 12px', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etapas do Projeto</p>
      </div>

      {STEPS.map((step, i) => {
        const status = stepStatuses[step.key] || 'pending';
        const isActive = step.key === activeStep;
        const isClickable = status === 'completed' || status === 'current';

        return (
          <button
            key={step.key}
            onClick={() => isClickable && onStepChange(step.key)}
            disabled={!isClickable}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)',
              border: 'none', width: '100%', textAlign: 'left', cursor: isClickable ? 'pointer' : 'default',
              fontFamily: 'inherit', transition: 'all 0.15s',
              background: isActive ? 'var(--green-bg)' : 'transparent',
              opacity: status === 'locked' ? 0.35 : 1,
            }}
            onMouseEnter={e => { if (isClickable && !isActive) e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.25s',
                background: status === 'completed' ? 'var(--green)' : isActive ? 'var(--green)' : 'var(--border)',
                color: status === 'completed' || isActive ? '#fff' : 'var(--text-muted)',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
              }}>
                {status === 'completed' ? (
                  <CheckIcon style={{ width: 12, height: 12, strokeWidth: 3 }} />
                ) : status === 'locked' ? (
                  <LockClosedIcon style={{ width: 11, height: 11 }} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              {isActive && (
                <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid var(--green)', opacity: 0.4, animation: 'pulse-ring 2s infinite' }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
              <div style={{
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--green)' : 'var(--text)',
                transition: 'color 0.15s',
              }}>
                {step.label}
              </div>
              {isActive && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                  {step.subtitle}
                </div>
              )}
            </div>
          </button>
        );
      })}

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </nav>
  );
}
