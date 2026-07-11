'use client';
import { ProposalData, hasSavingsData, hasFinancialData } from '../../lib/proposal-types';

export function ExpectedResults({ data }: { data: ProposalData }) {
  if (!hasSavingsData(data) && !hasFinancialData(data)) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 05</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Resultados Esperados</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {data.yearlySavings != null && data.finalPrice != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Economia Anual</div>
              <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: 'var(--green-dark)', letterSpacing: '-0.02em' }}>
                R$ {data.yearlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 4 }}>Valor que deixa de pagar à concessionária por ano</div>
            </div>
          )}
          {data.paybackYears != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Payback</div>
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.02em' }}>{data.paybackYears.toFixed(1)}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 4 }}>anos para retorno do investimento</div>
            </div>
          )}
          {data.roi != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>ROI</div>
              <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: 'var(--green-dark)', letterSpacing: '-0.02em' }}>{data.roi}%</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 4 }}>Retorno sobre o investimento</div>
            </div>
          )}
          {data.savings25Years != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Economia em 25 Anos</div>
              <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: 'var(--green-dark)', letterSpacing: '-0.02em' }}>
                R$ {data.savings25Years.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 4 }}>Economia acumulada ao longo da vida útil do sistema</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
