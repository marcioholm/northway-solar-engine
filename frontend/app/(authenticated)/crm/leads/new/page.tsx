'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/compositions/PageHeader';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card } from '../../../../../components/ui/Card';
import { Flex } from '../../../../../components/primitives/Flex';
import { Stack } from '../../../../../components/primitives/Stack';
import { Text } from '../../../../../components/primitives/Text';

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const CLIENT_TYPES = [
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'rural', label: 'Rural' },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', companyName: '', document: '', phone: '', whatsapp: '',
    email: '', city: '', state: '', address: '', zipcode: '',
    clientType: 'residential', source: '', monthlyConsumption: 0,
    avgMonthlyBill: 0, utility: '', notes: '',
    utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '', fbclid: '',
  });
  const [saving, setSaving] = useState(false);

  const update = (field: string) => (value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${api}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          monthlyConsumption: form.monthlyConsumption || undefined,
          avgMonthlyBill: form.avgMonthlyBill || undefined,
        }),
      });
      if (res.ok) router.push('/crm/leads');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Stack gap={8}>
        <PageHeader title="Novo Lead" subtitle="Cadastre um novo cliente potencial" />

        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Card padding="lg">
              <Stack gap={5}>
                <Text variant="xxs" color="accent">Dados Principais</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Input label="Nome" required value={form.name} onChange={update('name')} placeholder="Nome completo" />
                  </div>
                  <Input label="Empresa" value={form.companyName} onChange={update('companyName')} placeholder="Nome da empresa" />
                  <Input label="CPF/CNPJ" value={form.document} onChange={update('document')} placeholder="000.000.000-00" />
                  <Input label="Email" required value={form.email} onChange={update('email')} placeholder="email@exemplo.com" />
                  <Input label="Telefone" required value={form.phone} onChange={update('phone')} placeholder="(11) 99999-9999" />
                  <Input label="WhatsApp" value={form.whatsapp} onChange={update('whatsapp')} placeholder="(11) 99999-9999" />
                  <Input variant="select" label="Tipo de Cliente" value={form.clientType} onChange={update('clientType')} options={CLIENT_TYPES} />
                  <Input label="Origem" value={form.source} onChange={update('source')} placeholder="Indicação, Google, Instagram..." />
                </div>
              </Stack>
            </Card>

            <Card padding="lg">
              <Stack gap={5}>
                <Text variant="xxs" color="accent">Endereço</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <Input label="CEP" value={form.zipcode} onChange={update('zipcode')} placeholder="00000-000" />
                  <div style={{ gridColumn: '2' }}>
                    <Input label="Endereço" value={form.address} onChange={update('address')} placeholder="Rua, número, bairro" />
                  </div>
                  <Input label="Cidade" required value={form.city} onChange={update('city')} placeholder="São Paulo" />
                  <Input variant="select" label="Estado" required value={form.state} onChange={update('state')} options={[{ value: '', label: 'Selecione...' }, ...UF_LIST.map(uf => ({ value: uf, label: uf }))]} />
                </div>
              </Stack>
            </Card>

            <Card padding="lg">
              <Stack gap={5}>
                <Text variant="xxs" color="accent">Consumo & Concessionária</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <Input variant="number" label="Consumo Médio (kWh)" value={form.monthlyConsumption || ''} onChange={update('monthlyConsumption')} placeholder="300" min={0} />
                  <Input variant="number" label="Valor Médio da Conta (R$)" value={form.avgMonthlyBill || ''} onChange={update('avgMonthlyBill')} placeholder="250" min={0} />
                  <Input label="Concessionária" value={form.utility} onChange={update('utility')} placeholder="Enel, EDP, CPFL..." />
                </div>
              </Stack>
            </Card>

            <Card padding="lg">
              <Stack gap={5}>
                <Text variant="xxs" color="accent">Rastreamento & Marketing</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <Input label="UTM Source" value={form.utmSource} onChange={update('utmSource')} placeholder="Ex: google" />
                  <Input label="UTM Medium" value={form.utmMedium} onChange={update('utmMedium')} placeholder="Ex: cpc" />
                  <Input label="UTM Campaign" value={form.utmCampaign} onChange={update('utmCampaign')} placeholder="Ex: blackfriday" />
                  <Input label="UTM Term" value={form.utmTerm} onChange={update('utmTerm')} placeholder="Ex: energia solar" />
                  <Input label="UTM Content" value={form.utmContent} onChange={update('utmContent')} placeholder="Ex: banner1" />
                  <Input label="FBCLID" value={form.fbclid} onChange={update('fbclid')} placeholder="Facebook Click ID" />
                </div>
              </Stack>
            </Card>

            <Card padding="lg">
              <Stack gap={5}>
                <Text variant="xxs" color="accent">Observações</Text>
                <Input variant="textarea" value={form.notes} onChange={update('notes')} placeholder="Informações adicionais sobre o lead..." />
              </Stack>
            </Card>

            <Flex gap={3}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Lead'}
              </Button>
              <Button variant="ghost" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
            </Flex>
          </Stack>
        </form>
      </Stack>
    </div>
  );
}
