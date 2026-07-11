'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { DataGrid } from '../../../components/compositions/DataGrid';
import { Tabs } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Flex } from '../../../components/primitives/Flex';
import { Text } from '../../../components/primitives/Text';
import { Stack } from '../../../components/primitives/Stack';
import { powerLabel } from '../../../lib/format';

interface InventoryItem {
  id: string;
  brand: string;
  model: string;
  powerWatt?: number;
  nominalPowerKw?: number;
  cost: number;
  active: boolean;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'inverters'>('modules');
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState<Record<string, any>>({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'modules' ? 'modules' : 'inverters';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'modules' ? 'modules' : 'inverters';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newItem, active: true }),
      });
      if (res.ok) {
        setNewItem({});
        setShowForm(false);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      key: 'brand' as const,
      label: 'Marca',
      render: (item: InventoryItem) => (
        <Flex gap={3} align="center">
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--green)', flexShrink: 0,
          }} />
          <span style={{ fontWeight: 600 }}>{item.brand}</span>
        </Flex>
      ),
    },
    { key: 'model' as const, label: 'Modelo' },
    {
      key: 'power' as const,
      label: 'Potência',
      render: (item: InventoryItem) => (
        <Chip variant="default">
          {powerLabel(item.powerWatt, item.nominalPowerKw, activeTab === 'inverters' ? 'inverter' : 'module')}
        </Chip>
      ),
    },
    {
      key: 'cost' as const,
      label: 'Custo (R$)',
      render: (item: InventoryItem) => (
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          R$ {Number(item.cost).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'actions' as const,
      label: 'Ações',
      width: '120px',
      align: 'right' as const,
      render: () => (
        <Flex gap={1} justify="end">
          <button
            aria-label="Editar"
            style={{
              width: '36px', height: '36px', display: 'grid', placeItems: 'center',
              border: 'none', borderRadius: 'var(--radius-md)',
              background: 'transparent', color: 'var(--text-secondary-v2)',
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            aria-label="Excluir"
            style={{
              width: '36px', height: '36px', display: 'grid', placeItems: 'center',
              border: 'none', borderRadius: 'var(--radius-md)',
              background: 'transparent', color: 'var(--danger)',
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF0EF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </Flex>
      ),
    },
  ];

  const isModule = activeTab === 'modules';

  return (
    <div style={{ maxWidth: '1440px', padding: '32px 36px', background: 'var(--bg)' }}>
      <Stack gap={6}>
        <PageHeader
          title="Inventário de Equipamentos"
          subtitle="Gerencie módulos e inversores disponíveis para seus projetos."
          actions={
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setShowForm(!showForm)}
            >
              Adicionar Novo Item
            </Button>
          }
        />

        <Tabs
          variant="underline"
          tabs={[
            { key: 'modules', label: 'Módulos Fotovoltaicos', count: activeTab === 'modules' ? data.length : undefined },
            { key: 'inverters', label: 'Inversores', count: activeTab === 'inverters' ? data.length : undefined },
          ]}
          activeKey={activeTab}
          onChange={key => setActiveTab(key as 'modules' | 'inverters')}
        />

        {showForm && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
            boxShadow: 'var(--shadow-md)',
          }}>
            <Text variant="h3" style={{ marginBottom: '20px' }}>
              Novo {isModule ? 'Módulo' : 'Inversor'}
            </Text>
            <form onSubmit={handleCreate} style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px', alignItems: 'end',
            }}>
              <Input label="Marca" placeholder="Ex: Canadian" value={newItem.brand || ''} onChange={v => setNewItem({ ...newItem, brand: v })} required />
              <Input label="Modelo" placeholder="Ex: Hiku6" value={newItem.model || ''} onChange={v => setNewItem({ ...newItem, model: v })} required />
              <Input
                label="Potência"
                variant="number"
                placeholder={isModule ? 'Watts (W)' : 'Kilowatts (kW)'}
                value={isModule ? (newItem.powerWatt ?? '') : (newItem.nominalPowerKw ?? '')}
                onChange={v => setNewItem({
                  ...newItem,
                  [isModule ? 'powerWatt' : 'nominalPowerKw']: Number(v),
                })}
                required
              />
              <Input label="Custo (R$)" variant="number" placeholder="0,00" step="0.01" value={newItem.cost ?? ''} onChange={v => setNewItem({ ...newItem, cost: Number(v) })} required />
              <Button type="submit" variant="primary" size="md" style={{ height: '42px' }}>Salvar Item</Button>
            </form>
          </div>
        )}

        <DataGrid
          columns={columns}
          data={data}
          keyExtractor={item => item.id}
          loading={loading}
          emptyMessage="Nenhum equipamento encontrado."
          mobileCard={item => (
            <Stack gap={2}>
              <Flex justify="between" align="center">
                <Flex gap={3} align="center">
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green)' }} />
                  <Text variant="body-bold">{item.brand}</Text>
                </Flex>
                <Chip variant="default">
                  {powerLabel(item.powerWatt, item.nominalPowerKw, isModule ? 'module' : 'inverter')}
                </Chip>
              </Flex>
              <Text variant="body" color="secondary">{item.model}</Text>
              <Flex justify="between" align="center">
                <Text variant="body-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  R$ {Number(item.cost).toFixed(2)}
                </Text>
                <Flex gap={1}>
                  <button aria-label="Editar" style={{ width: '36px', height: '36px', display: 'grid', placeItems: 'center', border: 'none', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-secondary-v2)', cursor: 'pointer' }}>
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button aria-label="Excluir" style={{ width: '36px', height: '36px', display: 'grid', placeItems: 'center', border: 'none', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}>
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </Flex>
              </Flex>
            </Stack>
          )}
        />
      </Stack>
    </div>
  );
}
