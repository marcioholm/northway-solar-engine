'use client';
import { ProposalData, hasSavingsData, hasFinancialData } from '../../lib/proposal-types';
import { formatBRL } from '../../lib/format';

function SavingsBar({ label, value, visible }: { label: string; value?: string | number; visible: boolean }) {
  if (!visible || value == null) return null;
  return (
    <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', textAlign: 'center', border: '1px solid var(--green-light)' }}>
      <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: 'var(--green-dark)', letterSpacing: '-0.02em' }}>{typeof value === 'number' ? formatBRL(value) : value}</div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>{label}</div>
    </div>
  );
}

export function SavingsOverview({ data }: { data: ProposalData }) {
  const hasAny = data.monthlySavings != null || data.yearlySavings != null || data.savings25Years != null || data.paybackYears != null || data.roi != null;
  if (!hasAny) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 02</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Economia Estimada</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 48 }}>
          <SavingsBar label="Economia Mensal" value={data.monthlySavings} visible={data.monthlySavings != null} />
          <SavingsBar label="Economia Anual" value={data.yearlySavings} visible={data.yearlySavings != null} />
          <SavingsBar label="Em 25 Anos" value={data.savings25Years} visible={data.savings25Years != null} />
          <SavingsBar label="Payback" value={data.paybackYears != null ? `${data.paybackYears.toFixed(1)} anos` : undefined} visible={data.paybackYears != null} />
          <SavingsBar label="ROI" value={data.roi != null ? `${data.roi}%` : undefined} visible={data.roi != null} />
        </div>
      </div>
    </section>
  );
}
