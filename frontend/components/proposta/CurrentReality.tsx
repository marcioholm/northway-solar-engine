'use client';
import { ProposalData, generateTexts, hasSavingsData } from '../../lib/proposal-types';

export function CurrentReality({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const hasData = data.monthlyBill != null || data.consumption != null || data.utility;
  if (!hasData) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 01</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Sua Realidade Hoje</h2>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${[data.monthlyBill, data.consumption, data.utility].filter(Boolean).length || 1}, 1fr)`, gap: 16, marginBottom: 48 }}>
          {data.monthlyBill != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Conta de Luz</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>R$ {data.monthlyBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>média mensal</div>
            </div>
          )}
          {data.consumption != null && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Consumo</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{data.consumption} kWh</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>médio mensal</div>
            </div>
          )}
          {data.utility && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Concessionária</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{data.utility}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>distribuidora</div>
            </div>
          )}
        </div>
        {hasSavingsData(data) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: '#fef2f2', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Hoje</div>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#991b1b' }}>R$ {data.monthlyBill!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: '14px', color: '#7f1d1d', marginTop: 4 }}>por mês • pagando energia</div>
            </div>
            <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid var(--green-light)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Com Energia Solar</div>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--green-dark)' }}>R$ {Math.max(0, data.monthlyBill! - data.monthlySavings!).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: '14px', color: '#166534', marginTop: 4 }}>por mês • economia estimada</div>
              <div style={{ fontSize: '13px', color: '#166534', marginTop: 12, opacity: 0.8 }}>Economia de R$ {data.monthlySavings!.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/mês</div>
            </div>
          </div>
        )}
        {t.heroText && <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 40 }}>{t.heroText}</p>}
      </div>
    </section>
  );
}
