'use client';

import { useState } from 'react';
import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ConsumptionData {
  consumptionMonthlyKwh: number;
  consumptionMonthlyBill: number;
  consumptionTariff: number;
  consumptionDemand: number;
  consumptionModality: string;
  consumptionGroup: string;
  consumptionInvoices: Array<{ month: string; consumption: number; bill: number }>;
}

export function ConsumptionStep({ data, onChange }: { data: Partial<ConsumptionData>; onChange: (d: Partial<ConsumptionData>) => void }) {
  const invoices = data.consumptionInvoices || [];

  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const addInvoice = () => {
    const nextMonth = invoices.length + 1;
    onChange({
      ...data,
      consumptionInvoices: [...invoices, { month: `Mês ${nextMonth}`, consumption: 0, bill: 0 }],
    });
  };

  const updateInvoice = (idx: number, field: string, val: string) => {
    const updated = [...invoices];
    updated[idx] = { ...updated[idx], [field]: field === 'month' ? val : Number(val) };
    onChange({ ...data, consumptionInvoices: updated });
  };

  const removeInvoice = (idx: number) => {
    onChange({ ...data, consumptionInvoices: invoices.filter((_, i) => i !== idx) });
  };

  const avgConsumption = invoices.length > 0
    ? Math.round(invoices.reduce((s, i) => s + i.consumption, 0) / invoices.length)
    : data.consumptionMonthlyKwh || 0;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Consumo de Energia</Text>
        <Text variant="body" color="secondary">Informações de consumo e faturamento.</Text>
      </div>

      {avgConsumption > 0 && (
        <Flex gap={4} style={{
          background: 'var(--green-light)', padding: '16px 20px', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--green)',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-dark)' }}>
            {avgConsumption} <span style={{ fontSize: '14px', fontWeight: 600 }}>kWh/mês</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--green-dark)', opacity: 0.7 }}>média estimada</div>
        </Flex>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Consumo Mensal (kWh)" variant="number" value={data.consumptionMonthlyKwh ?? ''} onChange={v => setNumber('consumptionMonthlyKwh', v)} />
        <Input label="Valor da Conta (R$)" variant="number" value={data.consumptionMonthlyBill ?? ''} onChange={v => setNumber('consumptionMonthlyBill', v)} />
        <Input label="Tarifa (R$/kWh)" variant="number" placeholder="0,80" value={data.consumptionTariff ?? ''} onChange={v => setNumber('consumptionTariff', v)} />
        <Input label="Demanda (kW)" variant="number" value={data.consumptionDemand ?? ''} onChange={v => setNumber('consumptionDemand', v)} />
        <Input label="Modalidade" value={data.consumptionModality || ''} onChange={v => onChange({ ...data, consumptionModality: v })} placeholder="AZUL / VERDE / BRANCA / CONVENCIONAL" />
        <Input label="Grupo (A/B)" value={data.consumptionGroup || ''} onChange={v => onChange({ ...data, consumptionGroup: v })} placeholder="A / B" />
      </div>

      <div>
        <Flex justify="between" align="center" style={{ marginBottom: '12px' }}>
          <Text variant="h3">Faturas</Text>
          <Button variant="outline" size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={addInvoice}>
            Adicionar Fatura
          </Button>
        </Flex>
        {invoices.length === 0 && (
          <Text variant="body" color="secondary">Nenhuma fatura adicionada. O consumo médio será usado como referência.</Text>
        )}
        {invoices.map((inv, idx) => (
          <Flex key={idx} gap={3} align="center" style={{ marginBottom: '8px' }}>
            <Input placeholder="Mês" value={inv.month} onChange={v => updateInvoice(idx, 'month', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="kWh" variant="number" value={inv.consumption || ''} onChange={v => updateInvoice(idx, 'consumption', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="Valor R$" variant="number" value={inv.bill || ''} onChange={v => updateInvoice(idx, 'bill', v)} style={{ minWidth: '120px' }} />
            <button onClick={() => removeInvoice(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '8px' }}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </Flex>
        ))}
      </div>
    </Stack>
  );
}
