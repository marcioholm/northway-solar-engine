'use client';

import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';

interface FullProjectData {
  clientName?: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientCity?: string;
  clientState?: string;
  clientUtility?: string;
  siteAddress?: string;
  siteRoofType?: string;
  siteInclination?: number;
  siteAzimuth?: number;
  consumptionMonthlyKwh?: number;
  consumptionMonthlyBill?: number;
  consumptionTariff?: number;
  sizingPowerKwp?: number;
  sizingGenerationKwh?: number;
  sizingModuleQty?: number;
  sizingInverterQty?: number;
  equipmentModules?: Array<any>;
  equipmentInverters?: Array<any>;
  pricingEquipmentCost?: number;
  pricingLaborCost?: number;
  pricingFinalPrice?: number;
  pricingMarginPct?: number;
  pricingMarginValue?: number;
  [key: string]: any;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '20px',
      border: '1px solid var(--line)',
    }}>
      <Text variant="h3" style={{ marginBottom: '12px', fontSize: '14px', letterSpacing: '0.05em', color: 'var(--green-dark)' }}>
        {title}
      </Text>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <Flex justify="between" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </Flex>
  );
}

export function ReviewStep({ data }: { data: FullProjectData }) {
  return (
    <Stack gap={4}>
      <div>
        <Text variant="h3">Revisão do Projeto</Text>
        <Text variant="body" color="secondary">Verifique todas as informações antes de salvar.</Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SectionCard title="Cliente">
          <Row label="Nome" value={data.clientName} />
          <Row label="Documento" value={data.clientDocument} />
          <Row label="Telefone" value={data.clientPhone} />
          <Row label="Email" value={data.clientEmail} />
          <Row label="Cidade" value={data.clientCity} />
          <Row label="Estado" value={data.clientState} />
          <Row label="Distribuidora" value={data.clientUtility} />
          <Row label="Consultor" value={data.consultantName} />
        </SectionCard>

        <SectionCard title="Local">
          <Row label="Endereço" value={data.siteAddress} />
          <Row label="Tipo de Telhado" value={data.siteRoofType} />
          <Row label="Inclinação" value={data.siteInclination ? `${data.siteInclination}°` : undefined} />
          <Row label="Azimute" value={data.siteAzimuth ? `${data.siteAzimuth}°` : undefined} />
        </SectionCard>

        <SectionCard title="Consumo">
          <Row label="Mensal (kWh)" value={data.consumptionMonthlyKwh ? `${data.consumptionMonthlyKwh} kWh` : undefined} />
          <Row label="Valor Conta" value={data.consumptionMonthlyBill ? `R$ ${data.consumptionMonthlyBill.toFixed(2)}` : undefined} />
          <Row label="Tarifa" value={data.consumptionTariff ? `R$ ${data.consumptionTariff.toFixed(3)}` : undefined} />
        </SectionCard>

        <SectionCard title="Dimensionamento">
          <Row label="Potência" value={data.sizingPowerKwp ? `${data.sizingPowerKwp.toFixed(2)} kWp` : undefined} />
          <Row label="Geração" value={data.sizingGenerationKwh ? `${data.sizingGenerationKwh} kWh/mês` : undefined} />
          <Row label="Módulos" value={data.sizingModuleQty ? `${data.sizingModuleQty} unidades` : undefined} />
          <Row label="Inversores" value={data.sizingInverterQty ? `${data.sizingInverterQty} unidades` : undefined} />
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SectionCard title="Equipamentos">
          {(data.equipmentModules?.length || 0) > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>MÓDULOS</div>
              {data.equipmentModules?.map((m: any, i: number) => (
                <div key={i} style={{ fontSize: '13px' }}>{m.brand} {m.model} — {m.qty}x R$ {Number(m.unitPrice).toFixed(2)}</div>
              ))}
            </div>
          )}
          {(data.equipmentInverters?.length || 0) > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>INVERSORES</div>
              {data.equipmentInverters?.map((inv: any, i: number) => (
                <div key={i} style={{ fontSize: '13px' }}>{inv.brand} {inv.model} — {inv.qty}x R$ {Number(inv.unitPrice).toFixed(2)}</div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Precificação">
          <Row label="Custo Equipamentos" value={data.pricingEquipmentCost ? `R$ ${data.pricingEquipmentCost.toFixed(2)}` : undefined} />
          <Row label="Mão de Obra" value={data.pricingLaborCost ? `R$ ${data.pricingLaborCost.toFixed(2)}` : undefined} />
          <Row label="Margem" value={data.pricingMarginPct ? `${data.pricingMarginPct}%` : undefined} />
          <Row label="Valor Margem" value={data.pricingMarginValue ? `R$ ${data.pricingMarginValue.toFixed(2)}` : undefined} />
          <Row label="Preço Final" value={data.pricingFinalPrice ? `R$ ${data.pricingFinalPrice.toFixed(2)}` : undefined} />
        </SectionCard>
      </div>
    </Stack>
  );
}
