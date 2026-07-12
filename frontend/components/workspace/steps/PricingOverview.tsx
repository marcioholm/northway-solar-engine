'use client';

import { CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { StepCard, Field, MetricBadge } from './_shared';
import { formatBRL, formatPercent } from '../../../lib/format';

export function PricingOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  const finalPrice = Number(project.pricingFinalPrice) || 0;
  const marginPct = Number(project.pricingMarginPct) || 0;
  const minPrice = Number(project.pricingMinPrice) || 0;
  const recPrice = Number(project.pricingRecommendedPrice) || 0;
  const marginValue = Number(project.pricingMarginValue) || Number(project.pricingProfit) || 0;
  const effectiveMargin = Number(project.pricingEffectiveMarginPct) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <MetricBadge value={finalPrice ? formatBRL(finalPrice) : '—'} label="Preço Final" />
        <MetricBadge value={marginPct ? formatPercent(marginPct) : '—'} label="Margem" />
        <MetricBadge value={marginValue ? formatBRL(marginValue) : '—'} label="Lucro" />
      </div>

      <StepCard icon={<CurrencyDollarIcon style={{ width: 16, height: 16 }} />} title="Preços">
        <Field label="Preço Final" value={finalPrice ? formatBRL(finalPrice) : undefined} />
        <Field label="Preço Mínimo" value={minPrice ? formatBRL(minPrice) : undefined} />
        <Field label="Preço Recomendado" value={recPrice ? formatBRL(recPrice) : undefined} />
      </StepCard>

      <StepCard icon={<ChartBarIcon style={{ width: 16, height: 16 }} />} title="Margem">
        <Field label="Margem Desejada" value={marginPct ? formatPercent(marginPct) : undefined} />
        <Field label="Margem Efetiva" value={effectiveMargin ? formatPercent(effectiveMargin) : undefined} />
        <Field label="Margem Mínima" value={project.pricingMinMarginPct ? formatPercent(project.pricingMinMarginPct) : undefined} />
        <Field label="Margem Recomendada" value={project.pricingRecommendedMarginPct ? formatPercent(project.pricingRecommendedMarginPct) : undefined} />
      </StepCard>
    </div>
  );
}
