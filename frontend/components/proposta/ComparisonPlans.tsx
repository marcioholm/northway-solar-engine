'use client';
import { ProposalData } from '../../lib/proposal-types';

export function ComparisonPlans({ data }: { data: ProposalData }) {
  const plans = data.optionalPlans;
  if (!plans) return null;
  const allPlans = [
    { ...plans.essential, name: 'Essencial', tag: 'Básico', highlighted: false },
    { ...plans.recommended, name: 'Recomendado', tag: 'Mais escolhido', highlighted: true },
    { ...plans.premium, name: 'Premium', tag: 'Máximo desempenho', highlighted: false },
  ];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>Comparador de Cenários</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 40 }}>Escolha o plano ideal para sua realidade</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {allPlans.map(plan => (
            <div key={plan.name} style={{ background: plan.highlighted ? 'var(--surface)' : 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: '32px 24px', border: plan.highlighted ? '2px solid var(--green)' : '1px solid var(--border)', position: 'relative', boxShadow: plan.highlighted ? 'var(--shadow-glow)' : 'none' }}>
              {plan.highlighted && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 'var(--radius-full)' }}>Recomendado</div>}
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: '12px', color: plan.highlighted ? 'var(--green)' : 'var(--text-muted)', marginBottom: 20 }}>{plan.tag}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                R$ {plan.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {[
                  { label: 'Economia/mês', value: `R$ ${plan.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` },
                  { label: 'Payback', value: `${plan.paybackYears.toFixed(1)} anos` },
                  { label: 'Módulos', value: `${plan.moduleQty}x` },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
