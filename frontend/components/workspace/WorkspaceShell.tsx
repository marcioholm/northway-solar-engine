'use client';

import { useState, Suspense, lazy } from 'react';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceRightPanel } from './WorkspaceRightPanel';
import { WorkspaceTimeline } from './WorkspaceTimeline';

type StepKey = 'client' | 'site' | 'consumption' | 'sizing' | 'quotes' | 'costs' | 'pricing' | 'payment' | 'documents' | 'proposal';

interface WorkspaceShellProps {
  project: any;
  activeStep: StepKey;
  stepStatuses: Record<StepKey, 'completed' | 'current' | 'pending' | 'locked'>;
  onStepChange: (step: StepKey) => void;
  onProjectUpdate: (p: any) => void;
}

const STEP_LABELS: Record<StepKey, string> = {
  client: 'Cliente',
  site: 'Local',
  consumption: 'Consumo',
  sizing: 'Dimensionamento',
  quotes: 'Cotações',
  costs: 'Custos',
  pricing: 'Precificação',
  payment: 'Pagamentos',
  documents: 'Documentos',
  proposal: 'Proposta',
};

const STEP_COMPONENTS: Record<StepKey, any> = {
  client: lazy(() => import('./steps/ClientOverview').then(m => ({ default: m.ClientOverview }))),
  site: lazy(() => import('./steps/SiteOverview').then(m => ({ default: m.SiteOverview }))),
  consumption: lazy(() => import('./steps/ConsumptionOverview').then(m => ({ default: m.ConsumptionOverview }))),
  sizing: lazy(() => import('./steps/SizingOverview').then(m => ({ default: m.SizingOverview }))),
  quotes: lazy(() => import('./steps/QuotesOverview').then(m => ({ default: m.QuotesOverview }))),
  costs: lazy(() => import('./steps/CostsOverview').then(m => ({ default: m.CostsOverview }))),
  pricing: lazy(() => import('./steps/PricingOverview').then(m => ({ default: m.PricingOverview }))),
  payment: lazy(() => import('./steps/PaymentOverview').then(m => ({ default: m.PaymentOverview }))),
  documents: lazy(() => import('./steps/DocumentsOverview').then(m => ({ default: m.DocumentsOverview }))),
  proposal: lazy(() => import('./steps/ProposalOverview').then(m => ({ default: m.ProposalOverview }))),
};

function StepSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 120, borderRadius: 12, background: 'linear-gradient(135deg, #1A1A1E 0%, #1E1E22 100%)', border: '1px solid #2A2A2E', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.03) 50%, transparent 100%)', animation: 'shimmer 2s infinite' }} />
        </div>
      ))}
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }`}</style>
    </div>
  );
}

const SHELL_STYLES = `
  .workspace-shell {
    --ws-bg: #0A0A0B;
    --ws-surface: #121214;
    --ws-surface-raised: #1A1A1E;
    --ws-surface-hover: #222226;
    --ws-border: #2A2A2E;
    --ws-border-light: #333338;
    --ws-text: #EDEDEF;
    --ws-text-secondary: #888891;
    --ws-text-muted: #5C5C66;
    --ws-accent: #F59E0B;
    --ws-accent-glow: rgba(245, 158, 11, 0.15);
    --ws-green: #22C55E;
    --ws-green-bg: rgba(34, 197, 94, 0.1);
    --ws-red: #EF4444;
    --ws-red-bg: rgba(239, 68, 68, 0.1);
    --ws-blue: #3B82F6;
    --ws-blue-bg: rgba(59, 130, 246, 0.1);
    --ws-radius: 10px;
    --ws-radius-lg: 14px;
    --ws-radius-xl: 18px;
    --ws-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
    --ws-shadow-lg: 0 4px 16px rgba(0,0,0,0.4);
    --ws-shadow-glow: 0 0 20px rgba(245, 158, 11, 0.08);
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

export function WorkspaceShell({ project, activeStep, stepStatuses, onStepChange, onProjectUpdate }: WorkspaceShellProps) {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const StepComponent = STEP_COMPONENTS[activeStep];

  return (
    <div className="workspace-shell" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', color: 'var(--ws-text)', fontFamily: 'system-ui', overflow: 'hidden' }}>
      <style>{SHELL_STYLES}</style>

      <WorkspaceHeader
        project={project}
        activeStep={activeStep}
        stepLabel={STEP_LABELS[activeStep]}
        onTogglePanel={() => setRightPanelOpen(o => !o)}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <WorkspaceSidebar
          activeStep={activeStep}
          stepStatuses={stepStatuses}
          onStepChange={onStepChange}
        />

        <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px', scrollBehavior: 'smooth' }}>
          <Suspense fallback={<StepSkeleton />}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--ws-text)', letterSpacing: '-0.01em' }}>{STEP_LABELS[activeStep]}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ws-text-secondary)' }}>
                  {getStepSubtitle(activeStep)}
                </p>
              </div>
              <StepComponent project={project} onUpdate={onProjectUpdate} />
            </div>
          </Suspense>
        </main>

        {rightPanelOpen && (
          <WorkspaceRightPanel project={project} activeStep={activeStep} />
        )}
      </div>

      <WorkspaceTimeline project={project} />
    </div>
  );
}

function getStepSubtitle(step: StepKey): string {
  switch (step) {
    case 'client': return 'Informações do cliente e dados de contato';
    case 'site': return 'Endereço, localização e características do telhado';
    case 'consumption': return 'Histórico de consumo, tarifa e perfil energético';
    case 'sizing': return 'Potência do sistema, módulos, inversores e produção';
    case 'quotes': return 'Cotações de fornecedores e comparação de preços';
    case 'costs': return 'Equipamentos, serviços, frete e demais custos operacionais';
    case 'pricing': return 'Margem, preço mínimo, recomendado e final';
    case 'payment': return 'Condições de pagamento, descontos e taxas';
    case 'documents': return 'ART, contratos, manuais e anexos técnicos';
    case 'proposal': return 'Visualização, versões e compartilhamento da proposta';
    default: return '';
  }
}
