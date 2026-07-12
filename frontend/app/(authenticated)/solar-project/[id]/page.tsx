'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '../../../../components/compositions/PageHeader';
import { Tabs } from '../../../../components/ui/Tabs';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Chip } from '../../../../components/ui/Chip';
import { Badge } from '../../../../components/ui/Badge';
import { Flex } from '../../../../components/primitives/Flex';
import { Stack } from '../../../../components/primitives/Stack';
import { Text } from '../../../../components/primitives/Text';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { ProjectTimeline } from '../../../../components/solar-project/ProjectTimeline';
import { api } from '../../../../lib/api';
import { formatBRL, formatPercent } from '../../../../lib/format';

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <Flex justify="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </Flex>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="md" style={{ height: 'fit-content' }}>
      <Text variant="h3" style={{ marginBottom: '12px', fontSize: '13px', letterSpacing: '0.05em', color: 'var(--green-dark)' }}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

function SummaryGrid({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');

  useEffect(() => {
    if (!params?.id) return;
    api.get<any>(`/solar-project/${params.id}`)
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <Stack gap={6} style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Skeleton height={40} />
        <Skeleton height={200} />
      </Stack>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Text variant="h2">Projeto não encontrado</Text>
        <Button variant="secondary" onClick={() => router.push('/solar-project')} style={{ marginTop: '16px' }}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  const tabs = [
    { key: 'resumo', label: 'Resumo' },
    { key: 'equipamentos', label: 'Equipamentos' },
    { key: 'cotacoes', label: 'Cotações' },
    { key: 'propostas', label: 'Propostas' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <Stack gap={6}>
        <PageHeader
          title={project.clientName || 'Projeto sem nome'}
          subtitle={project.clientCity || ''}
          beforeTitle={
            <button
              onClick={() => router.push('/solar-project')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          }
          actions={
            <Flex gap={3}>
              <Button variant="primary" size="md" onClick={() => router.push(`/workspace/${params.id}`)}>
                Workspace
              </Button>
            </Flex>
          }
        />

        {/* Status & timeline */}
        <Card padding="md">
          <Flex justify="between" align="center" style={{ marginBottom: '16px' }}>
            <Chip variant="default">{project.status}</Chip>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </Flex>
          <ProjectTimeline currentStatus={project.status} />
        </Card>

        {/* Summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          <SummaryGrid label="POTÊNCIA" value={project.sizingPowerKwp ? `${project.sizingPowerKwp.toFixed(2)} kWp` : undefined} />
          <SummaryGrid label="GERAÇÃO" value={project.sizingGenerationKwh ? `${project.sizingGenerationKwh.toFixed(0)} kWh/mês` : undefined} />
          <SummaryGrid label="MÓDULOS" value={project.sizingModuleQty ? `${project.sizingModuleQty}` : undefined} />
          <SummaryGrid label="VALOR" value={project.pricingFinalPrice ? formatBRL(Number(project.pricingFinalPrice)) : undefined} />
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'resumo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <SectionCard title="Cliente">
              <DetailRow label="Nome" value={project.clientName} />
              <DetailRow label="Documento" value={project.clientDocument} />
              <DetailRow label="Telefone" value={project.clientPhone} />
              <DetailRow label="Email" value={project.clientEmail} />
              <DetailRow label="Cidade" value={project.clientCity} />
              <DetailRow label="Estado" value={project.clientState} />
              <DetailRow label="Distribuidora" value={project.clientUtility} />
              <DetailRow label="Classe" value={project.clientClass} />
              <DetailRow label="Grupo Tarifário" value={project.clientTariffGroup} />
              <DetailRow label="Modalidade" value={project.clientModality} />
              <DetailRow label="Consultor" value={project.consultantName} />
            </SectionCard>

            <SectionCard title="Local">
              <DetailRow label="Endereço" value={project.siteAddress} />
              <DetailRow label="Latitude" value={project.siteLatitude} />
              <DetailRow label="Longitude" value={project.siteLongitude} />
              <DetailRow label="Telhado" value={project.siteRoofType} />
              <DetailRow label="Inclinação" value={project.siteInclination ? `${project.siteInclination}°` : undefined} />
              <DetailRow label="Azimute" value={project.siteAzimuth ? `${project.siteAzimuth}°` : undefined} />
            </SectionCard>

            <SectionCard title="Consumo">
              <DetailRow label="Consumo (kWh/mês)" value={project.consumptionMonthlyKwh ? `${project.consumptionMonthlyKwh} kWh` : undefined} />
              <DetailRow label="Conta (R$)" value={project.consumptionMonthlyBill ? formatBRL(project.consumptionMonthlyBill) : undefined} />
              <DetailRow label="Tarifa" value={project.consumptionTariff ? `R$ ${project.consumptionTariff.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}` : undefined} />
              <DetailRow label="Demanda" value={project.consumptionDemand} />
              <DetailRow label="Modalidade" value={project.consumptionModality} />
              <DetailRow label="Grupo" value={project.consumptionGroup} />
            </SectionCard>

            <SectionCard title="Dimensionamento">
              <DetailRow label="Potência" value={project.sizingPowerKwp ? `${project.sizingPowerKwp.toFixed(2)} kWp` : undefined} />
              <DetailRow label="Geração" value={project.sizingGenerationKwh ? `${project.sizingGenerationKwh.toFixed(0)} kWh` : undefined} />
              <DetailRow label="Irradiação" value={project.sizingIrradiation ? `${project.sizingIrradiation} kWh/m²/dia` : undefined} />
              <DetailRow label="Perdas" value={project.sizingLossFactor} />
              <DetailRow label="Módulos" value={project.sizingModuleQty} />
              <DetailRow label="Inversores" value={project.sizingInverterQty} />
            </SectionCard>

            <SectionCard title="Precificação">
              <DetailRow label="Custo Equip." value={project.pricingEquipmentCost ? formatBRL(project.pricingEquipmentCost) : undefined} />
              <DetailRow label="Mão de Obra" value={project.pricingLaborCost ? formatBRL(project.pricingLaborCost) : undefined} />
              <DetailRow label="Frete" value={project.pricingFreightCost ? formatBRL(project.pricingFreightCost) : undefined} />
              <DetailRow label="Margem" value={project.pricingMarginPct ? formatPercent(project.pricingMarginPct) : undefined} />
              <DetailRow label="Preço Final" value={project.pricingFinalPrice ? formatBRL(project.pricingFinalPrice) : undefined} />
            </SectionCard>

            <SectionCard title="Pagamento">
              <DetailRow label="Desconto à Vista" value={project.paymentCashDiscount ? formatPercent(project.paymentCashDiscount) : undefined} />
              <DetailRow label="Taxa Cartão" value={project.paymentCardTax ? formatPercent(project.paymentCardTax) : undefined} />
              <DetailRow label="Parcelas Cartão" value={project.paymentCardInstallments ? `${project.paymentCardInstallments}x` : undefined} />
              <DetailRow label="Taxa Financ." value={project.paymentFinanceTax ? formatPercent(project.paymentFinanceTax) : undefined} />
              <DetailRow label="Parcelas Financ." value={project.paymentFinanceInstallments ? `${project.paymentFinanceInstallments}x` : undefined} />
              <DetailRow label="Validade" value={project.paymentValidityDays ? `${project.paymentValidityDays} dias` : undefined} />
            </SectionCard>
          </div>
        )}

        {activeTab === 'equipamentos' && (
          <Card padding="md">
            <Stack gap={4}>
              <div>
                <Text variant="h3" style={{ marginBottom: '12px' }}>Módulos</Text>
                {project.equipmentModules?.length > 0 ? project.equipmentModules.map((m: any, i: number) => (
                  <Flex key={i} justify="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontWeight: 600 }}>{m.brand} {m.model}</span>
                    <span>{m.qty}x {formatBRL(Number(m.unitPrice))}</span>
                  </Flex>
                )) : <Text variant="body" color="secondary">Nenhum módulo cadastrado.</Text>}
              </div>
              <div>
                <Text variant="h3" style={{ marginBottom: '12px' }}>Inversores</Text>
                {project.equipmentInverters?.length > 0 ? project.equipmentInverters.map((inv: any, i: number) => (
                  <Flex key={i} justify="between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontWeight: 600 }}>{inv.brand} {inv.model}</span>
                    <span>{inv.qty}x {formatBRL(Number(inv.unitPrice))}</span>
                  </Flex>
                )) : <Text variant="body" color="secondary">Nenhum inversor cadastrado.</Text>}
              </div>
            </Stack>
          </Card>
        )}

        {activeTab === 'cotacoes' && (
          <Stack gap={4}>
            <Flex justify="between" align="center">
              <Text variant="h3">Cotações de Fornecedores</Text>
            </Flex>
            {project.quotes?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {project.quotes.map((q: any) => (
                  <Card key={q.id} padding="md" variant={q.selected ? 'highlight' : 'default'}>
                    <Stack gap={3}>
                      <Flex justify="between" align="center">
                        <Text variant="body-bold">{q.supplierName || 'Fornecedor'}</Text>
                        <Badge variant={q.selected ? 'success' : 'info'}>
                          {q.selected ? 'Selecionada' : q.status}
                        </Badge>
                      </Flex>
                      {q.quoteNumber && <Chip variant="default">#{q.quoteNumber}</Chip>}
                      <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)' }}>
                        {formatBRL(Number(q.totalAmount))}
                      </div>
                      <Flex gap={2} wrap style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {q.items?.length > 0 && <span>{q.items.length} itens</span>}
                        {q.paymentCondition && <span>· {q.paymentCondition}</span>}
                        {q.validUntil && <span>· Val: {q.validUntil}</span>}
                      </Flex>
                    </Stack>
                  </Card>
                ))}
              </div>
            ) : <Card padding="md"><Text variant="body" color="secondary">Nenhuma cotação cadastrada.</Text></Card>}
          </Stack>
        )}

        {activeTab === 'propostas' && (
          <Card padding="md">
            <Stack gap={4}>
              <Text variant="h3">Propostas</Text>
              {project.proposals?.length > 0 ? project.proposals.map((p: any) => (
                <Flex key={p.id} justify="between" style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontWeight: 600 }}>Proposta</span>
                  <span style={{ fontWeight: 700 }}>{formatBRL(Number(p.finalPrice))}</span>
                </Flex>
              )) : <Text variant="body" color="secondary">Nenhuma proposta vinculada.</Text>}
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
}
