'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Text } from '../primitives/Text';
import { Flex } from '../primitives/Flex';
import { Chip } from '../ui/Chip';
import { Badge } from '../ui/Badge';
import { ClientStep } from './steps/ClientStep';
import { SiteStep } from './steps/SiteStep';
import { ConsumptionStep } from './steps/ConsumptionStep';
import { SizingStep } from './steps/SizingStep';
import { QuoteStep } from './steps/QuoteStep';
import { CostsStep } from './steps/CostsStep';
import { PricingStep } from './steps/PricingStep';
import { PaymentStep } from './steps/PaymentStep';
import { ProposalStep } from './steps/ProposalStep';
import { formatBRL, formatPercent } from '../../lib/format';
import { api } from '../../lib/api';

const STEPS = [
  { key: 'client', label: 'Cliente' },
  { key: 'site', label: 'Local' },
  { key: 'consumption', label: 'Consumo' },
  { key: 'sizing', label: 'Dimensionamento' },
  { key: 'quotes', label: 'Cotações' },
  { key: 'costs', label: 'Custos' },
  { key: 'pricing', label: 'Precificação' },
  { key: 'payment', label: 'Pagamentos' },
  { key: 'proposal', label: 'Proposta' },
];

const STEP_MODULES: Record<string, string[]> = {
  client: ['clientName', 'clientDocument', 'clientPhone', 'clientEmail'],
  site: ['siteAddress', 'siteRoofType'],
  consumption: ['consumptionMonthlyKwh', 'consumptionTariff'],
  sizing: ['sizingPowerKwp', 'sizingGenerationKwh', 'sizingModuleQty'],
  quotes: ['supplierName'],
  costs: ['pricingEquipmentCost', 'pricingLaborCost'],
  pricing: ['pricingFinalPrice', 'pricingMarginPct'],
  payment: ['paymentValidityDays'],
};

function computeStepStatus(stepKey: string, data: Record<string, any>): 'complete' | 'incomplete' | 'pending' {
  const fields = STEP_MODULES[stepKey] || [];
  const values = fields.map(f => data[f]);
  const filled = values.filter(v => v !== undefined && v !== '' && v !== null && v !== 0).length;
  if (filled === 0) return 'pending';
  if (filled >= fields.length) return 'complete';
  return 'incomplete';
}

function StepStatusIcon({ status }: { status: string }) {
  if (status === 'complete') return <span style={{ color: 'var(--green)' }}>✓</span>;
  if (status === 'incomplete') return <span style={{ color: 'var(--warning)' }}>◐</span>;
  return <span style={{ color: 'var(--text-muted)' }}>○</span>;
}

export function ProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  const totalCost = (data.pricingEquipmentCost || 0) + (data.pricingLaborCost || 0)
    + (data.pricingProjectCost || 0) + (data.pricingFreightCost || 0)
    + (data.pricingTravelCost || 0) + (data.pricingCommission || 0)
    + (data.pricingTaxes || 0) + (data.pricingAdminCost || 0);

  const stepStatuses = STEPS.map(s => computeStepStatus(s.key, data));
  const currentStepStatus = stepStatuses[step];

  const canAdvance = () => {
    if (step === 0) return !!data.clientName;
    return true;
  };

  const saveStep = useCallback(async (currentData: Record<string, any>) => {
    if (!projectId) return;
    try {
      await api.patch(`/solar-project/${projectId}`, currentData);
    } catch (err) {
      console.error('Error saving step:', err);
    }
  }, [projectId]);

  const handleAdvance = async () => {
    if (step === 0 && !projectId) {
      setSaving(true);
      try {
        const project = await api.post<any>('/solar-project', data);
        setProjectId(project.id);
        setStep(1);
      } catch (err) {
        console.error('Error creating project:', err);
        alert('Erro ao criar projeto.');
      } finally {
        setSaving(false);
      }
    } else {
      if (projectId) await saveStep(data);
      setStep(Math.min(step + 1, STEPS.length - 1));
    }
  };

  const handleBack = async () => {
    if (projectId) await saveStep(data);
    setStep(Math.max(0, step - 1));
  };

  const handleDataChange = (d: Record<string, any>) => {
    setData(prev => ({ ...prev, ...d }));
  };

  const currentKey = STEPS[step].key;
  const prevKey = step > 0 ? STEPS[step - 1].key : null;

  return (
    <div>
      {/* ── Top summary bar ── */}
      {projectId && (
        <Flex gap={5} align="center" style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--line)', padding: '14px 24px', marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CLIENTE</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{data.clientName || '—'}</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--line)' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>POTÊNCIA</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{data.sizingPowerKwp ? `${data.sizingPowerKwp.toFixed(2)} kWp` : '—'}</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--line)' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>FORNECEDOR</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{data.supplierName || '—'}</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--line)' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PREÇO FINAL</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-dark)' }}>{data.pricingFinalPrice ? formatBRL(data.pricingFinalPrice) : '—'}</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--line)' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MARGEM</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{data.pricingMarginPct ? `${data.pricingMarginPct}%` : '—'}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Chip variant="default">
              {STEPS[step].label}
            </Chip>
          </div>
        </Flex>
      )}

      {/* ── Step progress with status ── */}
      <div style={{ marginBottom: '28px', overflowX: 'auto' }}>
        <Flex gap={2} align="center" style={{ minWidth: '700px' }}>
          {STEPS.map((s, i) => {
            const active = i === step;
            const status = computeStepStatus(s.key, data);
            const isClickable = i < step;

            return (
              <Flex key={s.key} align="center" gap={1} style={{ flex: 1 }}>
                <button
                  onClick={() => isClickable ? setStep(i) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                    borderRadius: 'var(--radius-lg)', border: 'none',
                    background: active ? 'var(--green-light)' : 'transparent',
                    cursor: isClickable ? 'pointer' : active ? 'default' : 'not-allowed',
                    transition: 'background 0.15s', flexShrink: 0,
                    fontWeight: active ? 700 : 500,
                    fontSize: '12px',
                    color: active ? 'var(--green-dark)' : status === 'complete' ? 'var(--green-dark)' : 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { if (isClickable && !active) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <StepStatusIcon status={status} />
                  {s.label}
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: '2px',
                    background: status === 'complete' ? 'var(--green)' : 'var(--line)',
                    borderRadius: '1px', margin: '0 2px',
                  }} />
                )}
              </Flex>
            );
          })}
        </Flex>
      </div>

      {/* ── Step content ── */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--line)', padding: '32px', marginBottom: '24px',
      }}>
        {step === 0 && <ClientStep data={data} onChange={handleDataChange} />}
        {step === 1 && <SiteStep data={data} onChange={handleDataChange} />}
        {step === 2 && <ConsumptionStep data={data} onChange={handleDataChange} />}
        {step === 3 && <SizingStep data={data} consumptionKwh={data.consumptionMonthlyKwh} onChange={handleDataChange} />}
        {step === 4 && <QuoteStep data={data} onChange={handleDataChange} projectId={projectId || undefined} />}
        {step === 5 && <CostsStep data={data} onChange={handleDataChange} />}
        {step === 6 && <PricingStep data={data} onChange={handleDataChange} totalCost={totalCost} />}
        {step === 7 && <PaymentStep data={data} onChange={handleDataChange} />}
        {step === 8 && <ProposalStep data={data} projectId={projectId || undefined} />}
      </div>

      {/* ── Step status badge ── */}
      <Flex justify="between" align="center" style={{ marginBottom: '16px' }}>
        <Badge variant={
          currentStepStatus === 'complete' ? 'success' :
          currentStepStatus === 'incomplete' ? 'warning' : 'info'
        }>
          {currentStepStatus === 'complete' ? 'Completo' :
           currentStepStatus === 'incomplete' ? 'Incompleto' : 'Pendente'}
        </Badge>
      </Flex>

      {/* ── Navigation ── */}
      <Flex justify="between">
        <Button variant="secondary" onClick={handleBack} disabled={step === 0}>
          Voltar
        </Button>
        <Flex gap={3}>
          {step > 0 && step < STEPS.length - 1 && (
            <Button variant="outline" size="sm" onClick={async () => {
              if (projectId) await saveStep(data);
            }}>
              Salvar Etapa
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="primary" loading={saving} onClick={handleAdvance} disabled={!canAdvance()}>
              {step === 0 ? 'Criar Projeto' : 'Avançar'}
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </div>
  );
}
