import { Metadata } from 'next';
import { FinanceView } from '@/components/finance/FinanceView';

export const metadata: Metadata = {
  title: 'Financeiro - NorthWay Solar Engine',
};

export default function FinancePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Visão Financeira</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Acompanhamento de custos e recebimentos das obras.</p>
      </div>
      <div style={{ flex: 1, padding: '32px' }}>
        <FinanceView />
      </div>
    </div>
  );
}
