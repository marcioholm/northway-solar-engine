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
        <div key={i} style={{ height: 120, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent 0%, var(--green-bg) 50%, transparent 100%)', animation: 'shimmer 2s infinite' }} />
        </div>
      ))}
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }`}</style>
    </div>
  );
}

export function WorkspaceShell({ project, activeStep, stepStatuses, onStepChange, onProjectUpdate }: WorkspaceShellProps) {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const StepComponent = STEP_COMPONENTS[activeStep];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
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
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{STEP_LABELS[activeStep]}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {getStepSubtitle(activeStep)}
                </p>
              </div>
              <StepComponent project={project} onUpdate={onProjectUpdate} onStepChange={onStepChange} />
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
