'use client';
import { ProposalData, generateTexts } from '../../lib/proposal-types';

export function EnvironmentalImpact({ data }: { data: ProposalData }) {
  const t = generateTexts(data);
  const items = [
    { icon: '🌳', value: data.treesPreserved.toLocaleString('pt-BR'), label: 'árvores preservadas por ano' },
    { icon: '🌬', value: `${data.co2Avoided}`, label: 'toneladas de CO₂ evitados' },
    { icon: '☀', value: `${data.cleanEnergyKwh.toLocaleString('pt-BR')}`, label: 'kWh de energia limpa gerados' },
    { icon: '🚗', value: `${data.carsEquivalent}`, label: 'carros retirados de circulação' },
  ];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>Capítulo 06</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 48px', color: '#fff' }}>Impacto Ambiental</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {items.map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-xl)', padding: '28px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>{item.value}</div>
              <div style={{ fontSize: '13px', opacity: 0.6, marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.7, opacity: 0.75, maxWidth: 600, margin: '0 auto' }}>{t.environmental}</p>
      </div>
    </section>
  );
}
