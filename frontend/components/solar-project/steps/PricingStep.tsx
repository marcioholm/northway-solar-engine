'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Card } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { formatBRL, formatPercent } from '../../../lib/format';
import { api } from '../../../lib/api';

interface PricingResult {
  totalCost: number;
  minPrice: number;
  recommendedPrice: number;
  finalPrice: number;
  effectiveMarginPct: number;
  profit: number;
  appliedMarginPct: number;
  operationalCostTotal: number;
  breakdown: Record<string, number>;
}

const COST_FIELDS = [
  'pricingEquipmentCost', 'pricingProjectCost', 'pricingArtCost',
  'pricingInstallationCost', 'pricingHotelCost', 'pricingFreightCost',
  'pricingFoodCost', 'pricingTravelCost', 'pricingTollCost',
  'pricingCommission', 'pricingCraneCost', 'pricingThirdPartiesCost',
  'pricingAdminCost', 'pricingTaxes', 'pricingOtherCost',
];

export function PricingStep({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const buildInput = () => {
    const input: Record<string, number> = {};
    for (const field of COST_FIELDS) {
      const key = field.replace('pricing', '').replace(/^[A-Z]/, c => c.toLowerCase());
      input[key === 'equipmentCost' ? 'equipmentCost' : `cost${field.replace('pricing', '')}`] = data[field] || 0;
    }
    input.marginPct = data.pricingMarginPct || 0;
    input.minMarginPct = data.pricingMinMarginPct || 15;
    input.recommendedMarginPct = data.pricingRecommendedMarginPct || 25;
    input.commissionPct = data.pricingCommissionPct || 0;
    return input;
  };

  const runCalculation = async () => {
    setLoading(true);
    try {
      const input = buildInput();
      if (input.equipmentCost <= 0) return;
      const res = await api.post<PricingResult>('/pricing-engine/calculate', input);
      setResult(res);
      onChange({
        pricingTotalCost: res.totalCost,
        pricingMinPrice: res.minPrice,
        pricingRecommendedPrice: res.recommendedPrice,
        pricingFinalPrice: res.finalPrice,
        pricingProfit: res.profit,
        pricingEffectiveMarginPct: res.effectiveMarginPct,
      });
    } catch {
      // silently fail — engine may not be available during input
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runCalculation, 600);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data.pricingMarginPct, data.pricingEquipmentCost, ...COST_FIELDS.map(f => data[f])]);

  const cost = result?.totalCost || 0;
  const finalPrice = result?.finalPrice || 0;
  const marginPct = result?.effectiveMarginPct || 0;
  const profit = result?.profit || 0;
  const minPrice = result?.minPrice;
  const recPrice = result?.recommendedPrice;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Precificação</Text>
        <Text variant="body" color="secondary">Ajuste a margem e veja os preços calculados pelo Pricing Engine.</Text>
      </div>

      {/* Results card */}
      {(cost > 0 || loading) && (
        <Flex gap={4} style={{
          background: 'var(--surface-muted)', padding: '20px 24px', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--line)',
        }}>
          {loading ? (
            <Skeleton width="100%" height="60px" />
          ) : (
            <>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>CUSTO TOTAL</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{formatBRL(cost)}</div>
              </div>
              <div style={{ width: '1px', height: '44px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PREÇO MÍNIMO</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>{minPrice ? formatBRL(minPrice) : '—'}</div>
              </div>
              <div style={{ width: '1px', height: '44px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PREÇO RECOMENDADO</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--blue)' }}>{recPrice ? formatBRL(recPrice) : '—'}</div>
              </div>
              <div style={{ width: '1px', height: '44px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PREÇO FINAL</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)' }}>{formatBRL(finalPrice)}</div>
              </div>
              <div style={{ width: '1px', height: '44px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>MARGEM EFETIVA</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: marginPct >= 20 ? 'var(--green-dark)' : 'var(--danger)' }}>
                  {formatPercent(marginPct)}
                </div>
              </div>
              <div style={{ width: '1px', height: '44px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>LUCRO</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)' }}>{formatBRL(profit)}</div>
              </div>
            </>
          )}
        </Flex>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input
          label="Margem Desejada (%)"
          variant="number"
          value={data.pricingMarginPct ?? ''}
          onChange={v => setNumber('pricingMarginPct', v)}
        />
        <Input
          label="Margem Mínima (%)"
          variant="number"
          value={data.pricingMinMarginPct ?? 15}
          onChange={v => setNumber('pricingMinMarginPct', v)}
        />
        <Input
          label="Margem Recomendada (%)"
          variant="number"
          value={data.pricingRecommendedMarginPct ?? 25}
          onChange={v => setNumber('pricingRecommendedMarginPct', v)}
        />
      </div>

      {/* Reference */}
      {result && (
        <Card padding="md">
          <Stack gap={2}>
            <Text variant="body-bold">Resumo da Precificação</Text>
            <Flex justify="between"><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Custo Total</span><span style={{ fontWeight: 700 }}>{formatBRL(result.totalCost)}</span></Flex>
            <Flex justify="between"><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Preço Mínimo ({result.appliedMarginPct === (data.pricingMinMarginPct || 15) ? 'atual' : `${data.pricingMinMarginPct || 15}%`})</span><span style={{ fontWeight: 700 }}>{formatBRL(result.minPrice)}</span></Flex>
            <Flex justify="between"><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Preço Recomendado ({data.pricingRecommendedMarginPct || 25}%)</span><span style={{ fontWeight: 700, color: 'var(--blue)' }}>{formatBRL(result.recommendedPrice)}</span></Flex>
            <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0' }} />
            <Flex justify="between"><span style={{ fontSize: '13px', fontWeight: 600 }}>Preço Final</span><span style={{ fontWeight: 900, fontSize: '18px', color: 'var(--green-dark)' }}>{formatBRL(result.finalPrice)}</span></Flex>
            <Flex justify="between"><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Margem Efetiva</span><span style={{ fontWeight: 700, color: marginPct >= 20 ? 'var(--green-dark)' : 'var(--danger)' }}>{formatPercent(result.effectiveMarginPct)}</span></Flex>
            <Flex justify="between"><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Lucro</span><span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{formatBRL(result.profit)}</span></Flex>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
