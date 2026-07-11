'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { formatBRL } from '../../../lib/format';

interface CostsData {
  pricingEquipmentCost: number;
  pricingLaborCost: number;
  pricingProjectCost: number;
  pricingFreightCost: number;
  pricingTravelCost: number;
  pricingCommission: number;
  pricingTaxes: number;
  pricingAdminCost: number;
}

export function CostsStep({ data, onChange }: { data: Partial<CostsData>; onChange: (d: Partial<CostsData>) => void }) {
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

  const costItems = [
    { label: 'Equipamentos', key: 'pricingEquipmentCost', value: equipmentCost },
    { label: 'Mão de Obra', key: 'pricingLaborCost', value: laborCost },
    { label: 'Projeto', key: 'pricingProjectCost', value: projectCost },
    { label: 'Frete', key: 'pricingFreightCost', value: freightCost },
    { label: 'Viagem', key: 'pricingTravelCost', value: travelCost },
    { label: 'Comissão', key: 'pricingCommission', value: commission },
    { label: 'Impostos', key: 'pricingTaxes', value: taxes },
    { label: 'Administrativo', key: 'pricingAdminCost', value: adminCost },
  ];

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Custos</Text>
        <Text variant="body" color="secondary">Todos os custos envolvidos no projeto.</Text>
      </div>

      <Flex gap={4} style={{
        background: 'var(--surface-muted)', padding: '20px 24px', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--line)',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>CUSTO TOTAL</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text)' }}>{formatBRL(totalCost)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginLeft: '24px', flex: 1 }}>
          {costItems.map(item => (
            <Flex key={item.key} justify="between">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatBRL(item.value)}</span>
            </Flex>
          ))}
        </div>
      </Flex>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {costItems.map(item => (
          <Input
            key={item.key}
            label={`${item.label} (R$)`}
            variant="number"
            value={item.value || ''}
            onChange={v => setNumber(item.key, v)}
          />
        ))}
      </div>
    </Stack>
  );
}
