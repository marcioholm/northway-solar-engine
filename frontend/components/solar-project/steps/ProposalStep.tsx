'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Card, Badge, Input } from '@/components/ui';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  StarIcon,
  PlusIcon,
  TrashIcon,
  BoltIcon,
  ExclamationTriangleIcon,
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
  scenarioType?: 'essential' | 'recommended' | 'expansion' | string;
  scenarioText?: string;
  targetConsumptionKwh?: number | null;
  systemPowerKwp: number;
  moduleQty: number;
  moduleDesc: string;
  inverterDesc: string;
  structureDesc: string;
  generationMonthlyKwh?: number | null;
  finalPrice: number;
  isCustomPrice?: boolean;
}

export interface FutureLoadCatalogItem {
  id: string;
  name: string;
  category?: string;
  powerKw?: number;
  fixedKwh?: number;
  defaultHoursPerDay?: number;
  defaultDaysPerMonth?: number;
}

export interface SelectedFutureLoad {
  id: string;
  name: string;
  powerKw?: number;
  fixedKwh?: number;
  hoursPerDay?: number;
  daysPerMonth?: number;
  quantity: number;
}

const DEFAULT_LOADS_CATALOG: FutureLoadCatalogItem[] = [
  { id: 'ac_inv_9000', name: 'Ar-condicionado inverter 9.000 BTU', category: 'Climatização', powerKw: 0.50, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_12000', name: 'Ar-condicionado inverter 12.000 BTU', category: 'Climatização', powerKw: 0.65, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_18000', name: 'Ar-condicionado inverter 18.000 BTU', category: 'Climatização', powerKw: 1.00, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_24000', name: 'Ar-condicionado inverter 24.000 BTU', category: 'Climatização', powerKw: 1.30, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_conv_12000', name: 'Ar-condicionado convencional 12.000 BTU', category: 'Climatização', powerKw: 1.10, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'carro_eletrico', name: 'Carro elétrico', category: 'Mobilidade', fixedKwh: 180, defaultHoursPerDay: 0, defaultDaysPerMonth: 30 },
  { id: 'chuveiro_5500', name: 'Chuveiro elétrico 5,5 kW', category: 'Eletrodomésticos', powerKw: 5.50, defaultHoursPerDay: 0.5, defaultDaysPerMonth: 30 },
  { id: 'bomba_piscina_750', name: 'Bomba de piscina 0,75 kW', category: 'Lazer', powerKw: 0.75, defaultHoursPerDay: 6, defaultDaysPerMonth: 30 },
];

export function ProposalStep({
  data,
  projectId,
}: {
  data: Record<string, any>;
  projectId?: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  // Dados do projeto
  const sizingPower = Number(data.sizingPowerKwp || 0);
  const sizingGen = Number(data.sizingGenerationKwh || 0);
  const consumoMedio = Number(data.consumptionMonthlyKwh || 0);
  const hasSizing = sizingPower > 0 && sizingGen > 0;
  const genFactor = hasSizing ? sizingGen / sizingPower : null;

  const modulePower =
    data.equipmentModules?.[0]?.power ||
    (data.sizingModuleQty && sizingPower
      ? Math.round((sizingPower * 1000) / data.sizingModuleQty)
      : 550);

  const moduleName =
    data.equipmentModules?.[0]?.model ||
    (data.equipmentModules?.[0]?.brand
      ? `${data.equipmentModules[0].brand} ${data.equipmentModules[0].model || ''}`.trim()
      : 'Módulos Fotovoltaicos');

  const inverterName =
    data.equipmentInverters?.[0]?.model ||
    (data.equipmentInverters?.[0]?.brand
      ? `${data.equipmentInverters[0].brand} ${data.equipmentInverters[0].model || ''}`.trim()
      : 'Inversor Solar');

  const baseFinalPrice = Number(data.pricingFinalPrice || 0);

  // Regras de dimensionamento
  const folgaPct = Number(data.proposalSettings?.sizingRules?.folgaPct ?? 10);
  const expansaoPct = Number(data.proposalSettings?.sizingRules?.expansaoPct ?? 25);

  // Catálogo de cargas futuras
  const [catalog, setCatalog] = useState<FutureLoadCatalogItem[]>(DEFAULT_LOADS_CATALOG);
  const [selectedLoads, setSelectedLoads] = useState<SelectedFutureLoad[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(DEFAULT_LOADS_CATALOG[1].id);

  // Opções / Cenários
  const [options, setOptions] = useState<ProposalKitOption[]>([]);

  // Carrega catálogo das configurações
  useEffect(() => {
    api
      .get<any>('/proposal-settings')
      .then((res) => {
        if (res?.futureLoads && Array.isArray(res.futureLoads) && res.futureLoads.length > 0) {
          setCatalog(res.futureLoads);
          setSelectedCatalogId(res.futureLoads[0].id);
        }
      })
      .catch(() => {
        // Fallback para padrão
      });
  }, []);

  // Calcula os 3 cenários
  useEffect(() => {
    if (!hasSizing || !genFactor) {
      if (data.proposalOptions && data.proposalOptions.length > 0) {
        setOptions(data.proposalOptions);
      } else {
        setOptions([
          {
            position: 1,
            name: 'Kit 1',
            recommended: true,
            systemPowerKwp: sizingPower,
            moduleQty: Number(data.sizingModuleQty || 0),
            moduleDesc: moduleName,
            inverterDesc: inverterName,
            structureDesc: '',
            generationMonthlyKwh: sizingGen > 0 ? sizingGen : null,
            finalPrice: baseFinalPrice,
            isCustomPrice: false,
          },
        ]);
      }
      return;
    }

    // Calcula total de cargas futuras
    const totalCargasKwh = selectedLoads.reduce((sum, l) => {
      const qty = l.quantity || 1;
      if (l.fixedKwh != null && Number(l.fixedKwh) > 0) {
        return sum + Number(l.fixedKwh) * qty;
      }
      const p = Number(l.powerKw) || 0;
      const h = Number(l.hoursPerDay) || 0;
      const d = Number(l.daysPerMonth) || 30;
      return sum + p * h * d * qty;
    }, 0);

    const activeLoads = selectedLoads.filter((l) => (l.quantity || 1) > 0);

    // 1. Essencial
    const targetEssencial = consumoMedio * 1.0;
    const kwpEssencial = targetEssencial / genFactor;
    const modQtyEssencial = Math.ceil((kwpEssencial * 1000) / modulePower);
    const powerEssencial = Number(((modQtyEssencial * modulePower) / 1000).toFixed(2));
    const genEssencial = Math.round(powerEssencial * genFactor);
    const priceEssencial =
      sizingPower > 0
        ? Math.round(baseFinalPrice * (powerEssencial / sizingPower))
        : baseFinalPrice;

    // 2. Recomendado
    const targetRecomendado = consumoMedio * (1 + folgaPct / 100);
    const kwpRecomendado = targetRecomendado / genFactor;
    const modQtyRecomendado = Math.ceil((kwpRecomendado * 1000) / modulePower);
    const powerRecomendado = Number(((modQtyRecomendado * modulePower) / 1000).toFixed(2));
    const genRecomendado = Math.round(powerRecomendado * genFactor);
    const priceRecomendado =
      sizingPower > 0
        ? Math.round(baseFinalPrice * (powerRecomendado / sizingPower))
        : baseFinalPrice;

    // 3. Expansão
    let targetExpansao: number;
    let textExpansao: string;
    if (activeLoads.length > 0 && totalCargasKwh > 0) {
      targetExpansao = (consumoMedio + totalCargasKwh) * (1 + folgaPct / 100);
      const summary = activeLoads
        .map((l) =>
          l.fixedKwh
            ? `${l.name} (${l.quantity}x)`
            : `${l.name} (${l.quantity}x, ${l.hoursPerDay} h/dia)`,
        )
        .join(', ');
      textExpansao = `Prevê +${Math.round(totalCargasKwh)} kWh/mês: ${summary}`;
    } else {
      targetExpansao = consumoMedio * (1 + expansaoPct / 100);
      textExpansao = `Prevê aumento de ${expansaoPct}% no consumo`;
    }
    const kwpExpansao = targetExpansao / genFactor;
    const modQtyExpansao = Math.ceil((kwpExpansao * 1000) / modulePower);
    const powerExpansao = Number(((modQtyExpansao * modulePower) / 1000).toFixed(2));
    const genExpansao = Math.round(powerExpansao * genFactor);
    const priceExpansao =
      sizingPower > 0
        ? Math.round(baseFinalPrice * (powerExpansao / sizingPower))
        : baseFinalPrice;

    setOptions((prev) => {
      // Preserva overrides manuais e nomes editados se existirem
      const opt1Prev = prev.find((o) => o.position === 1);
      const opt2Prev = prev.find((o) => o.position === 2);
      const opt3Prev = prev.find((o) => o.position === 3);

      return [
        {
          position: 1,
          name: opt1Prev?.name || 'Essencial',
          recommended: opt1Prev ? opt1Prev.recommended : false,
          scenarioType: 'essential',
          scenarioText: `Cobre seu consumo atual de ${Math.round(consumoMedio)} kWh/mês`,
          targetConsumptionKwh: targetEssencial,
          systemPowerKwp: powerEssencial,
          moduleQty: modQtyEssencial,
          moduleDesc: moduleName,
          inverterDesc: inverterName,
          structureDesc: '',
          generationMonthlyKwh: genEssencial,
          finalPrice: opt1Prev?.isCustomPrice ? opt1Prev.finalPrice : priceEssencial,
          isCustomPrice: opt1Prev?.isCustomPrice || false,
        },
        {
          position: 2,
          name: opt2Prev?.name || 'Recomendado',
          recommended: opt2Prev ? opt2Prev.recommended : true,
          scenarioType: 'recommended',
          scenarioText: `Inclui ${folgaPct}% de folga para a perda natural dos painéis`,
          targetConsumptionKwh: targetRecomendado,
          systemPowerKwp: powerRecomendado,
          moduleQty: modQtyRecomendado,
          moduleDesc: moduleName,
          inverterDesc: inverterName,
          structureDesc: '',
          generationMonthlyKwh: genRecomendado,
          finalPrice: opt2Prev?.isCustomPrice ? opt2Prev.finalPrice : priceRecomendado,
          isCustomPrice: opt2Prev?.isCustomPrice || false,
        },
        {
          position: 3,
          name: opt3Prev?.name || 'Expansão',
          recommended: opt3Prev ? opt3Prev.recommended : false,
          scenarioType: 'expansion',
          scenarioText: textExpansao,
          targetConsumptionKwh: targetExpansao,
          systemPowerKwp: powerExpansao,
          moduleQty: modQtyExpansao,
          moduleDesc: moduleName,
          inverterDesc: inverterName,
          structureDesc: '',
          generationMonthlyKwh: genExpansao,
          finalPrice: opt3Prev?.isCustomPrice ? opt3Prev.finalPrice : priceExpansao,
          isCustomPrice: opt3Prev?.isCustomPrice || false,
        },
      ];
    });
  }, [hasSizing, genFactor, consumoMedio, modulePower, baseFinalPrice, folgaPct, expansaoPct, selectedLoads]);

  // Checklist
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

  const handleSetRecommended = (index: number) => {
    setOptions(
      options.map((opt, i) => ({
        ...opt,
        recommended: i === index,
      })),
    );
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
    } else {
      (opt as any)[field] = value;
    }

    updated[index] = opt;
    setOptions(updated);
  };

  // Gerenciamento de Cargas Futuras
  const handleAddLoad = () => {
    const item = catalog.find((c) => c.id === selectedCatalogId);
    if (!item) return;

    const existingIdx = selectedLoads.findIndex((l) => l.id === item.id);
    if (existingIdx >= 0) {
      const copy = [...selectedLoads];
      copy[existingIdx].quantity = (copy[existingIdx].quantity || 1) + 1;
      setSelectedLoads(copy);
    } else {
      setSelectedLoads([
        ...selectedLoads,
        {
          id: item.id,
          name: item.name,
          powerKw: item.powerKw,
          fixedKwh: item.fixedKwh,
          hoursPerDay: item.defaultHoursPerDay ?? 8,
          daysPerMonth: item.defaultDaysPerMonth ?? 30,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveLoad = (idx: number) => {
    setSelectedLoads(selectedLoads.filter((_, i) => i !== idx));
  };

  const handleUpdateLoad = (idx: number, field: keyof SelectedFutureLoad, val: any) => {
    const copy = [...selectedLoads];
    (copy[idx] as any)[field] = val;
    setSelectedLoads(copy);
  };

  const totalCargasKwh = selectedLoads.reduce((sum, l) => {
    const qty = l.quantity || 1;
    if (l.fixedKwh != null && Number(l.fixedKwh) > 0) {
      return sum + Number(l.fixedKwh) * qty;
    }
    const p = Number(l.powerKw) || 0;
    const h = Number(l.hoursPerDay) || 0;
    const d = Number(l.daysPerMonth) || 30;
    return sum + p * h * d * qty;
  }, 0);

  // Avisos (não bloqueiam)
  const maxKwp = options.length > 0
    ? Math.max(...options.map((o) => Number(o.systemPowerKwp || 0)))
    : sizingPower;

  const hasExceeding130 = options.some(
    (o) => consumoMedio > 0 && Number(o.generationMonthlyKwh || 0) > consumoMedio * 1.3,
  );

  const handleGenerateProposal = async () => {
    if (!projectId) return;
    setGenerating(true);
    try {
      const proposal = await api.post<any>(`/proposals/generate/${projectId}`, {
        options,
        futureLoads: selectedLoads,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
          Cenários de Consumo & Proposta Comercial
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          O sistema dimensiona automaticamente os 3 cenários de consumo calculados pelo servidor: Essencial, Recomendado e Expansão.
        </p>
      </div>

      {/* Aviso quando o projeto não tem dimensionamento */}
      {!hasSizing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            background: '#FEF3C7',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #FCD34D',
          }}
        >
          <ExclamationTriangleIcon
            className="w-6 h-6"
            style={{ color: '#D97706', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 700, color: '#92400E' }}>
              Projeto sem dimensionamento
            </div>
            <div style={{ color: '#B45309', fontSize: '13px' }}>
              Realize o dimensionamento na etapa anterior para gerar os cenários de consumo automaticamente sem inventar números.
            </div>
          </div>
        </div>
      )}

      {/* ── SEÇÃO: CARGAS FUTURAS (CENÁRIO EXPANSÃO) ── */}
      {hasSizing && (
        <div
          style={{
            background: 'var(--surface)',
            padding: '20px 24px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BoltIcon className="w-5 h-5 text-amber-500" />
                <span style={{ fontSize: '15px', fontWeight: 700 }}>
                  Cargas Futuras (Cenário Expansão)
                </span>
                {totalCargasKwh > 0 && (
                  <Badge variant="success">+{Math.round(totalCargasKwh)} kWh/mês</Badge>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>
                Simule novos aparelhos para calcular o dimensionamento do kit de Expansão.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: '12px',
                }}
              >
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.fixedKwh ? `(${c.fixedKwh} kWh)` : `(${c.powerKw} kW)`}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddLoad}
              >
                Adicionar carga
              </Button>
            </div>
          </div>

          {selectedLoads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {selectedLoads.map((load, idx) => {
                const itemKwh = load.fixedKwh
                  ? load.fixedKwh * (load.quantity || 1)
                  : (load.powerKw || 0) * (load.hoursPerDay || 0) * 30 * (load.quantity || 1);

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 80px 100px 120px 32px',
                      gap: 12,
                      alignItems: 'center',
                      background: 'var(--background)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{load.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={load.quantity}
                        onChange={(e) =>
                          handleUpdateLoad(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))
                        }
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                        }}
                      />
                      <span>un</span>
                    </div>
                    <div>
                      {load.fixedKwh ? (
                        <span style={{ color: 'var(--text-secondary)' }}>Fixo</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="24"
                            value={load.hoursPerDay}
                            onChange={(e) =>
                              handleUpdateLoad(idx, 'hoursPerDay', Number(e.target.value) || 0)
                            }
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              borderRadius: 4,
                              border: '1px solid var(--border)',
                            }}
                          />
                          <span>h/d</span>
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--sec)', textAlign: 'right' }}>
                      +{Math.round(itemKwh)} kWh/mês
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLoad(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger, #ef4444)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--background)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--border)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              Nenhuma carga futura selecionada. O cenário de Expansão utilizará o acréscimo padrão de {expansaoPct}% no consumo.
            </div>
          )}
        </div>
      )}

      {/* ── SEÇÃO: CENÁRIOS DE CONSUMO (3 OPÇÕES) ── */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>
              Cenários de Consumo na Proposta ({options.length}/3)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Dimensionamento calculado pelo servidor para cada meta de consumo. Apenas uma opção pode ser recomendada.
            </div>
          </div>
        </div>

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
              {/* Cabeçalho do Cenário */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleSetRecommended(idx)}
                    title={
                      opt.recommended
                        ? 'Cenário Recomendado'
                        : 'Marcar como cenário recomendado'
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
                      fontSize: '15px',
                      fontWeight: 700,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text)',
                      outline: 'none',
                      padding: '2px 4px',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                {opt.recommended && (
                  <Badge variant="success">Recomendado</Badge>
                )}
              </div>

              {/* Texto do Cenário */}
              {opt.scenarioText && (
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--sec)',
                    background: 'var(--surface-highlight, rgba(245, 158, 11, 0.08))',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius)',
                    lineHeight: 1.3,
                  }}
                >
                  {opt.scenarioText}
                </div>
              )}

              {/* Especificações Técnicas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'var(--background)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Potência:</span>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>
                    {opt.systemPowerKwp.toFixed(2)} kWp
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Módulos:</span>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>
                    {opt.moduleQty} un
                  </div>
                </div>
                {opt.generationMonthlyKwh && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Geração est.:</span>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--green-dark)' }}>
                      {Math.round(opt.generationMonthlyKwh)} kWh/mês
                    </div>
                  </div>
                )}
                {opt.targetConsumptionKwh && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Meta:</span>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>
                      {Math.round(opt.targetConsumptionKwh)} kWh/mês
                    </div>
                  </div>
                )}
              </div>

              {/* Equipamentos */}
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div><b>Inversor:</b> {opt.inverterDesc || 'Inversor dimensionado'}</div>
                <div><b>Módulos:</b> {opt.moduleDesc || 'Módulos de alta eficiência'}</div>
              </div>

              {/* Preço Final */}
              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
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

        {/* Avisos Técnicos e Regulatórios (não bloqueiam) */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '12px',
              color: 'var(--text-secondary)',
              background: 'var(--background)',
              padding: '8px 12px',
              borderRadius: 'var(--radius)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>Aviso Técnico:</span>
            <span>Confirme se o padrão de entrada comporta {maxKwp.toFixed(2)} kWp.</span>
          </div>

          {hasExceeding130 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '12px',
                color: '#92400E',
                background: '#FEF3C7',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid #FCD34D',
              }}
            >
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Créditos excedentes vencem em 60 meses (Lei 14.300, art. 13).</span>
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      {!allComplete && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
            <div style={{ fontWeight: 700, color: '#991B1B' }}>
              Etapas pendentes
            </div>
            <div style={{ color: '#7F1D1D', fontSize: '13px' }}>
              Preencha todas as etapas obrigatórias antes de gerar a proposta.
            </div>
          </div>
        </div>
      )}

      {allComplete && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
            <div style={{ fontWeight: 700, color: '#065F46' }}>
              Projeto completo
            </div>
            <div style={{ color: '#065F46', fontSize: '13px' }}>
              Todas as etapas obrigatórias foram preenchidas. Você já pode gerar a proposta.
            </div>
          </div>
        </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: done ? 'var(--green-dark)' : 'var(--text)',
                  }}
                >
                  {done ? '✓' : '○'} {mod}
                </div>
                <div
                  style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                >
                  {done
                    ? `${required} campos preenchidos`
                    : `${filled}/${required} campos`}
                </div>
              </div>
              <Badge variant={done ? 'success' : canSkip ? 'warning' : 'danger'}>
                {done ? 'OK' : canSkip ? 'Opcional' : 'Pendente'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </div>
      </div>
    </div>
  );
}
