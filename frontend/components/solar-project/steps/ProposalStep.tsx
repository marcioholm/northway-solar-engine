'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { formatBRL, formatPercent } from '../../../lib/format';
import { api } from '../../../lib/api';
import { CheckCircleIcon, ExclamationCircleIcon, DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface RequiredField {
  key: string;
  label: string;
  value: any;
  module: string;
}

export function ProposalStep({ data, projectId }: { data: Record<string, any>; projectId?: string }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const fields: RequiredField[] = [
    { key: 'clientName', label: 'Nome do Cliente', value: data.clientName, module: 'Cliente' },
    { key: 'clientDocument', label: 'CPF/CNPJ', value: data.clientDocument, module: 'Cliente' },
    { key: 'clientPhone', label: 'Telefone', value: data.clientPhone, module: 'Cliente' },
    { key: 'clientEmail', label: 'Email', value: data.clientEmail, module: 'Cliente' },
    { key: 'siteAddress', label: 'Endereço', value: data.siteAddress, module: 'Local' },
    { key: 'siteRoofType', label: 'Tipo de Telhado', value: data.siteRoofType, module: 'Local' },
    { key: 'consumptionMonthlyKwh', label: 'Consumo Mensal', value: data.consumptionMonthlyKwh, module: 'Consumo' },
    { key: 'consumptionTariff', label: 'Tarifa', value: data.consumptionTariff, module: 'Consumo' },
    { key: 'sizingPowerKwp', label: 'Potência do Sistema', value: data.sizingPowerKwp, module: 'Dimensionamento' },
    { key: 'sizingGenerationKwh', label: 'Geração Mensal', value: data.sizingGenerationKwh, module: 'Dimensionamento' },
    { key: 'sizingModuleQty', label: 'Qtd. Módulos', value: data.sizingModuleQty, module: 'Dimensionamento' },
    { key: 'pricingFinalPrice', label: 'Preço Final', value: data.pricingFinalPrice, module: 'Precificação' },
    { key: 'pricingMarginPct', label: 'Margem', value: data.pricingMarginPct, module: 'Precificação' },
    { key: 'paymentValidityDays', label: 'Validade', value: data.paymentValidityDays, module: 'Pagamentos' },
  ];

  const completed = fields.filter(f => f.value !== undefined && f.value !== '' && f.value !== null && f.value !== 0);
  const missing = fields.filter(f => f.value === undefined || f.value === '' || f.value === null || f.value === 0);
  const allComplete = missing.length === 0;

  const modulesComplete = ['Cliente', 'Local', 'Consumo', 'Dimensionamento', 'Cotações', 'Custos', 'Precificação', 'Pagamentos']
    .map(mod => {
      const modFields = fields.filter(f => f.module === mod);
      const done = modFields.every(f => f.value !== undefined && f.value !== '' && f.value !== null && f.value !== 0);
      const canSkip = mod === 'Cotações';
      return { mod, done, required: modFields.length, filled: modFields.filter(f => f.value !== undefined && f.value !== '' && f.value !== null && f.value !== 0).length, canSkip };
    });

  const handleGenerateProposal = async () => {
    if (!projectId) return;
    setGenerating(true);
    try {
      const proposal = await api.post<any>(`/proposals/generate/${projectId}`);
      router.push(`/proposta/${proposal.id}`);
    } catch (err) {
      console.error('Error generating proposal:', err);
      alert('Erro ao gerar proposta. Verifique o console.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Stack gap={6}>
      <div>
        <Text variant="h3">Gerar Proposta</Text>
        <Text variant="body" color="secondary">Revise o checklist antes de gerar a proposta comercial.</Text>
      </div>

      {!allComplete && (
        <Flex gap={3} style={{
          padding: '16px 20px', background: '#FEF0EF', borderRadius: 'var(--radius-xl)',
          border: '1px solid #FECACA',
        }}>
          <ExclamationCircleIcon className="w-6 h-6" style={{ color: '#DC2626', flexShrink: 0 }} />
          <div>
            <Text variant="body-bold" style={{ color: '#991B1B' }}>Etapas pendentes</Text>
            <Text variant="body" style={{ color: '#7F1D1D', fontSize: '13px' }}>
              Preencha todas as etapas obrigatórias antes de gerar a proposta.
            </Text>
          </div>
        </Flex>
      )}

      {allComplete && (
        <Flex gap={3} style={{
          padding: '16px 20px', background: '#ECFDF5', borderRadius: 'var(--radius-xl)',
          border: '1px solid #A7F3D0',
        }}>
          <CheckCircleIcon className="w-6 h-6" style={{ color: '#059669', flexShrink: 0 }} />
          <div>
            <Text variant="body-bold" style={{ color: '#065F46' }}>Projeto completo</Text>
            <Text variant="body" style={{ color: '#065F46', fontSize: '13px' }}>
              Todas as etapas obrigatórias foram preenchidas. Você já pode gerar a proposta.
            </Text>
          </div>
        </Flex>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {modulesComplete.map(({ mod, done, filled, required, canSkip }) => (
          <Card key={mod} padding="md" variant={done ? 'default' : 'default'} style={{
            opacity: done ? 1 : 0.6,
            borderColor: done ? 'var(--green)' : 'var(--line)',
          }}>
            <Flex justify="between" align="center">
              <div>
                <Text variant="body-bold" style={{ fontSize: '14px', color: done ? 'var(--green-dark)' : 'var(--text)' }}>
                  {done ? '✓' : '○'} {mod}
                </Text>
                <Text variant="body" color="secondary" style={{ fontSize: '11px' }}>
                  {done ? `${required} campos preenchidos` : `${filled}/${required} campos`}
                </Text>
              </div>
              <Badge variant={done ? 'success' : canSkip ? 'warning' : 'danger'}>
                {done ? 'OK' : canSkip ? 'Opcional' : 'Pendente'}
              </Badge>
            </Flex>
          </Card>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
        <Flex justify="between" align="center">
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>CAMPOS PREENCHIDOS</div>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>
              {completed.length}/{fields.length}
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            disabled={!allComplete}
            loading={generating}
            icon={<DocumentTextIcon className="w-5 h-5" />}
            onClick={handleGenerateProposal}
          >
            Gerar Proposta Comercial
          </Button>
        </Flex>
      </div>
    </Stack>
  );
}
