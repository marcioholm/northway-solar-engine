'use client';

interface GoalRingProps {
  percentage: number;
  current: string;
  total: string;
  label: string;
  daysLeft: string;
}

export default function GoalRing({ percentage, current, total, label, daysLeft }: GoalRingProps) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
      <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e8ece4" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke="url(#goalGrad)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 44 44)"
          />
          <defs>
            <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8fd63a" />
              <stop offset="100%" stopColor="#6db522" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeItems: 'center',
          fontSize: '18px', fontWeight: 800,
        }}>
          {percentage}%
        </div>
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.2 }}>{current}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>de {total}</div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green-dark)', marginTop: '4px' }}>{daysLeft}</div>
      </div>
    </div>
  );
}
