'use client';
import { ProposalData } from '../../lib/proposal-types';

export function CostOfNotInvesting({ data }: { data: ProposalData }) {
  const years = [5, 10, 15, 20, 25];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)', color: '#fff' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: '#fff' }}>O Custo de Não Investir</h2>
        <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: 40, color: '#fff' }}>Enquanto você espera, seu dinheiro vai para a concessionária</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40, textAlign: 'left' }}>
          {years.map(y => {
            const paid = data.monthlyBill * 12 * y;
            const saved = data.yearlySavings * y;
            return (
              <div key={y} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, color: '#fff' }}>Em {y} anos</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', opacity: 0.6, color: '#fff' }}>Pago à concessionária</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#f87171' }}>R$ {paid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                  <span style={{ fontSize: '13px', opacity: 0.6, color: '#fff' }}>Deixou de economizar</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80' }}>R$ {saved.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-xl)', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '13px', opacity: 0.6, marginBottom: 8, color: '#fff' }}>Em 25 anos</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f87171' }}>R$ {(data.monthlyBill * 12 * 25).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
              <div style={{ fontSize: '12px', opacity: 0.5, color: '#fff' }}>Pagando energia</div>
            </div>
            <div style={{ fontSize: 28, opacity: 0.3, alignSelf: 'center' }}>×</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#4ade80' }}>R$ {data.savings25Years.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
              <div style={{ fontSize: '12px', opacity: 0.5, color: '#fff' }}>Investindo em patrimônio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
