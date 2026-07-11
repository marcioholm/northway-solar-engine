'use client';

interface SourceItem {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

interface SourceChartProps {
  sources: SourceItem[];
  total: number;
}

const COLORS = ['#8fd63a', '#6db522', '#fbbf24', '#60a5fa', '#a78bfa'];

export default function SourceChart({ sources, total }: SourceChartProps) {
  const items = sources.length > 0 ? sources : [
    { source: 'Instagram', count: 0, percentage: 0, color: COLORS[0] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {items.map((item, i) => {
              const r = 38;
              const c = 2 * Math.PI * r;
              const totalPct = items.slice(0, i).reduce((s, x) => s + (x.percentage || 0), 0);
              const pct = item.percentage || (item.count / (total || 1)) * 100;
              const offset = c - (pct / 100) * c;
              return (
                <circle
                  key={item.source}
                  cx="50" cy="50" r={r}
                  fill="none"
                  stroke={item.color || COLORS[i % COLORS.length]}
                  strokeWidth="10"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform={`rotate(${(totalPct / 100) * 360 - 90} 50 50)`}
                />
              );
            })}
            {items.length === 0 && (
              <circle cx="50" cy="50" r="38" fill="none" stroke="#e8ece4" strokeWidth="10" />
            )}
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{total}</div>
              <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>Leads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={item.source} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: item.color || COLORS[i % COLORS.length],
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', flex: 1 }}>{item.source}</span>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>
              {item.percentage || Math.round((item.count / (total || 1)) * 100)}%
            </span>
          </div>
        ))}
        {sources.length === 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
            Nenhuma origem registrada
          </p>
        )}
      </div>
    </div>
  );
}
