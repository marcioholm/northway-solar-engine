'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { WorkspaceShell } from '../../../../components/workspace/WorkspaceShell';

type StepKey = 'client' | 'site' | 'consumption' | 'sizing' | 'quotes' | 'costs' | 'pricing' | 'payment' | 'documents' | 'proposal';

const STEP_FLOW: StepKey[] = ['client', 'site', 'consumption', 'sizing', 'quotes', 'costs', 'pricing', 'payment', 'documents', 'proposal'];

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepKey>('client');

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    setError(null);
    api.get<any>(`/solar-project/${params.id}`)
      .then(data => {
        setProject(data);
        setActiveStep(determineInitialStep(data));
      })
      .catch(() => setError('Erro ao carregar projeto'))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const stepStatuses = useMemo(() => {
    if (!project) return {} as Record<StepKey, 'completed' | 'current' | 'pending' | 'locked'>;
    const statuses: Record<StepKey, 'completed' | 'current' | 'pending' | 'locked'> = {} as any;
    let foundActive = false;
    for (const step of STEP_FLOW) {
      if (step === activeStep) {
        statuses[step] = 'current';
        foundActive = true;
      } else if (!foundActive) {
        statuses[step] = 'completed';
      } else {
        const hasData = hasStepData(step, project);
        statuses[step] = hasData ? 'completed' : 'pending';
      }
    }
    return statuses;
  }, [project, activeStep]);

  const handleStepChange = (step: StepKey) => {
    setActiveStep(step);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0B' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(245, 158, 11, 0.2)', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontSize: 13, fontWeight: 500, fontFamily: 'system-ui' }}>Carregando projeto...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#0A0A0B' }}>
        <p style={{ color: '#EF4444', fontSize: 15, fontFamily: 'system-ui' }}>{error}</p>
        <button onClick={() => router.back()} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#ccc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Voltar
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#0A0A0B' }}>
        <p style={{ color: '#999', fontSize: 15, fontFamily: 'system-ui' }}>Projeto não encontrado</p>
        <button onClick={() => router.push('/solar-project')} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#ccc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <WorkspaceShell
      project={project}
      activeStep={activeStep}
      stepStatuses={stepStatuses}
      onStepChange={handleStepChange}
      onProjectUpdate={setProject}
    />
  );
}

function determineInitialStep(project: any): StepKey {
  for (const step of STEP_FLOW) {
    if (!hasStepData(step, project)) return step;
  }
  return 'proposal';
}

function hasStepData(step: StepKey, project: any): boolean {
  switch (step) {
    case 'client': return !!(project.clientName);
    case 'site': return !!(project.siteAddress || project.siteLatitude);
    case 'consumption': return !!(project.consumptionMonthlyKwh);
    case 'sizing': return !!(project.sizingPowerKwp);
    case 'quotes': {
      const q = project.quotes;
      return Array.isArray(q) ? q.length > 0 : !!q;
    }
    case 'costs': return !!(project.pricingEquipmentCost);
    case 'pricing': return !!(project.pricingFinalPrice);
    case 'payment': return !!(project.paymentCashDiscount != null);
    case 'documents': return false;
    case 'proposal': {
      const p = project.proposals;
      return Array.isArray(p) ? p.length > 0 : !!p;
    }
    default: return false;
  }
}
