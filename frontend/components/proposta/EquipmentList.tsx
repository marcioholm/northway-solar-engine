'use client';
import { ProposalData } from '../../lib/proposal-types';

const ICONS: Record<string, string> = {
  module: '☀',
  inverter: '◉',
  structure: '▤',
  stringBox: '◫',
};

export function EquipmentList({ data }: { data: ProposalData }) {
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 03</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 48px', color: 'var(--text)' }}>Seu Sistema</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {data.equipment.map((eq, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ height: 140, background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'var(--green)' }}>{ICONS[eq.type] || '◈'}</div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{eq.quantity}x</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{eq.brand}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 8 }}>{eq.model}{eq.power ? ` • ${eq.power}` : ''}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Garantia: {eq.warranty}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {eq.benefits.map((b, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--green)', fontSize: '10px' }}>●</span> {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
