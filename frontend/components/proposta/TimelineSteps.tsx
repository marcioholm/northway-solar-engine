'use client';
import { ProposalData } from '../../lib/proposal-types';

export function TimelineSteps({ data }: { data: ProposalData }) {
  if (!data.timeline || data.timeline.length === 0) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 09</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Etapas Previstas</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
          Os prazos mencionados são estimativas baseadas em projetos anteriores. O cronograma real depende de fatores como condições climáticas, disponibilidade de materiais e agenda da concessionária.
        </p>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
          {data.timeline.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 20, paddingBottom: i < data.timeline!.length - 1 ? 24 : 0, position: 'relative' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? 'var(--green)' : 'var(--surface)', border: `2px solid ${i === 0 ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: 12, fontWeight: 700, color: i === 0 ? '#fff' : 'var(--text-muted)' }}>{i + 1}</div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{step.label}</h3>
                  {step.duration && <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{step.duration}</span>}
                </div>
                {step.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>{step.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
