'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { formatBRL, formatPercent } from '../../../lib/format';
import { api } from '../../../lib/api';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface RequiredField {
  key: string;
  label: string;
  value: any;
  module: string;
}

export interface ProposalKitOption {
  position: number;
  name: string;
  recommended: boolean;
  systemPowerKwp: number;
  moduleQty: number;
  moduleDesc: string;
  inverterDesc: string;
  structureDesc: string;
  generationMonthlyKwh?: number | null;
  finalPrice: number;
  isCustomPrice?: boolean;
}

export function ProposalStep({
  data,
  projectId,
}: {
  data: Record<string, any>;
  projectId?: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  // Fator de geração proporcional: kWh/mês por kWp
  const sizingPower = Number(data.sizingPowerKwp || 0);
  const sizingGen = Number(data.sizingGenerationKwh || 0);
  const genFactor =
    sizingPower > 0 && sizingGen > 0 ? sizingGen / sizingPower : null;

  // Inicializa opções (até 3)
  const initialOptions: ProposalKitOption[] = [
    {
      position: 1,
      name: 'Kit 1',
      recommended: true,
      systemPowerKwp: sizingPower,
      moduleQty: Number(data.sizingModuleQty || 0),
      moduleDesc:
        data.equipmentModules?.[0]?.model ||
        (data.equipmentModules?.[0]?.brand
          ? `${data.equipmentModules[0].brand} ${data.equipmentModules[0].model || ''}`.trim()
          : 'Módulo Fotovoltaico'),
      inverterDesc:
        data.equipmentInverters?.[0]?.model ||
        (data.equipmentInverters?.[0]?.brand
          ? `${data.equipmentInverters[0].brand} ${data.equipmentInverters[0].model || ''}`.trim()
          : 'Inversor Solar'),
      structureDesc: data.siteRoofType
        ? `Estrutura para ${data.siteRoofType}`
        : 'Estrutura completa em alumínio',
      generationMonthlyKwh: sizingGen > 0 ? sizingGen : null,
      finalPrice: Number(data.pricingFinalPrice || 0),
      isCustomPrice: false,
    },
  ];

  const [options, setOptions] = useState<ProposalKitOption[]>(
    data.proposalOptions && data.proposalOptions.length > 0
      ? data.proposalOptions
      : initialOptions,
  );

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

  const completed = fields.filter(
    (f) => f.value !== undefined && f.value !== '' && f.value !== null && f.value !== 0,
  );
  const missing = fields.filter(
    (f) => f.value === undefined || f.value === '' || f.value === null || f.value === 0,
  );
  const allComplete = missing.length === 0;

  const modulesComplete = [
    'Cliente',
    'Local',
    'Consumo',
    'Dimensionamento',
    'Cotações',
    'Custos',
    'Precificação',
    'Pagamentos',
  ].map((mod) => {
    const modFields = fields.filter((f) => f.module === mod);
    const done = modFields.every(
      (f) => f.value !== undefined && f.value !== '' && f.value !== null && f.value !== 0,
    );
    const canSkip = mod === 'Cotações';
    return {
      mod,
      done,
      required: modFields.length,
      filled: modFields.filter(
        (f) => f.value !== undefined && f.value !== '' && f.value !== null && f.value !== 0,
      ).length,
      canSkip,
    };
  });

  // Duplicar opção para criar Kit 2 ou Kit 3 (máximo 3)
  const handleAddOption = (sourceIndex?: number) => {
    if (options.length >= 3) return;
    const src =
      sourceIndex !== undefined && options[sourceIndex]
        ? options[sourceIndex]
        : options[options.length - 1];

    const nextPos = options.length + 1;
    const newOption: ProposalKitOption = {
      ...src,
      position: nextPos,
      name: `Kit ${nextPos}`,
      recommended: false,
      isCustomPrice: false,
    };

    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const removedWasRec = options[index].recommended;
    const updated = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({
        ...opt,
        position: i + 1,
      }));

    if (removedWasRec && updated.length > 0) {
      updated[0].recommended = true;
    }

    setOptions(updated);
  };

  const handleSetRecommended = (index: number) => {
    setOptions(
      options.map((opt, i) => ({
        ...opt,
        recommended: i === index,
      })),
    );
  };

  const handleMoveOption = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= options.length) return;

    const copy = [...options];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((opt, i) => ({
      ...opt,
      position: i + 1,
    }));

    setOptions(reordered);
  };

  const handleUpdateOption = (
    index: number,
    field: keyof ProposalKitOption,
    value: any,
  ) => {
    const updated = [...options];
    const opt = { ...updated[index] };

    if (field === 'finalPrice') {
      opt.finalPrice = Number(value) || 0;
      opt.isCustomPrice = true;
    } else if (field === 'systemPowerKwp') {
      const p = Number(value) || 0;
      opt.systemPowerKwp = p;
      opt.generationMonthlyKwh =
        genFactor && p > 0 ? Math.round(p * genFactor) : null;
    } else {
      (opt as any)[field] = value;
    }

    updated[index] = opt;
    setOptions(updated);
  };

  const handleGenerateProposal = async () => {
    if (!projectId) return;
    setGenerating(true);
    try {
      const proposal = await api.post<any>(`/proposals/generate/${projectId}`, {
        options,
        payment: data.paymentSettings,
      });
      router.push(`/proposta/${proposal.publicToken}`);
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
        <Text variant="h3">Gerar Proposta Comercial</Text>
        <Text variant="body" color="secondary">
          Configure até 3 opções de kit para o cliente e revise o checklist
          antes de gerar a proposta.
        </Text>
      </div>

      {/* ── SEÇÃO DE OPÇÕES DE KIT (1 A 3 OPÇÕES) ── */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
        }}
      >
        <Flex justify="between" align="center" style={{ marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>
              Opções de Kit da Proposta ({options.length}/3)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Apresente até 3 alternativas para o cliente escolher na proposta comercial.
            </div>
          </div>
          {options.length < 3 && (
            <Button
              variant="secondary"
              size="md"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => handleAddOption()}
            >
              Adicionar opção
            </Button>
          )}
        </Flex>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              options.length === 1
                ? '1fr'
                : options.length === 2
                ? '1fr 1fr'
                : '1fr 1fr 1fr',
            gap: '16px',
          }}
        >
          {options.map((opt, idx) => (
            <Card
              key={opt.position}
              padding="md"
              variant={opt.recommended ? 'highlight' : 'default'}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor: opt.recommended ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {/* Cabeçalho do Kit */}
              <Flex justify="between" align="center">
                <Flex align="center" gap={2}>
                  <button
                    type="button"
                    onClick={() => handleSetRecommended(idx)}
                    title={
                      opt.recommended
                        ? 'Kit Recomendado'
                        : 'Marcar como kit recomendado'
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 2,
                    }}
                  >
                    {opt.recommended ? (
                      <StarSolidIcon
                        className="w-5 h-5"
                        style={{ color: '#F59E0B' }}
                      />
                    ) : (
                      <StarIcon
                        className="w-5 h-5"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    )}
                  </button>
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) =>
                      handleUpdateOption(idx, 'name', e.target.value)
                    }
                    style={{
                      fontWeight: 800,
                      fontSize: '15px',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      width: '130px',
                    }}
                  />
                </Flex>

                <Flex align="center" gap={1}>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveOption(idx, 'up')}
                      title="Mover para a esquerda"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <ArrowUpIcon className="w-4 h-4 transform -rotate-90 text-gray-500 hover:text-black" />
                    </button>
                  )}
                  {idx < options.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveOption(idx, 'down')}
                      title="Mover para a direita"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <ArrowDownIcon className="w-4 h-4 transform -rotate-90 text-gray-500 hover:text-black" />
                    </button>
                  )}
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      title="Remover opção"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#EF4444',
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </Flex>
              </Flex>

              {opt.recommended && (
                <div style={{ display: 'inline-flex' }}>
                  <Badge variant="success">Recomendado</Badge>
                </div>
              )}

              {/* Campos do Kit */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}
              >
                <Input
                  label="Qtd Módulos"
                  variant="number"
                  value={opt.moduleQty ?? ''}
                  onChange={(v) =>
                    handleUpdateOption(idx, 'moduleQty', Number(v))
                  }
                />
                <Input
                  label="Potência (kWp)"
                  variant="number"
                  value={opt.systemPowerKwp ?? ''}
                  onChange={(v) => handleUpdateOption(idx, 'systemPowerKwp', v)}
                />
              </div>

              <Input
                label="Módulo"
                value={opt.moduleDesc ?? ''}
                onChange={(v) => handleUpdateOption(idx, 'moduleDesc', v)}
              />

              <Input
                label="Inversor"
                value={opt.inverterDesc ?? ''}
                onChange={(v) => handleUpdateOption(idx, 'inverterDesc', v)}
              />

              <Input
                label="Estrutura de Fixação"
                value={opt.structureDesc ?? ''}
                onChange={(v) => handleUpdateOption(idx, 'structureDesc', v)}
              />

              {/* Geração Mensal Estimada */}
              <div
                style={{
                  background: 'var(--surface-hover)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  GERAÇÃO ESTIMADA*
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>
                  {opt.generationMonthlyKwh != null && opt.generationMonthlyKwh > 0
                    ? `${opt.generationMonthlyKwh} kWh/mês (estimada)`
                    : '—'}
                </div>
              </div>

              {/* Preço Final */}
              <div>
                <Input
                  label="Preço Final (R$)"
                  variant="number"
                  value={opt.finalPrice ?? ''}
                  onChange={(v) => handleUpdateOption(idx, 'finalPrice', v)}
                />
                {opt.isCustomPrice && (
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      Preço editado manualmente
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Checklist */}
      {!allComplete && (
        <Flex
          gap={3}
          style={{
            padding: '16px 20px',
            background: '#FEF0EF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #FECACA',
          }}
        >
          <ExclamationCircleIcon
            className="w-6 h-6"
            style={{ color: '#DC2626', flexShrink: 0 }}
          />
          <div>
            <Text variant="body-bold" style={{ color: '#991B1B' }}>
              Etapas pendentes
            </Text>
            <Text variant="body" style={{ color: '#7F1D1D', fontSize: '13px' }}>
              Preencha todas as etapas obrigatórias antes de gerar a proposta.
            </Text>
          </div>
        </Flex>
      )}

      {allComplete && (
        <Flex
          gap={3}
          style={{
            padding: '16px 20px',
            background: '#ECFDF5',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #A7F3D0',
          }}
        >
          <CheckCircleIcon
            className="w-6 h-6"
            style={{ color: '#059669', flexShrink: 0 }}
          />
          <div>
            <Text variant="body-bold" style={{ color: '#065F46' }}>
              Projeto completo
            </Text>
            <Text variant="body" style={{ color: '#065F46', fontSize: '13px' }}>
              Todas as etapas obrigatórias foram preenchidas. Você já pode gerar a proposta.
            </Text>
          </div>
        </Flex>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {modulesComplete.map(({ mod, done, filled, required, canSkip }) => (
          <Card
            key={mod}
            padding="md"
            variant="default"
            style={{
              opacity: done ? 1 : 0.6,
              borderColor: done ? 'var(--green)' : 'var(--line)',
            }}
          >
            <Flex justify="between" align="center">
              <div>
                <Text
                  variant="body-bold"
                  style={{
                    fontSize: '14px',
                    color: done ? 'var(--green-dark)' : 'var(--text)',
                  }}
                >
                  {done ? '✓' : '○'} {mod}
                </Text>
                <Text
                  variant="body"
                  color="secondary"
                  style={{ fontSize: '11px' }}
                >
                  {done
                    ? `${required} campos preenchidos`
                    : `${filled}/${required} campos`}
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
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              CAMPOS PREENCHIDOS
            </div>
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
