'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { formatBRL } from '../../../lib/format';

const GROUP_OPERATIONAL = [
  { label: 'Projeto', key: 'pricingProjectCost' },
  { label: 'ART', key: 'pricingArtCost' },
  { label: 'Instalação', key: 'pricingInstallationCost' },
  { label: 'Hotel', key: 'pricingHotelCost' },
  { label: 'Frete', key: 'pricingFreightCost' },
  { label: 'Alimentação', key: 'pricingFoodCost' },
  { label: 'Deslocamento', key: 'pricingTravelCost' },
  { label: 'Pedágio', key: 'pricingTollCost' },
  { label: 'Comissão', key: 'pricingCommission' },
  { label: 'Guindaste', key: 'pricingCraneCost' },
  { label: 'Terceiros', key: 'pricingThirdPartiesCost' },
  { label: 'Administrativo', key: 'pricingAdminCost' },
  { label: 'Impostos', key: 'pricingTaxes' },
  { label: 'Outros', key: 'pricingOtherCost' },
];

export function CostsStep({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const equipmentCost = data.pricingEquipmentCost || 0;
  const operationalCosts = GROUP_OPERATIONAL.reduce((acc, { key }) => {
    acc[key] = data[key] || 0;
    return acc;
  }, {} as Record<string, number>);
  const operationalTotal = Object.values(operationalCosts).reduce((a, b) => a + b, 0);
  const totalCost = equipmentCost + operationalTotal;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Custos Operacionais</Text>
        <Text variant="body" color="secondary">Equipamentos (da cotação) + custos operacionais do projeto.</Text>
      </div>

      {/* Summary */}
      <Flex gap={4} style={{
        background: 'var(--surface-muted)', padding: '20px 24px', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--line)',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>CUSTO TOTAL</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text)' }}>{formatBRL(totalCost)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Equip.: {formatBRL(equipmentCost)} + Operac.: {formatBRL(operationalTotal)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', marginLeft: '24px', flex: 1, alignContent: 'start' }}>
          <Flex justify="between">
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Equipamentos</span>
            <span style={{ fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatBRL(equipmentCost)}</span>
          </Flex>
          <div style={{ borderTop: '1px solid var(--line)', gridColumn: '1 / -1', margin: '2px 0' }} />
          {GROUP_OPERATIONAL.map(({ label, key }) => (
            <Flex key={key} justify="between">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatBRL(data[key] || 0)}</span>
            </Flex>
          ))}
        </div>
      </Flex>

      {/* Cost inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input
          label="Equipamentos (da cotação) (R$)"
          variant="number"
          value={equipmentCost || ''}
          onChange={v => setNumber('pricingEquipmentCost', v)}
        />
        {GROUP_OPERATIONAL.map(({ label, key }) => (
          <Input
            key={key}
            label={`${label} (R$)`}
            variant="number"
            value={data[key] || ''}
            onChange={v => setNumber(key, v)}
          />
        ))}
      </div>
    </Stack>
  );
}
