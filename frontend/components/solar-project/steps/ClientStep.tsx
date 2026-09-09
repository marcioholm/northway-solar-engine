'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';

interface ClientData {
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientEmail: string;
  clientCity: string;
  clientState: string;
  clientZipcode: string;
  clientUtility: string;
  clientClass: string;
  clientTariffGroup: string;
  clientModality: string;
  consultantName: string;
}

export function ClientStep({ data, onChange }: { data: Partial<ClientData>; onChange: (d: Partial<ClientData>) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val });

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Dados do Cliente</Text>
        <Text variant="body" color="secondary">Informações principais do contratante.</Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Nome Completo" value={data.clientName || ''} onChange={v => set('clientName', v)} required />
        <Input 
          label="CPF / CNPJ" 
          value={data.clientDocument || ''} 
          onChange={v => {
            const numbers = v.replace(/\D/g, '');
            let formatted = numbers;
            if (numbers.length <= 11) {
              formatted = numbers.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
              formatted = numbers.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
            }
            set('clientDocument', formatted);
          }} 
        />
        <Input label="Telefone" value={data.clientPhone || ''} onChange={v => set('clientPhone', v)} />
        <Input label="E-mail" value={data.clientEmail || ''} onChange={v => set('clientEmail', v)} />
        <Input label="Cidade" value={data.clientCity || ''} onChange={v => set('clientCity', v)} />
        <Input label="Estado" value={data.clientState || ''} onChange={v => set('clientState', v)} />
        <Input label="CEP" value={data.clientZipcode || ''} onChange={v => set('clientZipcode', v)} />
        <Input label="Consultor Responsável" value={data.consultantName || ''} onChange={v => set('consultantName', v)} />
      </div>
      <div>
        <Text variant="h3" style={{ marginBottom: '12px' }}>Informações da Concessionária</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Input label="Distribuidora" value={data.clientUtility || ''} onChange={v => set('clientUtility', v)} placeholder="Ex: CEMIG" />
          <Input label="Classe" value={data.clientClass || ''} onChange={v => set('clientClass', v)} placeholder="Residencial / Comercial / Rural" />
          <Input label="Grupo Tarifário" value={data.clientTariffGroup || ''} onChange={v => set('clientTariffGroup', v)} placeholder="B1, B2, A4..." />
        </div>
      </div>
      <div>
        <Text variant="h3" style={{ marginBottom: '12px' }}>Modalidade</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Modalidade" value={data.clientModality || ''} onChange={v => set('clientModality', v)} placeholder="Local / Remota / Compartilhada" />
        </div>
      </div>
    </Stack>
  );
}
