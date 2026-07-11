'use client';
import { ProposalData } from '../../lib/proposal-types';

function BarChart({ data: d }: { data: ProposalData }) {
  const years = 25;
  const withoutSolar = Array.from({ length: years }, (_, i) => d.monthlyBill * 12 * (i + 1));
  const withSolar = Array.from({ length: years }, (_, i) => {
    const yearlyCost = (d.monthlyBill - d.monthlySavings) * 12;
    return d.finalPrice + yearlyCost * (i + 1);
  });
  const max = Math.max(...withoutSolar, ...withSolar);
  const w = 600;

  return (
    <svg viewBox={`0 0 ${w} 200`} style={{ width: '100%', maxWidth: w, height: 200 }}>
      {[0, 5, 10, 15, 20, 25].map(y => {
        const cost = d.monthlyBill * 12 * y;
        const x = (y / 25) * (w - 60) + 30;
        return <text key={y} x={x} y={195} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{y}a</text>;
      })}
      {withoutSolar.map((v, i) => {
        const x = (i / years) * (w - 60) + 30;
        const h = (v / max) * 140;
        return <rect key={`wo-${i}`} x={x - 4} y={155 - h} width={6} height={h} rx={2} fill="#f87171" opacity={0.7} />;
      })}
      {withSolar.map((v, i) => {
        const x = (i / years) * (w - 60) + 30;
        const saved = withoutSolar[i] - v;
        const h = (saved / max) * 140;
        return <rect key={`w-${i}`} x={x + 4} y={155 - Math.max(0, h)} width={6} height={Math.max(0, h)} rx={2} fill="var(--green)" opacity={0.8} />;
      })}
      <line x1={28} y1={155} x2={w - 28} y2={155} stroke="var(--border)" strokeWidth={1} />
      <text x={10} y={150} fontSize={9} fill="var(--text-muted)" transform="rotate(-90, 10, 150)">Custo acumulado</text>
      <rect x={w - 140} y={8} width={12} height={12} rx={2} fill="#f87171" opacity={0.7} />
      <text x={w - 124} y={18} fontSize={10} fill="var(--text-secondary)">Sem solar</text>
      <rect x={w - 68} y={8} width={12} height={12} rx={2} fill="var(--green)" opacity={0.8} />
      <text x={w - 52} y={18} fontSize={10} fill="var(--text-secondary)">Economia</text>
    </svg>
  );
}

export function SavingsOverview({ data }: { data: ProposalData }) {
  const savings = [
    { label: 'Economia Mensal', value: `R$ ${data.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: 'Economia Anual', value: `R$ ${data.yearlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: 'Em 25 Anos', value: `R$ ${data.savings25Years.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: 'Payback', value: `${data.paybackYears.toFixed(1)} anos` },
    { label: 'ROI', value: `${data.roi}%` },
  ];
  return (
    <section className="proposal-page" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>Capítulo 02</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 48px', color: 'var(--text)' }}>Economia Estimada</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 48 }}>
          {savings.map(s => (
            <div key={s.label} style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', textAlign: 'center', border: '1px solid var(--green-light)' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: 'var(--green-dark)', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Custo acumulado: sem energia solar vs economia gerada</div>
          <BarChart data={data} />
        </div>
      </div>
    </section>
  );
}
