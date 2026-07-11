'use client';
import { ProposalData, generateTexts } from '../../lib/proposal-types';

export function WhyThisSystem({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 04</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 24px', color: 'var(--text)' }}>Por Que Escolhemos Esse Sistema?</h2>
        <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 660 }}>{t.whyThisSystem}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {t.whyPoints.map(p => (
            <div key={p.title} style={{ display: 'flex', gap: 16, padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: 28, flexShrink: 0, color: 'var(--green)', marginTop: 2 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
