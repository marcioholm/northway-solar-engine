'use client';
import { ProposalData, hasCompanyData } from '../../lib/proposal-types';

export function CompanyAuthority({ data }: { data: ProposalData }) {
  if (!hasCompanyData(data)) return null;
  const c = data.company!;

  const metrics: { value?: string; label: string }[] = [];
  if (c.clients != null) metrics.push({ value: `${c.clients}+`, label: 'clientes atendidos' });
  if (c.yearsInMarket != null) metrics.push({ value: `${c.yearsInMarket}+`, label: 'anos de mercado' });
  if (c.satisfactionRate != null) metrics.push({ value: `${c.satisfactionRate}%`, label: 'satisfação' });
  if (c.totalProjects != null) metrics.push({ value: `${c.totalProjects}+`, label: 'projetos realizados' });
  if (c.engineers != null) metrics.push({ value: `${c.engineers}`, label: 'engenheiros' });
  if (c.googleRating != null) metrics.push({ value: `★ ${c.googleRating}`, label: 'Google' });
  if (c.totalWarranty != null) metrics.push({ value: `${c.totalWarranty}`, label: 'anos de garantia' });

  if (metrics.length === 0) return null;

  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 10</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>Por Que Escolher a {c.name}?</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 40 }}>Números que comprovam nossa atuação</p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`, gap: 16 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px 16px', border: '1px solid var(--border)' }}>
              {m.value && <div style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.02em' }}>{m.value}</div>}
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
