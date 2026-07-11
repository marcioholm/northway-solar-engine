'use client';
import { ProposalData } from '../../lib/proposal-types';

export function InvestmentHero({ data }: { data: ProposalData }) {
  if (data.finalPrice == null) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)', textAlign: 'center' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 07</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>Investimento</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 40 }}>Transforme despesa em patrimônio</p>
        <div style={{ background: 'linear-gradient(135deg, var(--green), var(--green-dark))', borderRadius: 'var(--radius-xl)', padding: '48px 32px', boxShadow: 'var(--shadow-glow)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6, color: '#fff', marginBottom: 8 }}>Valor Total</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4, color: '#fff' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, marginTop: 8 }}>R$</span>
            <span style={{ fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {data.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[0]}
            </span>
            <span style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, opacity: 0.7, marginTop: 8 }}>
              ,{data.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[1]}
            </span>
          </div>
          <div style={{ margin: '24px auto', width: 60, height: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${[data.yearlySavings, data.paybackYears, data.roi].filter(v => v != null).length || 1}, 1fr)`, gap: 16, maxWidth: 500, margin: '0 auto' }}>
            {data.yearlySavings != null && (
              <div><div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>R$ {data.yearlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div><div style={{ fontSize: '11px', opacity: 0.5, color: '#fff', fontWeight: 500 }}>economia/ano</div></div>
            )}
            {data.paybackYears != null && (
              <div><div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{data.paybackYears.toFixed(1)}</div><div style={{ fontSize: '11px', opacity: 0.5, color: '#fff', fontWeight: 500 }}>anos payback</div></div>
            )}
            {data.roi != null && (
              <div><div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{data.roi}%</div><div style={{ fontSize: '11px', opacity: 0.5, color: '#fff', fontWeight: 500 }}>ROI</div></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
