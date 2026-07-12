'use client';

import { CreditCardIcon, BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { StepCard, Field } from './_shared';
import { formatPercent } from '../../../lib/format';

export function PaymentOverview({ project }: { project: any; onUpdate: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StepCard icon={<BanknotesIcon style={{ width: 16, height: 16 }} />} title="À Vista">
        <Field label="Desconto à Vista" value={project.paymentCashDiscount != null ? formatPercent(project.paymentCashDiscount) : undefined} />
      </StepCard>

      <StepCard icon={<CreditCardIcon style={{ width: 16, height: 16 }} />} title="Cartão de Crédito">
        <Field label="Taxa" value={project.paymentCardTax != null ? formatPercent(project.paymentCardTax) : undefined} />
        <Field label="Parcelas" value={project.paymentCardInstallments ? `${project.paymentCardInstallments}x` : undefined} />
      </StepCard>

      <StepCard icon={<CalendarDaysIcon style={{ width: 16, height: 16 }} />} title="Financiamento">
        <Field label="Taxa" value={project.paymentFinanceTax != null ? formatPercent(project.paymentFinanceTax) : undefined} />
        <Field label="Parcelas" value={project.paymentFinanceInstallments ? `${project.paymentFinanceInstallments}x` : undefined} />
        <Field label="Validade" value={project.paymentValidityDays ? `${project.paymentValidityDays} dias` : undefined} />
      </StepCard>
    </div>
  );
}
