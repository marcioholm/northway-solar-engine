'use client';

interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
}

export default function ConversionFunnel({ stages }: ConversionFunnelProps) {
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
      {stages.map((stage, i) => (
        <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ minWidth: '80px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {stage.label}
          </span>
          <div style={{
            flex: 1,
            height: '32px',
            background: '#f0f5eb',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%',
              width: `${(stage.count / maxCount) * 100}%`,
              background: stage.color || (i === 0
                ? 'linear-gradient(90deg, #8fd63a, #6db522)'
                : i === stages.length - 1
                  ? 'linear-gradient(90deg, #6db522, #4a8f1a)'
                  : `linear-gradient(90deg, rgba(143,214,58,${1 - i * 0.2}), rgba(109,181,34,${1 - i * 0.2}))`),
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              transition: 'width 0.5s ease',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                {stage.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
