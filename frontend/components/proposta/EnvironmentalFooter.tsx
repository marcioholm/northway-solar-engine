'use client';
import { ProposalData, hasEnvironmentalData } from '../../lib/proposal-types';

export function EnvironmentalFooter({ data }: { data: ProposalData }) {
  if (!hasEnvironmentalData(data)) return null;

  return (
    <section className="proposal-page" style={{ padding: '24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', borderTop: '1px solid var(--surface-muted)', paddingTop: 24, textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        🌳 {data.treesPreserved?.toLocaleString('pt-BR')} árvores preservadas · 🌍 {data.co2Avoided?.toLocaleString('pt-BR')} ton CO₂ evitadas em 25 anos
      </div>
    </section>
  );
}
