'use client';
import { ProposalData } from '../../lib/proposal-types';

export function Testimonials({ data }: { data: ProposalData }) {
  if (!data.testimonials || data.testimonials.length === 0) return null;

  return (
    <section className="proposal-page" style={{ padding: '60px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)', textAlign: 'center' }}>O Que Nossos Clientes Dizem</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 36 }}>Depoimentos reais de clientes atendidos</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {data.testimonials.map((t, i) => (
            <div key={i} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green-dark)' }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
                  {t.city && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.city}</div>}
                </div>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 10px' }}>"{t.text}"</p>
              {t.savings != null && <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)' }}>Economia de R$ {t.savings}/mês</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
