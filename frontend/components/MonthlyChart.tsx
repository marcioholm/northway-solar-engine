'use client';

interface MonthlyChartProps {
  proposals: number[];
  sales: number[];
  labels?: string[];
}

export default function MonthlyChart({ proposals, sales }: MonthlyChartProps) {
  const w = 600;
  const h = 180;
  const maxVal = Math.max(...proposals, ...sales, 1);

  const toPoint = (vals: number[], i: number) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - (vals[i] / maxVal) * (h - 20) - 10;
    return `${x},${y}`;
  };

  const proposalPath = proposals.map((_, i) => toPoint(proposals, i)).join(' ');
  const salesPath = sales.map((_, i) => toPoint(sales, i)).join(' ');

  if (proposals.length === 0) {
    return (
      <div style={{ height: '180px', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        Sem dados suficientes
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '180px' }}>
      <polyline
        points={proposalPath}
        fill="none"
        stroke="#8fd63a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={salesPath}
        fill="none"
        stroke="#6db522"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 3"
      />
    </svg>
  );
}
