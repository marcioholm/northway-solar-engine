'use client';

import { useEffect, useState } from 'react';
import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { formatBRL } from '../../../lib/format';
import { api } from '../../../lib/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface FinanceOption {
  n: number;
  totalMarkupPct: number;
}

export interface ProposalPaymentCustomSettings {
  cashDiscountPct?: number;
  card?: {
    installments?: number;
    totalMarkupPct?: number;
  };
  finance?: FinanceOption[];
  own?: {
    downPaymentPct?: number;
    installments?: number;
  };
}

interface PaymentData {
  paymentCashDiscount?: number;
  paymentCardTax?: number;
  paymentCardInstallments?: number;
  paymentFinanceTax?: number;
  paymentFinanceInstallments?: number;
  paymentValidityDays?: number;
  pricingFinalPrice?: number;
  paymentSettings?: ProposalPaymentCustomSettings;
}

export function PaymentStep({
  data,
  onChange,
}: {
  data: Partial<PaymentData>;
  onChange: (d: Partial<PaymentData>) => void;
}) {
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  // Inicializa com padrões da empresa caso paymentSettings ainda não exista
  useEffect(() => {
    if (!data.paymentSettings) {
      setLoadingDefaults(true);
      api
        .get<any>('/proposal-settings')
        .then((settings) => {
          const defaults = settings?.paymentDefaults;
          const initial: ProposalPaymentCustomSettings = {
            cashDiscountPct:
              defaults?.cashDiscountPct ?? data.paymentCashDiscount ?? 5,
            card: defaults?.card ?? {
              installments: data.paymentCardInstallments ?? 12,
              totalMarkupPct: data.paymentCardTax ?? 15,
            },
            finance: defaults?.finance ?? [
              { n: 24, totalMarkupPct: 18 },
              { n: 36, totalMarkupPct: 28 },
              { n: 48, totalMarkupPct: 38 },
              { n: 60, totalMarkupPct: 48 },
            ],
            own: defaults?.own ?? {
              downPaymentPct: 30,
              installments: 6,
            },
          };
          onChange({
            ...data,
            paymentSettings: initial,
            paymentCashDiscount: initial.cashDiscountPct,
            paymentCardTax: initial.card?.totalMarkupPct,
            paymentCardInstallments: initial.card?.installments,
            paymentFinanceTax: initial.finance?.[0]?.totalMarkupPct,
            paymentFinanceInstallments: initial.finance?.[0]?.n,
            paymentValidityDays: data.paymentValidityDays ?? 10,
          });
        })
        .catch(() => {
          // Fallback caso falhe carregar
          const initial: ProposalPaymentCustomSettings = {
            cashDiscountPct: data.paymentCashDiscount ?? 5,
            card: {
              installments: data.paymentCardInstallments ?? 12,
              totalMarkupPct: data.paymentCardTax ?? 15,
            },
            finance: [
              { n: 24, totalMarkupPct: 18 },
              { n: 36, totalMarkupPct: 28 },
              { n: 48, totalMarkupPct: 38 },
              { n: 60, totalMarkupPct: 48 },
            ],
            own: { downPaymentPct: 30, installments: 6 },
          };
          onChange({
            ...data,
            paymentSettings: initial,
            paymentValidityDays: data.paymentValidityDays ?? 10,
          });
        })
        .finally(() => setLoadingDefaults(false));
    }
  }, []);

  const pSettings = data.paymentSettings || {};
  const finalPrice = data.pricingFinalPrice || 0;

  const updateSettings = (updated: Partial<ProposalPaymentCustomSettings>) => {
    const next = { ...pSettings, ...updated };
    onChange({
      ...data,
      paymentSettings: next,
      paymentCashDiscount: next.cashDiscountPct,
      paymentCardTax: next.card?.totalMarkupPct,
      paymentCardInstallments: next.card?.installments,
      paymentFinanceTax: next.finance?.[0]?.totalMarkupPct,
      paymentFinanceInstallments: next.finance?.[0]?.n,
    });
  };

  // Cálculos para o preview
  const cashDiscount = pSettings.cashDiscountPct ?? 0;
  const cashPrice =
    cashDiscount > 0 ? finalPrice * (1 - cashDiscount / 100) : finalPrice;

  const cardN = pSettings.card?.installments ?? 0;
  const cardMarkup = pSettings.card?.totalMarkupPct ?? 0;
  const cardTotal = finalPrice * (1 + cardMarkup / 100);
  const cardMonthly = cardN > 0 ? cardTotal / cardN : 0;

  const ownDownPct = pSettings.own?.downPaymentPct ?? 0;
  const ownDownValue = finalPrice * (ownDownPct / 100);
  const ownRemaining = Math.max(0, finalPrice - ownDownValue);
  const ownBoletos = pSettings.own?.installments ?? 0;
  const ownMonthly = ownBoletos > 0 ? ownRemaining / ownBoletos : 0;

  return (
    <Stack gap={6}>
      <div>
        <Text variant="h3">Condições de Pagamento</Text>
        <Text variant="body" color="secondary">
          Configure as opções comerciais para esta proposta. Padrões da empresa
          já foram pré-carregados.
        </Text>
      </div>

      {finalPrice > 0 && (
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}
          >
            PRÉ-VISUALIZAÇÃO COM BASE NO VALOR TOTAL ({formatBRL(finalPrice)})
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {/* À Vista */}
            <Card padding="md" variant="highlight">
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--green-dark)',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                À VISTA
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: 'var(--green-dark)',
                }}
              >
                {formatBRL(cashPrice)}
              </div>
              {cashDiscount > 0 && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--green-dark)',
                    opacity: 0.8,
                    marginTop: '4px',
                  }}
                >
                  {cashDiscount}% de desconto
                </div>
              )}
            </Card>

            {/* Cartão */}
            {cardN > 0 && (
              <Card padding="md">
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                  }}
                >
                  CARTÃO DE CRÉDITO
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>
                  {cardN}x de {formatBRL(cardMonthly)}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                  }}
                >
                  Total: {formatBRL(cardTotal)} ({cardMarkup}% acréscimo)
                </div>
              </Card>
            )}

            {/* Financiamento */}
            {(pSettings.finance || []).length > 0 && (
              <Card padding="md">
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                  }}
                >
                  FINANCIAMENTO SOLAR
                </div>
                {pSettings.finance!.map((f, i) => {
                  const total = finalPrice * (1 + (f.totalMarkupPct || 0) / 100);
                  const inst = f.n > 0 ? total / f.n : 0;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        padding: '3px 0',
                        borderBottom:
                          i < pSettings.finance!.length - 1
                            ? '1px dashed var(--line)'
                            : 'none',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{f.n}x</span>
                      <span>
                        <b>{formatBRL(inst)}</b>{' '}
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                          ({formatBRL(total)})
                        </span>
                      </span>
                    </div>
                  );
                })}
              </Card>
            )}

            {/* Próprio */}
            {ownBoletos > 0 && (
              <Card padding="md">
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                  }}
                >
                  PARCELAMENTO PRÓPRIO
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>
                  Entrada ({ownDownPct}%): {formatBRL(ownDownValue)}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '2px' }}>
                  + {ownBoletos} boletos de {formatBRL(ownMonthly)}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Formulários de Configuração */}
      <Stack gap={4}>
        {/* À Vista & Validade */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Desconto À Vista (%)"
            variant="number"
            value={pSettings.cashDiscountPct ?? ''}
            onChange={(v) =>
              updateSettings({
                cashDiscountPct: v ? Number(v) : undefined,
              })
            }
          />
          <Input
            label="Validade da Proposta (dias)"
            variant="number"
            value={data.paymentValidityDays ?? 10}
            onChange={(v) =>
              onChange({
                ...data,
                paymentValidityDays: v ? Number(v) : undefined,
              })
            }
          />
        </div>

        {/* Cartão de Crédito */}
        <div
          style={{
            padding: '16px',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
            💳 Cartão de Crédito
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Parcelas Cartão (ex: 12)"
              variant="number"
              value={pSettings.card?.installments ?? ''}
              onChange={(v) =>
                updateSettings({
                  card: {
                    ...pSettings.card,
                    installments: v ? Number(v) : undefined,
                  },
                })
              }
            />
            <Input
              label="Acréscimo Total no Cartão (%)"
              variant="number"
              value={pSettings.card?.totalMarkupPct ?? ''}
              onChange={(v) =>
                updateSettings({
                  card: {
                    ...pSettings.card,
                    totalMarkupPct: v ? Number(v) : undefined,
                  },
                })
              }
            />
          </div>
        </div>

        {/* Financiamento Solar */}
        <div
          style={{
            padding: '16px',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <Flex justify="between" align="center" style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>
              🏦 Prazos de Financiamento
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => {
                const cur = pSettings.finance || [];
                const nextN = cur.length > 0 ? (cur[cur.length - 1].n || 60) + 12 : 60;
                const nextMarkup =
                  cur.length > 0 ? (cur[cur.length - 1].totalMarkupPct || 40) + 10 : 45;
                updateSettings({
                  finance: [...cur, { n: nextN, totalMarkupPct: nextMarkup }],
                });
              }}
            >
              Adicionar Prazo
            </Button>
          </Flex>

          <Stack gap={3}>
            {(pSettings.finance || []).map((f, idx) => (
              <Flex key={idx} gap={3} align="center">
                <div style={{ flex: 1 }}>
                  <Input
                    label={idx === 0 ? 'Parcelas (meses)' : undefined}
                    variant="number"
                    value={f.n ?? ''}
                    onChange={(v) => {
                      const updated = [...(pSettings.finance || [])];
                      updated[idx] = { ...updated[idx], n: Number(v) };
                      updateSettings({ finance: updated });
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label={idx === 0 ? 'Acréscimo Total (%)' : undefined}
                    variant="number"
                    value={f.totalMarkupPct ?? ''}
                    onChange={(v) => {
                      const updated = [...(pSettings.finance || [])];
                      updated[idx] = { ...updated[idx], totalMarkupPct: Number(v) };
                      updateSettings({ finance: updated });
                    }}
                  />
                </div>
                <div style={{ paddingTop: idx === 0 ? '24px' : '0' }}>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<TrashIcon className="w-4 h-4" />}
                    onClick={() => {
                      const updated = (pSettings.finance || []).filter(
                        (_, i) => i !== idx,
                      );
                      updateSettings({ finance: updated });
                    }}
                  />
                </div>
              </Flex>
            ))}
          </Stack>
        </div>

        {/* Parcelamento Próprio */}
        <div
          style={{
            padding: '16px',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
            📑 Parcelamento Próprio (Boletos)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Entrada Mínima (%)"
              variant="number"
              value={pSettings.own?.downPaymentPct ?? ''}
              onChange={(v) =>
                updateSettings({
                  own: {
                    ...pSettings.own,
                    downPaymentPct: v ? Number(v) : undefined,
                  },
                })
              }
            />
            <Input
              label="Número de Boletos (Parcelas)"
              variant="number"
              value={pSettings.own?.installments ?? ''}
              onChange={(v) =>
                updateSettings({
                  own: {
                    ...pSettings.own,
                    installments: v ? Number(v) : undefined,
                  },
                })
              }
            />
          </div>
        </div>
      </Stack>
    </Stack>
  );
}
