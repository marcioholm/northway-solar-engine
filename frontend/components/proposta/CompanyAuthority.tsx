'use client';
import { ProposalData, DEFAULT_COMPANY } from '../../lib/proposal-types';

export function CompanyAuthority({ data }: { data: ProposalData }) {
  const c = data.company || DEFAULT_COMPANY;
  const metrics = [
    { value: `${c.clients}+`, label: 'clientes atendidos' },
    { value: `${c.yearsInMarket}+`, label: 'anos de mercado' },
    { value: `${c.satisfactionRate}%`, label: 'satisfação' },
    { value: `${c.totalProjects}+`, label: 'projetos realizados' },
  ];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 10</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)' }}>Por Que Escolher a {c.name}?</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 40 }}>Números que comprovam nossa excelência</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '28px 16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.02em' }}>{m.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Equipe Técnica</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green)' }}>{c.engineers}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>engenheiros</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Avaliações</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green)' }}>★ {c.googleRating}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Google</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Garantia Total</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green)' }}>{c.totalWarranty}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>anos</div>
          </div>
        </div>
      </div>
    </section>
  );
}
