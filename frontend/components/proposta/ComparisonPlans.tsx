'use client';
import { ProposalData } from '../../lib/proposal-types';
import { formatBRL } from '../../lib/format';

export function ComparisonPlans({ data }: { data: ProposalData }) {
  const plans = data.optionalPlans;
  if (!plans?.recommended?.finalPrice) return null;

  const allPlans: { name: string; finalPrice?: number; monthlySavings?: number; paybackYears?: number; moduleQty?: number }[] = [];
  if (plans.essential?.finalPrice != null) allPlans.push({ name: 'Essencial', ...plans.essential });
  if (plans.recommended?.finalPrice != null) allPlans.push({ name: 'Recomendado', ...plans.recommended });
  if (plans.premium?.finalPrice != null) allPlans.push({ name: 'Premium', ...plans.premium });

  if (allPlans.length < 2) return null;

  return (
    <section className="proposal-page" style={{ padding: '60px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>Comparador de Cenários</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 36 }}>Opções de sistema para sua necessidade</p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${allPlans.length}, 1fr)`, gap: 16 }}>
          {allPlans.map(plan => (
            <div key={plan.name} style={{ background: plan.name === 'Recomendado' ? 'var(--surface)' : 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: '28px 20px', border: plan.name === 'Recomendado' ? '2px solid var(--green)' : '1px solid var(--border)', position: 'relative', boxShadow: plan.name === 'Recomendado' ? 'var(--shadow-glow)' : 'none' }}>
              {plan.name === 'Recomendado' && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: '#fff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>Mais indicado</div>}
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>{plan.name}</div>
              {plan.finalPrice != null && <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 16 }}>{formatBRL(plan.finalPrice)}</div>}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {plan.monthlySavings != null && <Row label="Economia/mês" value={`R$ ${plan.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />}
                {plan.paybackYears != null && <Row label="Payback" value={`${plan.paybackYears.toFixed(1)} anos`} />}
                {plan.moduleQty != null && <Row label="Módulos" value={`${plan.moduleQty}x`} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6 }}>
      <span>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
