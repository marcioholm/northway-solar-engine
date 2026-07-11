'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BoltIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '../../../components/compositions/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Text } from '../../../components/primitives/Text';
import { Flex } from '../../../components/primitives/Flex';
import { Stack } from '../../../components/primitives/Stack';

interface IBGEState { id: number; sigla: string; nome: string; }
interface IBGECity { id: number; nome: string; }

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const leadName = searchParams.get('name');
  const leadCity = searchParams.get('city');
  const leadState = searchParams.get('state');
  const leadConsumption = searchParams.get('consumption');

  const [clientName, setClientName] = useState(leadName || '');
  const [consumption, setConsumption] = useState(leadConsumption ? Number(leadConsumption) : 0);
  const [selectedState, setSelectedState] = useState(leadState || '');
  const [selectedCity, setSelectedCity] = useState(leadCity || '');
  const [utility, setUtility] = useState('');
  const [tariff, setTariff] = useState(0);
  const [profile, setProfile] = useState('residential');
  const [modules, setModules] = useState<any[]>([]);
  const [inverters, setInverters] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedInverterId, setSelectedInverterId] = useState('');
  const [moduleQty, setModuleQty] = useState(0);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json()).then(setStates);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api || !token) return;
    Promise.all([
      fetch(`${api}/inventory/modules`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${api}/inventory/inverters`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([mods, invs]) => {
      setModules(mods);
      setInverters(invs);
      if (mods.length) setSelectedModuleId(mods[0].id);
      if (invs.length) setSelectedInverterId(invs[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
        .then(res => res.json()).then(setCities);
    } else { setCities([]); setSelectedCity(''); }
  }, [selectedState]);

  const handleCreateProposal = async (openWeb: boolean) => {
    if (!result) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consumption, city: `${selectedCity} - ${selectedState}`, clientName: clientName || 'Cliente Visitante', clientCep: '00000-000', leadId: leadId || undefined, utility: utility || undefined, tariff: tariff || undefined, profile: profile || undefined, moduleId: selectedModuleId || undefined, inverterId: selectedInverterId || undefined, moduleQty: moduleQty > 0 ? moduleQty : undefined }),
      });
      if (!res.ok) throw new Error('Failed to create proposal');
      const proposal = await res.json();
      if (leadId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadId}/stage`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ stage: 'proposal_sent' }),
        });
      }
      if (openWeb) {
        router.push(`/proposta/${proposal.id}`);
      } else {
        const pdfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals/${proposal.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
        if (!pdfRes.ok) throw new Error('Failed to fetch PDF');
        const blob = await pdfRes.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao gerar proposta. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solar-engine/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          consumption,
          city: `${selectedCity} - ${selectedState}`,
          utility: utility || undefined,
          tariff: tariff || undefined,
          profile: profile || undefined,
          moduleId: selectedModuleId || undefined,
          inverterId: selectedInverterId || undefined,
          moduleQty: moduleQty > 0 ? moduleQty : undefined,
        }),
      });
      if (!res.ok) throw new Error('Calculation failed');
      setResult(await res.json());
    } catch { setError('Falha ao calcular. Verifique os dados ou tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <Stack gap={8}>
        <PageHeader title="Novo Dimensionamento" subtitle="Configure os parâmetros técnicos para gerar uma proposta." actions={result && <Button variant="secondary" size="sm">Histórico</Button>} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          {/* Left — Form & Results */}
          <Stack gap={6}>
            <Card padding="lg">
              <Flex gap={2} align="center" style={{ marginBottom: '24px', color: 'var(--green)' }}>
                <CalculatorIcon style={{ width: '20px', height: '20px' }} />
                <Text variant="xxs" color="accent">Parâmetros da Usina</Text>
              </Flex>
              <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ gridColumn: 'span 3' }}>
                  <Input label="Nome do Cliente" placeholder="Ex: João da Silva" value={clientName} onChange={setClientName} required />
                </div>
                <Input label="Consumo Médio (kWh)" variant="number" placeholder="0" value={consumption || ''} onChange={v => setConsumption(Number(v))} required />
                <Input label="Estado (UF)" variant="select" value={selectedState} onChange={setSelectedState}
                  options={[{ label: 'Selecione...', value: '' }, ...states.map(s => ({ label: s.nome, value: s.sigla }))]} required />
                <Input label="Cidade" variant="select" value={selectedCity} onChange={setSelectedCity}
                  options={[{ label: 'Selecione...', value: '' }, ...cities.map(c => ({ label: c.nome, value: c.nome }))]}
                  disabled={!selectedState} required />
                <Input label="Distribuidora" value={utility} onChange={setUtility} placeholder="Ex: Copel, Enel, Cemig..." />
                <Input label="Tarifa (R$/kWh)" variant="number" placeholder="0" value={tariff || ''} onChange={v => setTariff(Number(v))} step="0.01" />
                <Input label="Perfil do Cliente" variant="select" value={profile} onChange={setProfile}
                  options={[
                    { label: 'Residencial', value: 'residential' },
                    { label: 'Comercial', value: 'commercial' },
                    { label: 'Rural', value: 'rural' },
                    { label: 'Industrial', value: 'industrial' },
                    { label: 'Poder Público', value: 'public' },
                    { label: 'Cooperativa', value: 'cooperative' },
                  ]} />
                {modules.length > 0 && (
                  <Input label="Módulo Solar" variant="select" value={selectedModuleId} onChange={setSelectedModuleId}
                    options={modules.map(m => ({ label: `${m.brand} ${m.model} (${m.powerWatt}W - R$ ${Number(m.cost).toFixed(0)})`, value: m.id }))} />
                )}
                {modules.length > 0 && (
                  <Input label="Quantidade de Módulos" variant="number" placeholder="Auto" value={moduleQty || ''} onChange={v => setModuleQty(Number(v))} />
                )}
                {inverters.length > 0 && (
                  <Input label="Inversor" variant="select" value={selectedInverterId} onChange={setSelectedInverterId}
                    options={inverters.map(inv => ({ label: `${inv.brand} ${inv.model} (${inv.nominalPowerKw}kW - R$ ${Number(inv.cost).toFixed(0)})`, value: inv.id }))} />
                )}
                <div style={{ gridColumn: 'span 3' }}>
                  <Button type="submit" loading={loading} size="md" style={{ padding: '12px 28px' }}>Calcular Proposta</Button>
                  {error && <Text variant="sm" color="danger" style={{ marginTop: '8px' }}>{error}</Text>}
                </div>
              </form>
            </Card>

            {result && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <Card padding="md">
                    <Text variant="xxs" color="secondary">Potência Sugerida</Text>
                    <Text variant="h1" style={{ fontSize: '28px', marginTop: '4px' }}>
                      {result.system_power_kwp.toFixed(2)} <Text variant="body" color="secondary" as="span">kWp</Text>
                    </Text>
                  </Card>
                  <Card padding="md">
                    <Text variant="xxs" color="secondary">Geração Mensal</Text>
                    <Text variant="h1" style={{ fontSize: '28px', marginTop: '4px' }}>
                      {Math.round(result.monthly_generation)} <Text variant="body" color="secondary" as="span">kWh</Text>
                    </Text>
                  </Card>
                  <Card padding="md">
                    <Text variant="xxs" color="secondary">Inversor</Text>
                    <Text variant="h4" style={{ marginTop: '4px' }}>{result.inverter.model}</Text>
                    <Text variant="xs" color="accent" style={{ marginTop: '2px', fontWeight: 600 }}>OTIMIZADO PARA {result.module.brand.toUpperCase()}</Text>
                  </Card>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-muted)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', gap: '16px' }}>
                  <div>
                    <Text variant="body-bold">Hardware Engine Match</Text>
                    <Text variant="sm" color="secondary">Dimensionamento automático com {result.module_qty}x módulos {result.module.model} ({result.module.powerWatt}W)</Text>
                  </div>
                  <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: '#EEF2ED', color: '#58605A', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>DISPONÍVEL</span>
                </div>
              </>
            )}
          </Stack>

          {/* Right — Price Card */}
          {result ? (
            <div style={{ background: 'linear-gradient(135deg, var(--green), var(--green-dark))', borderRadius: 'var(--radius-xl)', padding: '32px', color: '#fff', boxShadow: 'var(--shadow-glow)', position: 'sticky', top: '24px' }}>
              <Text variant="xxs" style={{ opacity: 0.75, color: '#fff' }}>Preço Final Sugerido</Text>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '22px', fontWeight: 600, marginTop: '4px' }}>R$</span>
                <span style={{ fontSize: '46px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {result.final_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.2)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <Text variant="xxs" style={{ opacity: 0.75, color: '#fff' }}>Margem ({result.margin_pct}%)</Text>
                  <Text variant="h2" style={{ color: '#fff' }}>R$ {result.margin_value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
                </div>
                <div>
                  <Text variant="xxs" style={{ opacity: 0.75, color: '#fff' }}>Payback</Text>
                  <Text variant="h2" style={{ color: '#fff' }}>{result.payback_years.toFixed(1)} <Text variant="body" as="span" style={{ opacity: 0.7, color: '#fff' }}>Anos</Text></Text>
                </div>
              </div>
              <Stack gap={2}>
                <Button onClick={() => handleCreateProposal(true)} loading={loading} fullWidth size="lg" style={{ background: 'white', color: 'var(--green)', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}>
                  <BoltIcon style={{ width: '18px', height: '18px' }} />
                  VISUALIZAR PROPOSTA
                </Button>
                <Button onClick={() => handleCreateProposal(false)} variant="ghost" fullWidth size="sm" disabled={loading} style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Baixar PDF
                </Button>
              </Stack>
              <Text variant="xs" style={{ textAlign: 'center', marginTop: '16px', opacity: 0.5, color: '#fff' }}>Validado pelo motor de engenharia NorthWay™</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', color: 'var(--text-muted)', gap: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
              <CalculatorIcon style={{ width: '48px', height: '48px', opacity: 0.2 }} />
              <Text variant="body" color="secondary">Aguardando parâmetros...</Text>
            </div>
          )}
        </div>
      </Stack>
    </div>
  );
}
