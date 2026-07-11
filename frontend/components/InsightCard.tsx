'use client';

interface Insight {
  type: 'warn' | 'money' | 'winner';
  title: string;
  description: string;
}

interface InsightCardProps {
  insights: Insight[];
}

const INSIGHT_STYLES = {
  warn: { bg: '#fefce8', border: '#fde68a', icon: '!', iconBg: '#fbbf24', iconColor: '#fff' },
  money: { bg: '#f0fdf4', border: '#bbf7d0', icon: 'R$', iconBg: '#8fd63a', iconColor: '#fff' },
  winner: { bg: '#eff6ff', border: '#bfdbfe', icon: '★', iconBg: '#60a5fa', iconColor: '#fff' },
};

export default function InsightCard({ insights }: InsightCardProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {insights.map((insight, i) => {
        const style = INSIGHT_STYLES[insight.type];
        return (
          <div key={i} style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            background: style.bg,
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${style.border}`,
          }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              background: style.iconBg,
              color: style.iconColor,
              fontWeight: 800,
              fontSize: '13px',
              flexShrink: 0,
              marginTop: '2px',
            }}>
              {style.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{insight.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>{insight.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
