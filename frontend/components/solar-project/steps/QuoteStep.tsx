'use client';

import { useState, useEffect } from 'react';
import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Chip } from '../../ui/Chip';
import { Badge } from '../../ui/Badge';
import { EmptyState } from '../../ui/EmptyState';
import { PlusIcon, TrashIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { formatBRL, formatDate } from '../../../lib/format';
import { api } from '../../../lib/api';

interface QuoteItemData {
  productType: string;
  productName: string;
  productBrand: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuoteForm {
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  supplierEmail: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  paymentCondition: string;
  shippingCost: number;
  notes: string;
  items: QuoteItemData[];
}

const emptyForm: QuoteForm = {
  supplierName: '', supplierContact: '', supplierPhone: '', supplierEmail: '',
  quoteNumber: '', quoteDate: '', validUntil: '', paymentCondition: '',
  shippingCost: 0, notes: '', items: [],
};

const STATUS_BADGE: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', accepted: 'Aceita', rejected: 'Recusada',
};

export function QuoteStep({ data, onChange, projectId }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void; projectId?: string }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QuoteForm>(emptyForm);

  const load = async () => {
    if (!projectId) return;
    try {
      const list = await api.get<any[]>(`/solar-project/${projectId}/quotes`);
      setQuotes(list);
      const sel = list.find(q => q.selected);
      if (sel) setSelectedId(sel.id);
    } catch {}
  };

  useEffect(() => { load(); }, [projectId]);

  const updateForm = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const addItem = () => setForm(prev => ({
    ...prev,
    items: [...prev.items, { productType: 'module', productName: '', productBrand: '', productModel: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
  }));

  const updateItem = (idx: number, key: string, val: any) => {
    setForm(prev => {
      const items = [...prev.items];
      (items[idx] as any)[key] = val;
      items[idx].totalPrice = items[idx].quantity * items[idx].unitPrice;
      return { ...prev, items };
    });
  };

  const removeItem = (idx: number) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const formTotal = form.items.reduce((s, i) => s + i.totalPrice, 0) + (form.shippingCost || 0);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      await api.post(`/solar-project/${projectId}/quotes`, {
        supplierName: form.supplierName,
        supplierContact: form.supplierContact,
        supplierPhone: form.supplierPhone,
        supplierEmail: form.supplierEmail,
        quoteNumber: form.quoteNumber,
        quoteDate: form.quoteDate || undefined,
        validUntil: form.validUntil || undefined,
        paymentCondition: form.paymentCondition,
        shippingCost: form.shippingCost,
        notes: form.notes,
        items: form.items.map(i => ({
          productType: i.productType, productName: i.productName,
          productBrand: i.productBrand, productModel: i.productModel,
          quantity: i.quantity, unitPrice: i.unitPrice,
        })),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      console.error('Error saving quote:', err);
    }
  };

  const handleSelect = async (qid: string) => {
    if (!projectId) return;
    try {
      await api.patch(`/solar-project/${projectId}/quotes/${qid}/select`);
      const q = quotes.find(x => x.id === qid);
      setSelectedId(qid);
      if (q) {
        onChange({
          supplierName: q.supplierName,
          pricingEquipmentCost: Number(q.totalAmount),
        });
      }
    } catch (err) {
      console.error('Error selecting quote:', err);
    }
  };

  const handleDelete = async (qid: string) => {
    if (!projectId) return;
    try {
      await api.delete(`/solar-project/${projectId}/quotes/${qid}`);
      if (selectedId === qid) setSelectedId(null);
      load();
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  };

  return (
    <Stack gap={5}>
      <Flex justify="between" align="center">
        <div>
          <Text variant="h3">Cotações</Text>
          <Text variant="body" color="secondary">Gerencie cotações de fornecedores. Selecione uma para uso no projeto.</Text>
        </div>
        <Button variant="primary" size="md" icon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowForm(!showForm)}>
          Nova Cotação
        </Button>
      </Flex>

      {/* Selected quote highlight */}
      {selectedId && (() => {
        const q = quotes.find(x => x.id === selectedId);
        if (!q) return null;
        return (
          <Flex gap={3} align="center" style={{
            background: 'var(--green-light)', padding: '14px 20px', borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--green)',
          }}>
            <CheckCircleIcon className="w-6 h-6" style={{ color: 'var(--green-dark)' }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{q.supplierName}</span>
              <span style={{ color: 'var(--green-dark)', opacity: 0.7, marginLeft: '8px' }}>selecionada</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: '20px', color: 'var(--green-dark)' }}>{formatBRL(Number(q.totalAmount))}</span>
          </Flex>
        );
      })()}

      {/* Saved quotes grid */}
      {quotes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {quotes.map(q => (
            <Card key={q.id} padding="md" variant={q.selected ? 'highlight' : 'interactive'} style={{ position: 'relative' }}>
              <Stack gap={3}>
                <Flex justify="between" align="center">
                  <Text variant="body-bold" style={{ fontSize: '15px' }}>{q.supplierName || 'Sem nome'}</Text>
                  <Badge variant={q.selected ? 'success' : 'info'}>
                    {q.selected ? 'Selecionada' : STATUS_BADGE[q.status] || q.status}
                  </Badge>
                </Flex>

                <Flex gap={2} wrap>
                  {q.quoteNumber && <Chip variant="default">#{q.quoteNumber}</Chip>}
                  {q.quoteDate && <Chip variant="default">{formatDate(q.quoteDate, 'short')}</Chip>}
                  {q.items?.length > 0 && <Chip variant="default">{q.items.length} itens</Chip>}
                </Flex>

                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)' }}>
                  {formatBRL(Number(q.totalAmount))}
                </div>

                {q.paymentCondition && (
                  <Text variant="body" color="secondary" style={{ fontSize: '12px' }}>
                    {q.paymentCondition}
                  </Text>
                )}

                <Flex gap={2} style={{ marginTop: '4px' }}>
                  {!q.selected && (
                    <Button variant="primary" size="sm" onClick={() => handleSelect(q.id)}>
                      Selecionar
                    </Button>
                  )}
                  {q.selected && (
                    <Chip variant="default" style={{ background: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0' }}>Cotação em uso</Chip>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </Flex>
              </Stack>
            </Card>
          ))}
        </div>
      )}

      {quotes.length === 0 && !showForm && (
        <EmptyState
          icon="📋"
          title="Nenhuma cotação"
          description="Adicione cotações de fornecedores para comparar preços."
          action={{ label: 'Nova Cotação', onClick: () => setShowForm(true) }}
        />
      )}

      {/* New quote form */}
      {showForm && (
        <Card padding="lg" style={{ border: '2px solid var(--green)' }}>
          <Stack gap={5}>
            <Text variant="h3">Nova Cotação</Text>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Fornecedor" value={form.supplierName} onChange={v => updateForm('supplierName', v)} placeholder="Ex: BelEnergy" />
              <Input label="Nº Cotação" value={form.quoteNumber} onChange={v => updateForm('quoteNumber', v)} placeholder="Ex: ORC-2024-001" />
              <Input label="Contato" value={form.supplierContact} onChange={v => updateForm('supplierContact', v)} />
              <Input label="Telefone" value={form.supplierPhone} onChange={v => updateForm('supplierPhone', v)} />
              <Input label="Email" value={form.supplierEmail} onChange={v => updateForm('supplierEmail', v)} />
              <Input label="Data da Cotação" variant="number" value={form.quoteDate} onChange={v => updateForm('quoteDate', v)} placeholder="AAAA-MM-DD" />
              <Input label="Validade" variant="number" value={form.validUntil} onChange={v => updateForm('validUntil', v)} placeholder="AAAA-MM-DD" />
              <Input label="Condição de Pagamento" value={form.paymentCondition} onChange={v => updateForm('paymentCondition', v)} placeholder="Ex: 30 dias" />
            </div>

            {/* Items */}
            <div>
              <Flex justify="between" align="center" style={{ marginBottom: '12px' }}>
                <Text variant="h3">Itens</Text>
                <Button variant="outline" size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={addItem}>
                  Adicionar Item
                </Button>
              </Flex>

              {form.items.length === 0 && (
                <Text variant="body" color="secondary">Nenhum item adicionado.</Text>
              )}

              {form.items.map((item, idx) => (
                <Flex key={idx} gap={2} align="center" style={{ marginBottom: '8px' }}>
                  <select value={item.productType} onChange={e => updateItem(idx, 'productType', e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '12px', fontFamily: 'inherit', minWidth: '80px' }}>
                    <option value="module">Módulo</option>
                    <option value="inverter">Inversor</option>
                    <option value="structure">Estrutura</option>
                    <option value="cable">Cabo</option>
                    <option value="connector">Conector</option>
                    <option value="protection">Proteção</option>
                    <option value="service">Serviço</option>
                  </select>
                  <Input placeholder="Nome" value={item.productName} onChange={v => updateItem(idx, 'productName', v)} style={{ minWidth: '100px' }} />
                  <Input placeholder="Marca" value={item.productBrand} onChange={v => updateItem(idx, 'productBrand', v)} style={{ minWidth: '90px' }} />
                  <Input placeholder="Modelo" value={item.productModel} onChange={v => updateItem(idx, 'productModel', v)} style={{ minWidth: '90px' }} />
                  <Input placeholder="Qtd" variant="number" value={item.quantity || ''} onChange={v => updateItem(idx, 'quantity', Number(v))} style={{ width: '55px' }} />
                  <Input placeholder="R$ Unit" variant="number" value={item.unitPrice || ''} onChange={v => updateItem(idx, 'unitPrice', Number(v))} style={{ width: '80px' }} />
                  {item.totalPrice > 0 && <span style={{ fontWeight: 700, fontSize: '12px', minWidth: '70px', textAlign: 'right' }}>{formatBRL(item.totalPrice)}</span>}
                  <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '6px' }}>
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </Flex>
              ))}
            </div>

            {/* Freight + Notes + Total */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Frete (R$)" variant="number" value={form.shippingCost || ''} onChange={v => updateForm('shippingCost', Number(v))} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL DA COTAÇÃO</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-dark)' }}>{formatBRL(formTotal)}</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Observações
              </label>
              <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)}
                placeholder="Condições comerciais, prazos, garantias..."
                style={{ width: '100%', minHeight: '70px', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', background: 'var(--surface)', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px', color: 'var(--text)' }}
              />
            </div>

            <Flex justify="end" gap={3}>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button variant="primary" icon={<CheckCircleIcon className="w-5 h-5" />} onClick={handleSave}
                disabled={!form.supplierName || form.items.length === 0}>
                Salvar Cotação
              </Button>
            </Flex>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
