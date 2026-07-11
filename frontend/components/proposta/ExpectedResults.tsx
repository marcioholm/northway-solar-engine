'use client';
import { ProposalData } from '../../lib/proposal-types';

function MiniLineChart({ data: values, color, height = 80 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...values, 1);
  const w = 200;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${height - (v / max) * (height - 20) - 10}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaybackGauge({ years }: { years: number }) {
  const pct = Math.min(years / 30, 1);
  const r = 40;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100, height: 100 }}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle cx={50} cy={50} r={r} fill="none" stroke="var(--green)" strokeWidth={6} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90, 50, 50)" strokeLinecap="round" />
      <text x={50} y={46} textAnchor="middle" fontSize={18} fontWeight={800} fill="var(--text)">{years.toFixed(1)}</text>
      <text x={50} y={60} textAnchor="middle" fontSize={9} fill="var(--text-muted)">anos</text>
    </svg>
  );
}

export function ExpectedResults({ data }: { data: ProposalData }) {
  const generationData = Array.from({ length: 12 }, (_, i) => {
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.15;
    return Math.round(data.monthlyConsumption * (0.85 + seasonal));
  });
  const savingsData = Array.from({ length: 25 }, (_, i) => Math.round(data.yearlySavings * (i + 1) * (1 + i * 0.005)));
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 05</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 40px', color: 'var(--text)' }}>Resultados Esperados</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Geração x Consumo</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>Sazonalidade mensal</div>
            <MiniLineChart data={generationData} color="var(--green)" />
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Economia Acumulada</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>Em 25 anos</div>
            <MiniLineChart data={savingsData} color="var(--green)" height={90} />
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Payback</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><PaybackGauge years={data.paybackYears} /></div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 8 }}>Retorno do investimento</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Fluxo de Caixa</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
              {[0, 1, 2, 3, 4, 5, 10].map(y => {
                const saved = y === 0 ? -data.finalPrice : data.yearlySavings * y - data.finalPrice;
                const h = Math.max(4, (saved + data.finalPrice) / (data.savings25Years / 25 / 2) * 50);
                const isPositive = saved >= 0;
                return (
                  <div key={y} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: Math.min(h, 50), background: isPositive ? 'var(--green)' : '#f87171', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{y === 0 ? 'hoje' : `${y}a`}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>Ano 0 (investimento) até ano 10</div>
          </div>
        </div>
      </div>
    </section>
  );
}
