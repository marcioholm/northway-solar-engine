'use client';

import { SunIcon, BoltIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { StepCard, Field, MetricBadge } from './_shared';

export function SizingOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MetricBadge value={project.sizingPowerKwp ? `${project.sizingPowerKwp.toFixed(2)}` : '—'} label="kWp" />
        <MetricBadge value={project.sizingGenerationKwh ? `${Math.round(project.sizingGenerationKwh).toLocaleString('pt-BR')}` : '—'} label="kWh / mês" />
        <MetricBadge value={project.sizingModuleQty ? `${project.sizingModuleQty}` : '—'} label="Módulos" />
      </div>

      <StepCard icon={<SunIcon style={{ width: 16, height: 16 }} />} title="Potência & Geração">
        <Field label="Potência" value={project.sizingPowerKwp ? `${project.sizingPowerKwp.toFixed(2)} kWp` : undefined} />
        <Field label="Geração" value={project.sizingGenerationKwh ? `${Math.round(project.sizingGenerationKwh)} kWh/mês` : undefined} />
        <Field label="Irradiação" value={project.sizingIrradiation ? `${project.sizingIrradiation} kWh/m²/dia` : undefined} />
      </StepCard>

      <StepCard icon={<BoltIcon style={{ width: 16, height: 16 }} />} title="Equipamentos">
        <Field label="Módulos" value={project.sizingModuleQty ? `${project.sizingModuleQty}x` : undefined} />
        <Field label="Inversores" value={project.sizingInverterQty ? `${project.sizingInverterQty}x` : undefined} />
      </StepCard>

      <StepCard icon={<ExclamationTriangleIcon style={{ width: 16, height: 16 }} />} title="Perdas">
        <Field label="Fator de Perda" value={project.sizingLossFactor ? `${project.sizingLossFactor}%` : undefined} />
      </StepCard>
    </div>
  );
}
