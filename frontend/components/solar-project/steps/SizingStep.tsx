'use client';

import { useState, useEffect } from 'react';
import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';

interface SizingData {
  sizingPowerKwp: number;
  sizingGenerationKwh: number;
  sizingIrradiation: number;
  sizingLossFactor: number;
  sizingModuleQty: number;
  sizingInverterQty: number;
  sizingObservations: string;
}

export function SizingStep({ data, onChange, consumptionKwh }: { data: Partial<SizingData>; onChange: (d: Partial<SizingData>) => void; consumptionKwh?: number }) {
  const setString = (key: string, val: string) => onChange({ ...data, [key]: val });
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const coveragePct = consumptionKwh && data.sizingGenerationKwh
    ? Math.round((data.sizingGenerationKwh / consumptionKwh) * 100)
    : null;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Dimensionamento</Text>
        <Text variant="body" color="secondary">Parâmetros do sistema fotovoltaico.</Text>
      </div>

      {consumptionKwh && data.sizingGenerationKwh && (
        <Flex gap={4} style={{
          background: 'var(--green-light)', padding: '16px 20px', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--green)',
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-dark)' }}>
              {coveragePct}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--green-dark)', opacity: 0.7 }}>Cobertura do Consumo</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--green)', opacity: 0.3 }} />
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green-dark)' }}>
              {data.sizingPowerKwp?.toFixed(2)} kWp
            </div>
            <div style={{ fontSize: '12px', color: 'var(--green-dark)', opacity: 0.7 }}>Potência do Sistema</div>
          </div>
        </Flex>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Potência do Sistema (kWp)" variant="number" value={data.sizingPowerKwp ?? ''} onChange={v => setNumber('sizingPowerKwp', v)} />
        <Input label="Geração Mensal (kWh)" variant="number" value={data.sizingGenerationKwh ?? ''} onChange={v => setNumber('sizingGenerationKwh', v)} />
        <Input label="Irradiação (kWh/m²/dia)" variant="number" placeholder="4.5" value={data.sizingIrradiation ?? ''} onChange={v => setNumber('sizingIrradiation', v)} />
        <Input label="Fator de Perdas" variant="number" placeholder="0.8" value={data.sizingLossFactor ?? ''} onChange={v => setNumber('sizingLossFactor', v)} />
        <Input label="Quantidade de Módulos" variant="number" value={data.sizingModuleQty ?? ''} onChange={v => setNumber('sizingModuleQty', v)} />
        <Input label="Quantidade de Inversores" variant="number" value={data.sizingInverterQty ?? ''} onChange={v => setNumber('sizingInverterQty', v)} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Observações
        </label>
        <textarea
          value={data.sizingObservations || ''}
          onChange={e => setString('sizingObservations', e.target.value)}
          placeholder="Observações sobre o dimensionamento..."
          style={{
            width: '100%', minHeight: '80px', padding: '12px', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)', background: 'var(--surface)', resize: 'vertical',
            fontFamily: 'inherit', fontSize: '14px', color: 'var(--text)',
          }}
        />
      </div>
    </Stack>
  );
}
