'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Text } from '../primitives/Text';
import { Flex } from '../primitives/Flex';
import { ClientStep } from './steps/ClientStep';
import { SiteStep } from './steps/SiteStep';
import { ConsumptionStep } from './steps/ConsumptionStep';
import { SizingStep } from './steps/SizingStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { PricingStep } from './steps/PricingStep';
import { ReviewStep } from './steps/ReviewStep';
import { api } from '../../lib/api';

const STEPS = ['Cliente', 'Local', 'Consumo', 'Dimensionamento', 'Equipamentos', 'Precificação', 'Revisão'];

interface ProjectData {
  clientName?: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientCity?: string;
  clientState?: string;
  clientZipcode?: string;
  clientUtility?: string;
  clientClass?: string;
  clientTariffGroup?: string;
  clientModality?: string;
  consultantName?: string;
  siteAddress?: string;
  siteZipcode?: string;
  siteLatitude?: number;
  siteLongitude?: number;
  siteRoofType?: string;
  siteInclination?: number;
  siteAzimuth?: number;
  consumptionMonthlyKwh?: number;
  consumptionMonthlyBill?: number;
  consumptionTariff?: number;
  consumptionDemand?: number;
  consumptionModality?: string;
  consumptionGroup?: string;
  consumptionInvoices?: Array<{ month: string; consumption: number; bill: number }>;
  sizingPowerKwp?: number;
  sizingGenerationKwh?: number;
  sizingIrradiation?: number;
  sizingLossFactor?: number;
  sizingModuleQty?: number;
  sizingInverterQty?: number;
  sizingObservations?: string;
  equipmentModules?: Array<any>;
  equipmentInverters?: Array<any>;
  pricingEquipmentCost?: number;
  pricingLaborCost?: number;
  pricingProjectCost?: number;
  pricingFreightCost?: number;
  pricingTravelCost?: number;
  pricingCommission?: number;
  pricingTaxes?: number;
  pricingAdminCost?: number;
  pricingMarginPct?: number;
  pricingMarginValue?: number;
  pricingMinPrice?: number;
  pricingFinalPrice?: number;
  pricingDiscountPct?: number;
}

export function ProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProjectData>({});

  const canAdvance = () => {
    if (step === 0) return !!data.clientName;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const project = await api.post<any>('/solar-project', data);
      router.push(`/solar-project/${project.id}`);
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Erro ao salvar projeto. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: '32px' }}>
        <Flex gap={3} align="center" style={{ marginBottom: '8px' }}>
          {STEPS.map((label, i) => (
            <Flex key={i} align="center" gap={2} style={{ flex: 1 }}>
              <div
                onClick={() => i < step ? setStep(i) : undefined}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: i <= step ? 'var(--green)' : 'var(--line)',
                  color: i <= step ? '#fff' : 'var(--text-muted)',
                  display: 'grid', placeItems: 'center',
                  fontSize: '12px', fontWeight: 800, flexShrink: 0,
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                {i + 1}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: i === step ? 700 : 500,
                color: i <= step ? 'var(--text)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', marginLeft: '4px',
                  background: i < step ? 'var(--green)' : 'var(--line)',
                  borderRadius: '1px',
                }} />
              )}
            </Flex>
          ))}
        </Flex>
      </div>

      {/* Step content */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--line)', padding: '32px', marginBottom: '24px',
      }}>
        {step === 0 && <ClientStep data={data} onChange={d => setData({ ...data, ...d })} />}
        {step === 1 && <SiteStep data={data} onChange={d => setData({ ...data, ...d })} />}
        {step === 2 && <ConsumptionStep data={data} onChange={d => setData({ ...data, ...d })} />}
        {step === 3 && <SizingStep data={data} consumptionKwh={data.consumptionMonthlyKwh} onChange={d => setData({ ...data, ...d })} />}
        {step === 4 && <EquipmentStep data={data} onChange={d => setData({ ...data, ...d })} />}
        {step === 5 && <PricingStep data={data} onChange={d => setData({ ...data, ...d })} />}
        {step === 6 && <ReviewStep data={data} />}
      </div>

      {/* Navigation */}
      <Flex justify="between">
        <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
            Avançar
          </Button>
        ) : (
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Salvar Projeto
          </Button>
        )}
      </Flex>
    </div>
  );
}
