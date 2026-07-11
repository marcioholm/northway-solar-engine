'use client';
import { ProposalData, DEFAULT_TESTIMONIALS } from '../../lib/proposal-types';

export function Testimonials({ data }: { data: ProposalData }) {
  const testimonials = data.testimonials.length > 0 ? data.testimonials : DEFAULT_TESTIMONIALS[data.profile];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)', textAlign: 'center' }}>O Que Nossos Clientes Dizem</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40 }}>Histórias reais de economia</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green-dark)' }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.city}</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 12px' }}>"{t.text}"</p>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)' }}>Economia de R$ {t.savings}/mês</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
