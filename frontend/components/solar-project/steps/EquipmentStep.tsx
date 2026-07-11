'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatBRL } from '../../../lib/format';

interface EquipmentData {
  equipmentModules: Array<{ name: string; brand: string; model: string; power: number; qty: number; unitPrice: number }>;
  equipmentInverters: Array<{ name: string; brand: string; model: string; powerKw: number; qty: number; unitPrice: number }>;
}

export function EquipmentStep({ data, onChange }: { data: Partial<EquipmentData>; onChange: (d: Partial<EquipmentData>) => void }) {
  const modules = data.equipmentModules || [];
  const inverters = data.equipmentInverters || [];

  const addModule = () => onChange({ ...data, equipmentModules: [...modules, { name: '', brand: '', model: '', power: 0, qty: 0, unitPrice: 0 }] });
  const addInverter = () => onChange({ ...data, equipmentInverters: [...inverters, { name: '', brand: '', model: '', powerKw: 0, qty: 0, unitPrice: 0 }] });

  const updateModule = (idx: number, key: string, val: any) => {
    const updated = [...modules];
    updated[idx] = { ...updated[idx], [key]: val };
    onChange({ ...data, equipmentModules: updated });
  };

  const updateInverter = (idx: number, key: string, val: any) => {
    const updated = [...inverters];
    updated[idx] = { ...updated[idx], [key]: val };
    onChange({ ...data, equipmentInverters: updated });
  };

  const removeModule = (idx: number) => onChange({ ...data, equipmentModules: modules.filter((_, i) => i !== idx) });
  const removeInverter = (idx: number) => onChange({ ...data, equipmentInverters: inverters.filter((_, i) => i !== idx) });

  const moduleCost = modules.reduce((s, m) => s + m.qty * m.unitPrice, 0);
  const inverterCost = inverters.reduce((s, m) => s + m.qty * m.unitPrice, 0);

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Equipamentos</Text>
        <Text variant="body" color="secondary">Selecione os equipamentos do projeto.</Text>
      </div>

      {moduleCost + inverterCost > 0 && (
        <Flex gap={4} style={{
          background: 'var(--surface-muted)', padding: '16px 20px', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--line)',
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{formatBRL(moduleCost + inverterCost)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600 }}>CUSTO TOTAL EQUIPAMENTOS</div>
          </div>
        </Flex>
      )}

      <div>
        <Flex justify="between" align="center" style={{ marginBottom: '12px' }}>
          <Text variant="h3">Módulos</Text>
          <Button variant="outline" size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={addModule}>Adicionar Módulo</Button>
        </Flex>
        {modules.map((mod, idx) => (
          <Flex key={idx} gap={2} align="center" style={{ marginBottom: '8px' }}>
            <Input placeholder="Marca" value={mod.brand} onChange={v => updateModule(idx, 'brand', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="Modelo" value={mod.model} onChange={v => updateModule(idx, 'model', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="W" variant="number" value={mod.power || ''} onChange={v => updateModule(idx, 'power', Number(v))} style={{ width: '80px' }} />
            <Input placeholder="Qtd" variant="number" value={mod.qty || ''} onChange={v => updateModule(idx, 'qty', Number(v))} style={{ width: '70px' }} />
            <Input placeholder="R$ Unit" variant="number" value={mod.unitPrice || ''} onChange={v => updateModule(idx, 'unitPrice', Number(v))} style={{ width: '100px' }} />
            <button onClick={() => removeModule(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '8px' }}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </Flex>
        ))}
      </div>

      <div>
        <Flex justify="between" align="center" style={{ marginBottom: '12px' }}>
          <Text variant="h3">Inversores</Text>
          <Button variant="outline" size="sm" icon={<PlusIcon className="w-4 h-4" />} onClick={addInverter}>Adicionar Inversor</Button>
        </Flex>
        {inverters.map((inv, idx) => (
          <Flex key={idx} gap={2} align="center" style={{ marginBottom: '8px' }}>
            <Input placeholder="Marca" value={inv.brand} onChange={v => updateInverter(idx, 'brand', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="Modelo" value={inv.model} onChange={v => updateInverter(idx, 'model', v)} style={{ minWidth: '120px' }} />
            <Input placeholder="kW" variant="number" value={inv.powerKw || ''} onChange={v => updateInverter(idx, 'powerKw', Number(v))} style={{ width: '80px' }} />
            <Input placeholder="Qtd" variant="number" value={inv.qty || ''} onChange={v => updateInverter(idx, 'qty', Number(v))} style={{ width: '70px' }} />
            <Input placeholder="R$ Unit" variant="number" value={inv.unitPrice || ''} onChange={v => updateInverter(idx, 'unitPrice', Number(v))} style={{ width: '100px' }} />
            <button onClick={() => removeInverter(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '8px' }}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </Flex>
        ))}
      </div>
    </Stack>
  );
}
