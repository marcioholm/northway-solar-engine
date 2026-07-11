'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Card } from '../../ui/Card';
import { formatBRL, formatPercent } from '../../../lib/format';

interface PricingData {
  pricingMarginPct: number;
  pricingMarginValue: number;
  pricingMinPrice: number;
  pricingFinalPrice: number;
  pricingDiscountPct: number;
  // read-only cost total from previous step
  _totalCost?: number;
}

export function PricingStep({ data, onChange, totalCost }: { data: Partial<PricingData>; onChange: (d: Partial<PricingData>) => void; totalCost?: number }) {
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const cost = totalCost || 0;
  const finalPrice = data.pricingFinalPrice || 0;
  const marginPct = data.pricingMarginPct || 0;
  const marginValue = data.pricingMarginValue || 0;
  const effectiveMargin = finalPrice > 0 ? ((finalPrice - cost) / finalPrice * 100) : 0;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Precificação</Text>
        <Text variant="body" color="secondary">Defina a margem e o preço final do projeto.</Text>
      </div>

      {cost > 0 && (
        <Flex gap={4} style={{
          background: 'var(--surface-muted)', padding: '16px 20px', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--line)',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>CUSTO TOTAL</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text)' }}>{formatBRL(cost)}</div>
          </div>
          {finalPrice > 0 && (
            <>
              <div style={{ width: '1px', height: '40px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PREÇO FINAL</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--green-dark)' }}>{formatBRL(finalPrice)}</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--line)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>MARGEM</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: effectiveMargin >= 20 ? 'var(--green-dark)' : 'var(--danger)' }}>
                  {formatPercent(effectiveMargin)}
                </div>
              </div>
            </>
          )}
        </Flex>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Margem (%)" variant="number" value={data.pricingMarginPct ?? ''} onChange={v => setNumber('pricingMarginPct', v)} />
        <Input label="Valor Margem (R$)" variant="number" value={data.pricingMarginValue ?? ''} onChange={v => setNumber('pricingMarginValue', v)} />
        <Input label="Preço Mínimo (R$)" variant="number" value={data.pricingMinPrice ?? ''} onChange={v => setNumber('pricingMinPrice', v)} />
        <Input label="Preço Final (R$)" variant="number" value={data.pricingFinalPrice ?? ''} onChange={v => setNumber('pricingFinalPrice', v)} />
        <Input label="Desconto (%)" variant="number" value={data.pricingDiscountPct ?? ''} onChange={v => setNumber('pricingDiscountPct', v)} />
      </div>
    </Stack>
  );
}
