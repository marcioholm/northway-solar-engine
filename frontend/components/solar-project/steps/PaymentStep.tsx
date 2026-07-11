'use client';

import { Input } from '../../ui/Input';
import { Text } from '../../primitives/Text';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Card } from '../../ui/Card';
import { formatBRL } from '../../../lib/format';

interface PaymentData {
  paymentCashDiscount: number;
  paymentCardTax: number;
  paymentCardInstallments: number;
  paymentFinanceTax: number;
  paymentFinanceInstallments: number;
  paymentValidityDays: number;
  pricingFinalPrice: number;
}

export function PaymentStep({ data, onChange }: { data: Partial<PaymentData>; onChange: (d: Partial<PaymentData>) => void }) {
  const setNumber = (key: string, val: string) => onChange({ ...data, [key]: val ? Number(val) : undefined });

  const finalPrice = data.pricingFinalPrice || 0;
  const cashDiscount = data.paymentCashDiscount || 0;
  const cardTax = data.paymentCardTax || 0;
  const financeTax = data.paymentFinanceTax || 0;
  const cardInstallments = data.paymentCardInstallments || 12;
  const financeInstallments = data.paymentFinanceInstallments || 60;

  const cashPrice = finalPrice * (1 - cashDiscount / 100);
  const cardMonthly = finalPrice * (1 + cardTax / 100) / cardInstallments;
  const financeMonthly = finalPrice * (1 + financeTax / 100) / financeInstallments;

  return (
    <Stack gap={5}>
      <div>
        <Text variant="h3">Condições de Pagamento</Text>
        <Text variant="body" color="secondary">Configure as formas de pagamento para o cliente.</Text>
      </div>

      {finalPrice > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Card padding="md" variant="highlight">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green-dark)', letterSpacing: '0.05em', marginBottom: '4px' }}>À VISTA</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-dark)' }}>{formatBRL(cashPrice)}</div>
            {cashDiscount > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--green-dark)', opacity: 0.7, marginTop: '4px' }}>
                {cashDiscount}% de desconto
              </div>
            )}
          </Card>
          <Card padding="md">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>CARTÃO</div>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>{cardInstallments}x de {formatBRL(cardMonthly)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total: {formatBRL(cardMonthly * cardInstallments)}
            </div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>FINANCIAMENTO</div>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>{financeInstallments}x de {formatBRL(financeMonthly)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total: {formatBRL(financeMonthly * financeInstallments)}
            </div>
          </Card>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input label="Desconto à Vista (%)" variant="number" value={data.paymentCashDiscount ?? ''} onChange={v => setNumber('paymentCashDiscount', v)} />
        <Input label="Taxa Cartão (%)" variant="number" value={data.paymentCardTax ?? ''} onChange={v => setNumber('paymentCardTax', v)} />
        <Input label="Parcelas Cartão" variant="number" value={data.paymentCardInstallments ?? ''} onChange={v => setNumber('paymentCardInstallments', v)} />
        <Input label="Taxa Financiamento (%)" variant="number" value={data.paymentFinanceTax ?? ''} onChange={v => setNumber('paymentFinanceTax', v)} />
        <Input label="Parcelas Financiamento" variant="number" value={data.paymentFinanceInstallments ?? ''} onChange={v => setNumber('paymentFinanceInstallments', v)} />
        <Input label="Validade da Proposta (dias)" variant="number" value={data.paymentValidityDays ?? ''} onChange={v => setNumber('paymentValidityDays', v)} />
      </div>
    </Stack>
  );
}
