'use client';
import { ProposalData, generateTexts } from '../../lib/proposal-types';

export function CurrentReality({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const afterBill = data.monthlyBill - data.monthlySavings;
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 01</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 48px', color: 'var(--text)' }}>Sua Realidade Hoje</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Conta de Luz', value: `R$ ${data.monthlyBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: 'média mensal' },
            { label: 'Consumo', value: `${data.monthlyConsumption} kWh`, sub: 'médio mensal' },
            { label: 'Concessionária', value: data.utility, sub: 'distribuidora' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{item.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>{item.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#fef2f2', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Hoje</div>
            <div style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#991b1b' }}>
              R$ {data.monthlyBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '14px', color: '#7f1d1d', marginTop: 4 }}>por mês • pagando energia</div>
            <div style={{ fontSize: '13px', color: '#7f1d1d', marginTop: 12, opacity: 0.8 }}>R$ {(data.monthlyBill * 12).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/ano para a concessionária</div>
          </div>
          <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid var(--green-light)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Com SolarOS</div>
            <div style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--green-dark)' }}>
              R$ {afterBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '14px', color: '#166534', marginTop: 4 }}>por mês • investindo em patrimônio</div>
            <div style={{ fontSize: '13px', color: '#166534', marginTop: 12, opacity: 0.8 }}>Economia de R$ {data.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/mês</div>
          </div>
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 40 }}>{t.problem}</p>
      </div>
    </section>
  );
}
