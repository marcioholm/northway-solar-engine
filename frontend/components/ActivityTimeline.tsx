'use client';

interface Activity {
  time: string;
  icon: string;
  title: string;
  subtitle: string;
  color?: string;
}

interface ActivityTimelineProps {
  title: string;
  activities: Activity[];
}

export default function ActivityTimeline({ title, activities }: ActivityTimelineProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {activities.map((act, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <time style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            minWidth: '44px',
            paddingTop: '2px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {act.time}
          </time>
          <span style={{
            width: '28px', height: '28px',
            borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            background: act.color || '#f0f5eb',
            color: act.color ? 'white' : 'var(--green-dark)',
            fontSize: '13px',
            flexShrink: 0,
          }}>
            {act.icon}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{act.title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '1px' }}>{act.subtitle}</div>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
          Nenhuma atividade hoje
        </p>
      )}
    </div>
  );
}
