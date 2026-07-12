'use client';

import { BoltIcon, CurrencyDollarIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { StepCard, Field, MetricBadge } from './_shared';
import { formatBRL } from '../../../lib/format';

export function ConsumptionOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MetricBadge value={project.consumptionMonthlyKwh ? `${project.consumptionMonthlyKwh.toLocaleString('pt-BR')}` : '—'} label="kWh / mês" />
        <MetricBadge value={project.consumptionMonthlyBill ? formatBRL(project.consumptionMonthlyBill) : '—'} label="Conta mensal" />
        <MetricBadge value={project.consumptionTariff ? formatBRL(project.consumptionTariff) : '—'} label="Tarifa" />
      </div>

      <StepCard icon={<BoltIcon style={{ width: 16, height: 16 }} />} title="Consumo">
        <Field label="Consumo (kWh)" value={project.consumptionMonthlyKwh ? `${project.consumptionMonthlyKwh} kWh` : undefined} />
        <Field label="Valor da Conta" value={project.consumptionMonthlyBill ? formatBRL(project.consumptionMonthlyBill) : undefined} />
        <Field label="Tarifa" value={project.consumptionTariff ? formatBRL(project.consumptionTariff) : undefined} />
        <Field label="Demanda" value={project.consumptionDemand ? `${project.consumptionDemand} kW` : undefined} />
      </StepCard>

      <StepCard icon={<ChartBarIcon style={{ width: 16, height: 16 }} />} title="Perfil">
        <Field label="Modalidade" value={project.consumptionModality} />
        <Field label="Grupo" value={project.consumptionGroup} />
      </StepCard>

      {project.consumptionInvoices?.length > 0 && (
        <StepCard icon={<DocumentTextIcon style={{ width: 16, height: 16 }} />} title="Faturas">
          {project.consumptionInvoices.map((inv: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', gridColumn: 'span 2' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{inv.month}</span>
              <span>{inv.consumption} kWh · {formatBRL(inv.bill)}</span>
            </div>
          ))}
        </StepCard>
      )}
    </div>
  );
}
