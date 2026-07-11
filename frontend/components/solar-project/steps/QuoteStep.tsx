'use client';

import { useState, useEffect } from 'react';
import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { formatBRL } from '../../../lib/format';
import { api } from '../../../lib/api';

interface QuoteItem {
  productType: string;
  productName: string;
  productBrand: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuoteData {
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  supplierEmail: string;
  items: QuoteItem[];
  totalAmount: number;
  shippingCost: number;
}

export function QuoteStep({ data, onChange, projectId }: { data: Partial<QuoteData>; onChange: (d: Partial<QuoteData>) => void; projectId?: string }) {
  const [supplierSearch, setSupplierSearch] = useState('');
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      api.get<any[]>(`/solar-project/${projectId}/quotes`).then(setSavedQuotes).catch(() => {});
    }
  }, [projectId]);

  const items = data.items || [];
  const setString = (key: string, val: string) => onChange({ ...data, [key]: val });
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const addItem = () => {
    onChange({
      ...data,
      items: [...items, { productType: 'module', productName: '', productBrand: '', productModel: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    });
  };

  const updateItem = (idx: number, key: string, val: any) => {
    const updated = [...items];
    (updated[idx] as any)[key] = val;
    updated[idx].totalPrice = updated[idx].quantity * updated[idx].unitPrice;
    const total = updated.reduce((s, i) => s + i.totalPrice, 0) + (data.shippingCost || 0);
    onChange({ ...data, items: updated, totalAmount: total });
  };

  const removeItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    const total = updated.reduce((s, i) => s + i.totalPrice, 0) + (data.shippingCost || 0);
    onChange({ ...data, items: updated, totalAmount: total });
  };

  const handleSaveQuote = async () => {
    if (!projectId) return;
    try {
      const quote = await api.post(`/solar-project/${projectId}/quotes`, {
        supplierName: data.supplierName,
        supplierContact: data.supplierContact,
        supplierPhone: data.supplierPhone,
        supplierEmail: data.supplierEmail,
        shippingCost: data.shippingCost || 0,
        items: items.map(i => ({
          productType: i.productType,
          productName: i.productName,
          productBrand: i.productBrand,
          productModel: i.productModel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      setSavedQuotes([...savedQuotes, quote]);
    } catch (err) {
      console.error('Error saving quote:', err);
    }
  };

  const hasData = !!data.supplierName || items.length > 0 || savedQuotes.length > 0;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Cotações</Text>
        <Text variant="body" color="secondary">Selecione fornecedor e itens cotados.</Text>
      </div>

      {savedQuotes.length > 0 && (
        <Stack gap={3}>
          <Text variant="h3">Cotações Salvas</Text>
          {savedQuotes.map((q: any) => (
            <Flex key={q.id} justify="between" style={{
              padding: '12px 16px', background: 'var(--surface-muted)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)',
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{q.supplierName || 'Fornecedor'}</span>
                <Chip variant="default" style={{ marginLeft: '8px' }}>{q.status}</Chip>
              </div>
              <span style={{ fontWeight: 700 }}>{formatBRL(Number(q.totalAmount))}</span>
            </Flex>
          ))}
        </Stack>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Nome do Fornecedor" value={data.supplierName || ''} onChange={v => setString('supplierName', v)} placeholder="Ex: Solar Distribuidora" />
        <Input label="Contato" value={data.supplierContact || ''} onChange={v => setString('supplierContact', v)} />
        <Input label="Telefone" value={data.supplierPhone || ''} onChange={v => setString('supplierPhone', v)} />
        <Input label="Email" value={data.supplierEmail || ''} onChange={v => setString('supplierEmail', v)} />
      </div>

      <div>
        <Flex justify="between" align="center" style={{ marginBottom: '12px' }}>
          <Text variant="h3">Itens Cotados</Text>
          <Button variant="outline" size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={addItem}>Adicionar Item</Button>
        </Flex>

        {items.length === 0 && !hasData && (
          <Text variant="body" color="secondary">Adicione itens para esta cotação.</Text>
        )}

        {items.map((item, idx) => (
          <Flex key={idx} gap={2} align="center" style={{ marginBottom: '8px' }}>
            <select
              value={item.productType}
              onChange={e => updateItem(idx, 'productType', e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)',
                background: 'var(--surface)', fontSize: '13px', fontFamily: 'inherit',
                minWidth: '90px',
              }}
            >
              <option value="module">Módulo</option>
              <option value="inverter">Inversor</option>
              <option value="structure">Estrutura</option>
              <option value="cable">Cabo</option>
              <option value="service">Serviço</option>
            </select>
            <Input placeholder="Nome" value={item.productName} onChange={v => updateItem(idx, 'productName', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="Marca" value={item.productBrand} onChange={v => updateItem(idx, 'productBrand', v)} style={{ minWidth: '100px' }} />
            <Input placeholder="Modelo" value={item.productModel} onChange={v => updateItem(idx, 'productModel', v)} style={{ minWidth: '100px' }} />
            <Input placeholder="Qtd" variant="number" value={item.quantity || ''} onChange={v => updateItem(idx, 'quantity', Number(v))} style={{ width: '60px' }} />
            <Input placeholder="R$ Unit" variant="number" value={item.unitPrice || ''} onChange={v => updateItem(idx, 'unitPrice', Number(v))} style={{ width: '90px' }} />
            {item.totalPrice > 0 && <span style={{ fontWeight: 600, fontSize: '13px', minWidth: '80px', textAlign: 'right' }}>{formatBRL(item.totalPrice)}</span>}
            <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '8px' }}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </Flex>
        ))}

        {items.length > 0 && (
          <Flex gap={3} align="center" style={{ marginTop: '12px' }}>
            <Input label="Frete (R$)" variant="number" value={data.shippingCost ?? ''} onChange={v => setNumber('shippingCost', v)} style={{ width: '150px' }} />
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)' }}>
                {formatBRL(items.reduce((s, i) => s + i.totalPrice, 0) + (data.shippingCost || 0))}
              </div>
            </div>
          </Flex>
        )}

        {hasData && projectId && (
          <Button variant="primary" size="sm" icon={<CheckIcon className="w-4 h-4" />} onClick={handleSaveQuote} style={{ marginTop: '12px' }}>
            Salvar Cotação
          </Button>
        )}
      </div>
    </Stack>
  );
}
