'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { formatBRL, formatPercent } from '../../../lib/format';

interface PricingData {
  pricingEquipmentCost: number;
  pricingLaborCost: number;
  pricingProjectCost: number;
  pricingFreightCost: number;
  pricingTravelCost: number;
  pricingCommission: number;
  pricingTaxes: number;
  pricingAdminCost: number;
  pricingMarginPct: number;
  pricingMarginValue: number;
  pricingMinPrice: number;
  pricingFinalPrice: number;
  pricingDiscountPct: number;
}

export function PricingStep({ data, onChange }: { data: Partial<PricingData>; onChange: (d: Partial<PricingData>) => void }) {
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const equipmentCost = data.pricingEquipmentCost || 0;
  const laborCost = data.pricingLaborCost || 0;
  const projectCost = data.pricingProjectCost || 0;
  const freightCost = data.pricingFreightCost || 0;
  const travelCost = data.pricingTravelCost || 0;
  const commission = data.pricingCommission || 0;
  const taxes = data.pricingTaxes || 0;
  const adminCost = data.pricingAdminCost || 0;
  const totalCost = equipmentCost + laborCost + projectCost + freightCost + travelCost + commission + taxes + adminCost;
  const finalPrice = data.pricingFinalPrice || 0;
  const effectiveMargin = finalPrice > 0 ? ((finalPrice - totalCost) / finalPrice * 100) : 0;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Precificação</Text>
        <Text variant="body" color="secondary">Custos e margem do projeto.</Text>
      </div>

      {/* Cost Summary */}
      <Flex gap={4} style={{
        background: 'var(--surface-muted)', padding: '16px 20px', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--line)',
      }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>CUSTO TOTAL</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)' }}>{formatBRL(totalCost)}</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'var(--line)' }} />
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>PREÇO FINAL</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-dark)' }}>{formatBRL(finalPrice)}</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'var(--line)' }} />
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>MARGEM</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: effectiveMargin >= 20 ? 'var(--green-dark)' : 'var(--danger)' }}>
            {formatPercent(effectiveMargin)}
          </div>
        </div>
      </Flex>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Custo Equipamentos (R$)" variant="number" value={data.pricingEquipmentCost ?? ''} onChange={v => setNumber('pricingEquipmentCost', v)} />
        <Input label="Custo Mão de Obra (R$)" variant="number" value={data.pricingLaborCost ?? ''} onChange={v => setNumber('pricingLaborCost', v)} />
        <Input label="Custo Projeto (R$)" variant="number" value={data.pricingProjectCost ?? ''} onChange={v => setNumber('pricingProjectCost', v)} />
        <Input label="Custo Frete (R$)" variant="number" value={data.pricingFreightCost ?? ''} onChange={v => setNumber('pricingFreightCost', v)} />
        <Input label="Custo Viagem (R$)" variant="number" value={data.pricingTravelCost ?? ''} onChange={v => setNumber('pricingTravelCost', v)} />
        <Input label="Comissão (R$)" variant="number" value={data.pricingCommission ?? ''} onChange={v => setNumber('pricingCommission', v)} />
        <Input label="Impostos (R$)" variant="number" value={data.pricingTaxes ?? ''} onChange={v => setNumber('pricingTaxes', v)} />
        <Input label="Custo Administrativo (R$)" variant="number" value={data.pricingAdminCost ?? ''} onChange={v => setNumber('pricingAdminCost', v)} />
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
        <Text variant="h3" style={{ marginBottom: '12px' }}>Margem e Preço Final</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Margem (%)" variant="number" value={data.pricingMarginPct ?? ''} onChange={v => setNumber('pricingMarginPct', v)} />
          <Input label="Valor Margem (R$)" variant="number" value={data.pricingMarginValue ?? ''} onChange={v => setNumber('pricingMarginValue', v)} />
          <Input label="Preço Mínimo (R$)" variant="number" value={data.pricingMinPrice ?? ''} onChange={v => setNumber('pricingMinPrice', v)} />
          <Input label="Preço Final (R$)" variant="number" value={data.pricingFinalPrice ?? ''} onChange={v => setNumber('pricingFinalPrice', v)} />
          <Input label="Desconto (%)" variant="number" value={data.pricingDiscountPct ?? ''} onChange={v => setNumber('pricingDiscountPct', v)} />
        </div>
      </div>
    </Stack>
  );
}
